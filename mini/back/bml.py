#!/usr/bin/env python

import datetime, json
from flask import request, Blueprint
from mdb import mongo_dbs, minicd_inner

bml_take = Blueprint('bml_take', __name__)
bml_save = Blueprint('bml_save', __name__)

@bml_take.route('/bml_feeds/', methods=['GET'])
def take_bml():
    import sys
    sys.stderr.write(str(request.form) + '\n\n')
    sys.stderr.write(str(dir(request)) + '\n\n')

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

    got_ref = None
    ref_param = 'selected'
    if ref_param in request.args:
        got_ref = str(request.args[ref_param])

    if got_ref is None:
        return '<html><body><div style="display:none">placeholder</div></body></html>'

    snippets = []
    if '*' == got_ref:
        cursor = mongo.db.snippets.find()
    else:
        cursor = mongo.db.snippets.find({'reference': got_ref})
    for entry in cursor:
        entry['_id'] = str(entry['_id'])
        entry['created'] = entry['created'].isoformat() if not None else None
        snippets.append(entry)

    return (json.dumps(snippets), 200, {'Content-Type': 'application/json'})

@bml_save.route('/bml_feeds/', methods=['POST'])
def save_bml():
    import sys
    sys.stderr.write(str(request.form) + '\n\n')
    sys.stderr.write(str(dir(request)) + '\n\n')

    mongo = mongo_dbs[minicd_inner]

    snippet = {}
    snippet['selected'] = None;
    snippet['reference'] = None;
    snippet['provider'] = None;
    snippet['created'] = datetime.datetime.utcnow();

    for part in snippet:
        if part in request.form:
            snippet[part] = str(request.form[part].encode('utf8'))

    for part in snippet:
        if snippet[part] is None:
            return 'not all data provided', 404

    snippet_id = mongo.db.snippets.insert(snippet)

    return str(snippet_id)
