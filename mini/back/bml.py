#!/usr/bin/env python

import datetime, json
from flask import request, Blueprint
from mdb import mongo_dbs, minicd_inner

bml_take = Blueprint('bml_take', __name__)
bml_save = Blueprint('bml_save', __name__)

@bml_take.route('/bml_feeds/', methods=['GET'])
def take_bml():

    mongo = mongo_dbs[minicd_inner]

    tag_feed = None
    tag_param = 'tags'
    if tag_param in request.args:
        tag_feed = str(request.args[tag_param])

    if tag_feed is not None:
        tags = []
        cursor = mongo.db.tags.find({'feed': tag_feed})
        for entry in cursor:
            tags += entry['tags']

        tag_string = 'window.cd_terms = ' + json.dumps(tags) + ';\n'

        return (tag_string, 200, {'Content-Type': 'application/javascript'})

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

    snippet_id = mongo.db.snippets.insert(snippet)

    return str(snippet_id)
