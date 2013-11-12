#!/usr/bin/env python

import datetime, json
from flask import request, Blueprint
from mdb import mongo_dbs, minicd_inner

MAX_IMG_SHOW_LEN = 100

bml_take = Blueprint('bml_take', __name__)
bml_save = Blueprint('bml_save', __name__)

@bml_take.route('/bml_feeds/', methods=['GET'])
def take_bml():

    mongo = mongo_dbs[minicd_inner]

    feed_value = None
    feed_param = 'feed'
    if feed_param in request.args:
        feed_value = str(request.args[feed_param])

    if feed_value is not None:
        tags = []
        terms = []
        cursor = mongo.db.ubi_feeds.find({'feed': feed_value})
        for entry in cursor:
            tags += entry['tags']
            terms += entry['terms']

        tag_string = 'window._ubi_cd["page_tags"] = ' + json.dumps(tags) + ';\n'
        term_string = 'window._ubi_cd["search_terms"] = ' + json.dumps(terms) + ';\n'

        return (tag_string + term_string, 200, {'Content-Type': 'application/javascript'})

    snippets = []

    session_value = None
    session_param = 'session'
    if session_param in request.args:
        session_value = str(request.args[session_param])

        if session_value:
            cursor = mongo.db.snippets.find({'session': session_value}).sort([('created', -1)])
            for entry in cursor:
                entry['_id'] = str(entry['_id'])
                entry['created'] = entry['created'].isoformat() if not None else None
                if MAX_IMG_SHOW_LEN and entry['image_png'] and (MAX_IMG_SHOW_LEN < len(entry['image_png'])):
                    entry['image_png'] = entry['image_png'][:MAX_IMG_SHOW_LEN] + '...'
                snippets.append(entry)
            return (json.dumps(snippets), 200, {'Content-Type': 'application/json'})

    got_ref = None
    ref_param = 'user'
    if ref_param in request.args:
        got_ref = str(request.args[ref_param])

    if got_ref is None:
        return '<html><body><div style="display:none">placeholder</div></body></html>'

    if '*' == got_ref:
        cursor = mongo.db.snippets.find()
    else:
        cursor = mongo.db.snippets.find({'user': got_ref})
    cursor.sort([('created', -1)])
    for entry in cursor:
        entry['_id'] = str(entry['_id'])
        entry['created'] = entry['created'].isoformat() if not None else None
        snippets.append(entry)

    return (json.dumps(snippets), 200, {'Content-Type': 'application/json'})

@bml_save.route('/bml_feeds/', methods=['POST'])
def save_bml():

    mongo = mongo_dbs[minicd_inner]

    snippet = {}
    snippet['user'] = None;
    snippet['session'] = None;
    snippet['provider'] = None;
    snippet['created'] = datetime.datetime.utcnow();

    for part in snippet:
        if part in request.form:
            snippet[part] = str(request.form[part].encode('utf8'))

    for part in snippet:
        if snippet[part] is None:
            return 'not all data provided', 404

    snippet_payload = {}
    snippet_payload['text_snippet'] = None;
    snippet_payload['image_title'] = None;
    snippet_payload['image_url'] = None;
    snippet_payload['image_png'] = None;

    got_payload = False
    for part in snippet_payload:
        if part in request.form:
            snippet_payload[part] = str(request.form[part].encode('utf8'))
            got_payload = True
        snippet[part] = snippet_payload[part]

    if not got_payload:
        return 'no payload provided', 404

    snippet_other = {}
    snippet_other['page_title'] = None;
    snippet_other['comment'] = None;
    snippet_other['provider'] = None;

    for part in snippet_other:
        if part in request.form:
            snippet_other[part] = str(request.form[part].encode('utf8'))
        snippet[part] = snippet_other[part]

    tags_param = 'tags'
    tags_value = []
    if (tags_param in request.form) and request.form[tags_param]:
        try:
            tags_struct = json.loads(request.form[tags_param])
            if type(tags_struct) != list:
                return 'wrong tags part, not a list', 404
            for one_tag in tags_struct:
                one_tag = one_tag.encode('utf8')
                if type(one_tag) != str:
                    return 'wrong tags part, a tag not a string', 404
                if one_tag:
                    tags_value.append(one_tag)
        except:
            return 'wrong tags part, not correct json', 404
    snippet[tags_param] = tags_value

    snippet_id = mongo.db.snippets.insert(snippet)

    return str(snippet_id)
