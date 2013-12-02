(function(){
    if (typeof window._ubi_cd_runtime !== 'object') {
        return;
    }
    if (window._ubi_cd_runtime === null) {
        return;
    }
    if (window._ubi_cd_runtime['is_utilities_started']) {
        return;
    }

    window._ubi_cd_runtime['is_utilities_started'] = true;

    window._ubi_cd_utilities = {};

    var get_query_string = function () {
        var query_string = {};
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = pair[1];
            // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [ query_string[pair[0]], pair[1] ];
                query_string[pair[0]] = arr;
            // If third or later entry with this name
            } else {
                query_string[pair[0]].push(pair[1]);
            }
        } 
        return query_string;
    };
    window._ubi_cd_utilities['get_query_string'] = get_query_string;

    var html_escape_inner = function(text) {
        return String(text)
            .replace(/"/g, '\'')
            .replace(/\\/g, '\\ ');
    };
    window._ubi_cd_utilities['html_escape_inner'] = html_escape_inner;

    var html_escape = function(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\\/g, '&#92;');
    };
    window._ubi_cd_utilities['html_escape'] = html_escape;

    var html_unescape = function(text) {
        return String(text)
        .replace(/&#92;/g, '\\')
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/&#39;/g, '\'')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&');
    };
    window._ubi_cd_utilities['html_unescape'] = html_unescape;

    var fix_flash = function() {
        // loop through every embed tag on the site
        var i;
        var embeds = document.getElementsByTagName('embed');
        for (i = 0; i < embeds.length; i++) {
            var embed = embeds[i];
            var new_embed;
            // everything but Firefox & Konqueror
            if (embed.outerHTML) {
                var html = embed.outerHTML;
                // replace an existing wmode parameter
                if (html.match(/wmode\s*=\s*('|")[a-zA-Z]+('|")/i))
                    new_embed = html.replace(/wmode\s*=\s*('|")window('|")/i, "wmode='transparent'");
                // add a new wmode parameter
                else
                    new_embed = html.replace(/<embed\s/i, "<embed wmode='transparent' ");
                // replace the old embed object with the fixed version
                embed.insertAdjacentHTML('beforeBegin', new_embed);
                embed.parentNode.removeChild(embed);
            } else {
                // cloneNode is buggy in some versions of Safari & Opera, but works fine in FF
                new_embed = embed.cloneNode(true);
                if (!new_embed.getAttribute('wmode') || new_embed.getAttribute('wmode').toLowerCase() == 'window')
                    new_embed.setAttribute('wmode', 'transparent');
                embed.parentNode.replaceChild(new_embed, embed);
            }
        }
        // loop through every object tag on the site
        var objects = document.getElementsByTagName('object');
        for (i = 0; i < objects.length; i++) {
            var object = objects[i];
            var new_object;
            // object is an IE specific tag so we can use outerHTML here
            if (object.outerHTML) {
                var html = object.outerHTML;
                // replace an existing wmode parameter
                if (html.match(/<param\s+name\s*=\s*('|")wmode('|")\s+value\s*=\s*('|")[a-zA-Z]+('|")\s*\/?\>/i))
                    new_object = html.replace(/<param\s+name\s*=\s*('|")wmode('|")\s+value\s*=\s*('|")window('|")\s*\/?\>/i, "<param name='wmode' value='transparent' />");
                // add a new wmode parameter
                else
                    new_object = html.replace(/<\/object\>/i, "<param name='wmode' value='transparent' />\n</object>");
                // loop through each of the param tags
                var children = object.childNodes;
                for (var j = 0; j < children.length; j++) {
                    try {
                        if (children[j] != null) {
                            var theName = children[j].getAttribute('name');
                            if (theName != null && theName.match(/flashvars/i)) {
                                new_object = new_object.replace(/<param\s+name\s*=\s*('|")flashvars('|")\s+value\s*=\s*('|")[^'"]*('|")\s*\/?\>/i, "<param name='flashvars' value='" + children[j].getAttribute('value') + "' />");
                            }
                        }
                    }
                    catch (err) {
                    }
                }
                // replace the old embed object with the fixed versiony
                object.insertAdjacentHTML('beforeBegin', new_object);
                object.parentNode.removeChild(object);
            }
        }
    };
    window._ubi_cd_utilities['fix_flash'] = fix_flash;

    var get_show_title = function(text, len) {
        if (!text) {
            return null;
        }
        if (typeof len === 'undefined') {
            len = 0;
        }

        var text_show = html_unescape(text);
        if (len && (text_show.length > len)) {
            text_show = text_show.substr(0, (len-2)) + '..';
        }
        text_show = html_escape(text_show);
        var text_title = 'title="' + html_escape_inner(text) + '"';

        return {'show': text_show, 'title': text_title};
    };
    window._ubi_cd_utilities['get_show_title'] = get_show_title;

    var get_date_time_show = function(dt_obj) {
        if (!dt_obj) {
            return '';
        }
        return '' + dt_obj;
    };
    window._ubi_cd_utilities['get_date_time_show'] = get_date_time_show;

    var make_random_string = function(length) {
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
        return result;
    };
    window._ubi_cd_utilities['make_random_string'] = make_random_string;

    var get_scroll_xy = function() {
        var scr_of_x = 0, scr_of_y = 0;
        if( typeof( window.pageYOffset ) == 'number' ) {
            //Netscape compliant mode
            scr_of_x = window.pageXOffset;
            scr_of_y = window.pageYOffset;
        } else if(document.body && (document.body.scrollLeft || document.body.scrollTop)) {
            //DOM compliant mode
            scr_of_x = document.body.scrollLeft;
            scr_of_y = document.body.scrollTop;
        } else if(document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
            //IE6 standards compliant mode
            scr_of_x = document.documentElement.scrollLeft;
            scr_of_y = document.documentElement.scrollTop;
        }
        return {'left': scr_of_x, 'top': scr_of_y};
    };
    window._ubi_cd_utilities['get_scroll_xy'] = get_scroll_xy;

    // http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
    // https://github.com/jaubourg/ajaxHooks/blob/master/src/xdr.js
    var cors_for_old_msie = function() {
        if ( window.XDomainRequest ) {
            jQuery.ajaxTransport(function( s ) {
                if ( s.crossDomain && s.async ) {
                    if ( s.timeout ) {
                        s.xdrTimeout = s.timeout;
                        delete s.timeout;
                    }
                    var xdr;
                    return {
                        send: function( _, complete ) {
                            function callback( status, statusText, responses, responseHeaders ) {
                                xdr.onload = xdr.onerror = xdr.ontimeout = jQuery.noop;
                                xdr = undefined;
                                complete( status, statusText, responses, responseHeaders );
                            }
                            xdr = new XDomainRequest();
                            xdr.onload = function() {
                                callback( 200, "OK", { text: xdr.responseText }, "Content-Type: " + xdr.contentType );
                            };
                            xdr.onerror = function() {
                                callback( 404, "Not Found" );
                            };
                            xdr.onprogress = jQuery.noop;
                            xdr.ontimeout = function() {
                                callback( 0, "timeout" );
                            };
                            xdr.timeout = s.xdrTimeout || Number.MAX_VALUE;
                            xdr.open( s.type, s.url );
                            xdr.send( ( s.hasContent && s.data ) || null );
                        },
                        abort: function() {
                            if ( xdr ) {
                                xdr.onerror = jQuery.noop;
                                xdr.abort();
                            }
                        }
                    };
                }
            });
        }
    };
    window._ubi_cd_utilities['cors_for_old_msie'] = cors_for_old_msie;

})();
