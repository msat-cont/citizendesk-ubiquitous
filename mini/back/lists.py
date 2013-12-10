#!/usr/bin/env python

import json

'''
This JSON list display uses next JavaScript libraries:

jQuery 1.7.2
http://jquery.com/
http://cdnjs.cloudflare.com/ajax/libs/jquery/1.7.2/jquery.min.js

Underscore.js 1.5.2
http://underscorejs.org/
http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min.js

Backbone.js 0.9.9 (new versions do not have automatic 'index' support needed by PrettyJSON)
http://backbonejs.org/
http://cdnjs.cloudflare.com/ajax/libs/backbone.js/0.9.9/backbone-min.js

PrettyJSON
http://github.com/warfares/pretty-json
http://raw.github.com/warfares/pretty-json/master/build/pretty-json-min.js
with its CSS file
https://raw.github.com/warfares/pretty-json/master/css/pretty-json.css

Another JSON displayer (that could be possibly used) is JSON-2-HTML
http://json.bloople.net/
http://github.com/bloopletech/json2html
'''

JS_URL = '../../static/lets/libs'
CSS_URL = '../../static/lets/css'

JSON_SHOW_TEMPLATE = '''
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8">
<link rel="stylesheet" type="text/css" href="''' + CSS_URL + '''/pretty-json.css" />
<script type="text/javascript" src="''' + JS_URL + '''/jquery.min.js"></script>
<script type="text/javascript" src="''' + JS_URL + '''/underscore-min.js"></script>
<script type="text/javascript" src="''' + JS_URL + '''/backbone-min.js"></script>
<script type="text/javascript" src="''' + JS_URL + '''/pretty-json-min.js"></script>
<script type="text/javascript">
var show_json = function() {

    var snippets = %%%JSON_OBJ%%%;

    if (snippets) {
        for (var i=snippets.length-1; i>=0; i-=1) {
            if (snippets[i]['created']) {
                snippets[i]['created'] = new Date(snippets[i]['created']);
            }
        }
    }

    var node = new PrettyJSON.view.Node({
        dateFormat: "DD.MM.YYYY HH24:MI:SS",
        el: $('#json_display'),
        data: snippets
    });

    node.expandAll();

};
</script>
</head>
<body onLoad="show_json();">
<div id="json_display">&nbsp;</div>
</body>
</html>
'''

def get_template():
    return JSON_SHOW_TEMPLATE

def get_display(struct):
    return get_template().replace('%%%JSON_OBJ%%%', json.dumps(struct))

