(function(){

    function randomString(length, chars) {
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
        return result;
    }

    function start_loading() {
        var v = '1.7.1';
        if (window.jQuery === undefined || window.jQuery.fn.jquery < v) {
            var done = false;
            var script = document.createElement('script');
            script.src = '//ajax.googleapis.com/ajax/libs/jquery/' + v + '/jquery.min.js';
            script.onload = script.onreadystatechange = function(){
                if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
                    done = true;
                    init_bookmarklet();
                }
            };
            document.getElementsByTagName('head')[0].appendChild(script);
        } else {
            init_bookmarklet();
        }
    };

    function load_tags(base_url, feed_name) {
        var done = false;
        var script = document.createElement('script');
        script.src = base_url + '?tags=' + feed_name;
        script.onload = script.onreadystatechange = function(){
            if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
                done = true;
                setup_bookmarklet();
            }
        };
        document.getElementsByTagName('head')[0].appendChild(script);
    };

    function set_search_plugin() {
        // this jQuery highlighting addon is taken out of
        // http://johannburkard.de/resources/Johann/jquery.highlight-4.js

        jQuery.fn.highlight = function(pat) {
            function innerHighlight(node, pat) {
                var skip = 0;
                if (node.nodeType == 3) {
                    var pos = node.data.toUpperCase().indexOf(pat);
                    if (pos >= 0) {
                        var spannode = document.createElement('span');
                        spannode.className = 'highlight';
                        $(spannode).css('background-color', 'yellow');
                        var middlebit = node.splitText(pos);
                        var endbit = middlebit.splitText(pat.length);
                        var middleclone = middlebit.cloneNode(true);
                        spannode.appendChild(middleclone);
                        middlebit.parentNode.replaceChild(spannode, middlebit);
                        skip = 1;
                    }
                }
                else if (node.nodeType == 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {
                    for (var i = 0; i < node.childNodes.length; ++i) {
                        i += innerHighlight(node.childNodes[i], pat);
                    }
                }
                return skip;
            }
            return this.length && pat && pat.length ? this.each(function() {
                innerHighlight(this, pat.toUpperCase());
            }) : this;
        };

        jQuery.fn.removeHighlight = function() {
            return this.find("span.highlight").each(function() {
                this.parentNode.firstChild.nodeName;
                with (this.parentNode) {
                    replaceChild(this.firstChild, this);
                    normalize();
                }
            }).end();
        };

    };

    function get_sel_text() {
        var SelText = '';
        if (window.getSelection) {
            SelText = window.getSelection();
        } else if (document.getSelection) {
            SelText = document.getSelection();
        } else if (document.selection) {
            SelText = document.selection.createRange().text;
        }
        return SelText;
    };


    function make_form(base_url) {
        var iframe = document.createElement('iframe');
        iframe.setAttribute('name', 'frame_cd_post');
        iframe.setAttribute('src', base_url);
        iframe.name = 'frame_cd_post';
        $(iframe).css('display', 'none');

        var form = document.createElement('form');
        form.setAttribute('id', 'mini_cd_form');
        form.setAttribute('method', 'post');
        form.setAttribute('action', base_url);
        form.setAttribute('target', 'frame_cd_post');

        var params = {
            'selected': '' + get_sel_text(),
            'reference': '' + window.cd_reference_id,
            'provider': '' + window.location.href
        };

        for (var one_key in params) {
            var oneField = document.createElement('input');
            oneField.setAttribute('type', 'hidden');
            oneField.setAttribute('name', one_key);
            oneField.setAttribute('value', params[one_key]);
            form.appendChild(oneField);
        }

        var submitField = document.createElement('input');
        submitField.setAttribute('type', 'submit');
        submitField.setAttribute('value', 'send selection');
        form.appendChild(submitField);

        $(form).css('position', 'fixed');
        $(form).css('top', '10px');
        $(form).css('left', '10px');
        $(form).css('z-index', '10000');

        $(form).on('submit', function(ev) {
            $(form).find('input[name="selected"]').val('' + get_sel_text());
        });

        document.body.appendChild(iframe);
        document.body.appendChild(form);
    };

    function prepare_open(base_url) {

        var form = document.createElement('form');
        form.setAttribute('id', 'mini_cd_open');
        form.setAttribute('method', 'get');
        form.setAttribute('action', base_url + '?ref=' + window.cd_reference_id);
        form.setAttribute('target', '_blank');

        var submitField = document.createElement('input');
        submitField.setAttribute('type', 'submit');
        submitField.setAttribute('value', 'commit data');
        form.appendChild(submitField);

        $(form).css('position', 'fixed');
        $(form).css('top', '40px');
        $(form).css('left', '10px');
        $(form).css('z-index', '10000');

        $(form).on('submit', function(ev) {
            var commit_win = window.open(base_url + '?selected=' + window.cd_reference_id, 'commit_win');
            window.commit_win_open = true;
            return false;
        });

        document.body.appendChild(form);
    };

    function prepare_search() {
        var form = document.createElement('form');
        form.setAttribute('id', 'mini_cd_search');
        form.setAttribute('method', 'get');
        form.setAttribute('target', '_blank');

        var submitField = document.createElement('input');
        submitField.setAttribute('type', 'submit');
        submitField.setAttribute('value', 'find terms');
        form.appendChild(submitField);

        $(form).css('position', 'fixed');
        $(form).css('top', '70px');
        $(form).css('left', '10px');
        $(form).css('z-index', '10000');

        $(form).on('submit', function(ev) {
            var terms = window.cd_terms;
            $(document.body).removeHighlight();
            for (ind=(terms.length-1); ind >= 0; ind--) {
                $(document.body).highlight(terms[ind]);
            }
            return false;
        });

        document.body.appendChild(form);
    };

    function init_bookmarklet() {
        load_tags(window.cd_feed_url, window.cd_feed_name);
    };

    function setup_bookmarklet() {
        (window.cd_bookmarklet = function() {
            if (!window.cd_is_initialized) {
                window.cd_reference_id = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
                make_form(window.cd_feed_url);
                prepare_open(window.cd_feed_url);
                set_search_plugin();
                prepare_search();
                window.onbeforeunload = function() {
                    return 'Wanna leave the page?';
                }
            } else {
                $('#mini_cd_form').find('input[name="selected"]').val('' + get_sel_text());
            }
            window.cd_is_initialized = true;
        })();
    };

    start_loading();

})();
