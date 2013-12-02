#!/usr/bin/env python

import datetime, json
from flask import request, Blueprint
from mdb import mongo_dbs, minicd_inner

MAX_IMG_SHOW_LEN = 100

ubi_take = Blueprint('ubi_take', __name__)
ubi_save = Blueprint('ubi_save', __name__)

@ubi_take.route('/ubi_feeds/', methods=['GET'])
def take_ubi():
    mongo = mongo_dbs[minicd_inner]

    feed_value = None
    feed_param = 'feed'
    if feed_param in request.args:
        feed_value = str(request.args[feed_param])

    if feed_value is not None:
        tags = []
        search = []
        cursor = mongo.db.ubi_feeds.find({'feed': feed_value})
        for entry in cursor:
            if 'tags' in entry:
                tags += entry['tags']
            if 'search' in entry:
                search += entry['search']

        feed_info = 'window._ubi_cd_feeds = {\n'
        feed_info += '"page_tags" : ' + json.dumps(tags) + ',\n'
        feed_info += '"search_terms" : ' + json.dumps(search) + '\n'
        feed_info += '};'

        return (feed_info, 200, {'Content-Type': 'application/javascript'})

    snippets = []

    session_value = None
    session_param = 'session'
    if session_param in request.args:
        session_value = str(request.args[session_param])

        if session_value:

            count_value = None
            count_param = 'count_only'
            if count_param in request.args:
                count_value = str(request.args[count_param])
                if 'true' == count_value.lower():
                    session_count = str(mongo.db.snippets.find({'session_id': session_value}).count())
                    count_output = 'window._ubi_cd_runtime["session_count"] = ' + session_count + ';'
                    return (count_output, 200, {'Content-Type': 'application/javascript'})

            cursor = mongo.db.snippets.find({'session_id': session_value}).sort([('created', -1)])
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

@ubi_save.route('/ubi_feeds/', methods=['POST', 'OPTIONS'])
def save_ubi():
    #to save info on user; ip, browser info, geo-info, ... ((what about cookies?))
    #some cookies, for preferences? probably not, since working on various domains

    headers = {}
    headers['Access-Control-Allow-Origin'] = '*'

    if 'OPTIONS' == request.method.upper():
        return ('OK', 200, headers)

    ping_part = 'ping'
    if ping_part in request.form:
        ping_val = str(request.form[ping_part].encode('utf8'))
        if 'true' == ping_val.lower():
            return ('OK', 200, headers)

    mongo = mongo_dbs[minicd_inner]

    snippet = {}
    snippet['user_id'] = None;
    snippet['bookmark_id'] = None;
    snippet['user_name'] = None;
    snippet['session_id'] = None;
    snippet['provider'] = None;
    snippet['page_type'] = None;
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

    snippet_payload_boolean = ['page_info']
    for boolean_payload_part in snippet_payload_boolean:
        snippet_payload[boolean_payload_part] = False;

    got_payload = False
    for part in snippet_payload:
        if part in request.form:
            cur_payload = str(request.form[part].encode('utf8'))
            if cur_payload:
                if part in snippet_payload_boolean:
                    if 'true' == cur_payload.lower():
                        snippet_payload[part] = True
                        got_payload = True
                else:
                    snippet_payload[part] = cur_payload
                    got_payload = True
        snippet[part] = snippet_payload[part]

    if not got_payload:
        return 'no payload provided', 404

    snippet_other = {}
    snippet_other['page_title'] = None;
    snippet_other['comment'] = None;
    snippet_other['provider'] = None;
    snippet_other['specific_id'] = None;

    for part in snippet_other:
        if part in request.form:
            snippet_other[part] = str(request.form[part].encode('utf8'))
        snippet[part] = snippet_other[part]

    snippet_other_int = {}
    snippet_other_int['priority'] = None;

    for part in snippet_other_int:
        if part in request.form:
            try:
                snippet_other_int[part] = int(request.form[part])
            except:
                snippet_other_int[part] = None
        snippet[part] = snippet_other_int[part]

    snippet_other_json = {}
    snippet_other_json['ergonomy'] = None;
    snippet_other_json['specific_info'] = None;

    for part in snippet_other_json:
        if part in request.form:
            if request.form[part]:
                try:
                    snippet_other_json[part] = json.loads(request.form[part])
                except:
                    snippet_other_json[part] = None
        snippet[part] = snippet_other_json[part]

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

    if 'ergonomy' not in snippet:
        snippet['ergonomy'] = {}
    if type(snippet['ergonomy']) != dict:
        snippet['ergonomy'] = {}

    snippet['ergonomy']['user_agent'] = None
    for cur_header in request.headers:
        if (1 < len(cur_header)) and cur_header[0] and ('user-agent' == cur_header[0].lower()):
            snippet['ergonomy']['user_agent'] = cur_header[1]
            break

    snippet['remote_ip'] = None
    rem_ip_src = ['x-forwarded-for', 'x-real-ip']
    for header_test in rem_ip_src:
        got_ip = False
        for cur_header in request.headers:
            if (1 < len(cur_header)) and cur_header[0] and (header_test == cur_header[0].lower()):
                snippet['remote_ip'] = cur_header[1]
                got_ip = True
                break
        if got_ip:
            break
    if not snippet['remote_ip']:
        snippet['remote_ip'] = request.remote_addr

    snippet_id = mongo.db.snippets.insert(snippet)

    return (str(snippet_id), 200, headers)
