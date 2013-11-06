(function(){

    var page_session_id = null;
    var leaving_question = 'Wanna leave the page?';

    var display_status = true;
    window._ubi_cd['show_switch'] = function() {
        display_status = !display_status;

        if (display_status) {
            $('#mini_cd_page_session').show();
            $('#mini_cd_find_terms').show();
            window.onbeforeunload = function() {return leaving_question;};
        }
        else {
            $('#mini_cd_page_session').hide();
            $('#mini_cd_find_terms').hide();
            $('#mini_cd_find_prev').hide();
            $('#mini_cd_find_next').hide();

            $('#mini_cd_find_terms').prop('disabled', false);

            search_make = true;
            search_positions = [];
            search_positions_index = -1;
            search_positions_id = null;

            serach_label_idx = 0;
            $('#mini_cd_find_terms').html(serach_labels[serach_label_idx]);
            $('#mini_cd_find_terms').css('background-color', back_cols['button_std']);
            $('#mini_cd_find_terms').css('color', 'black');
            $('#mini_cd_find_terms').css('cursor', 'pointer');

            $(document.body).removeHighlight();
            cd_highlight_rank = 0;

            window.onbeforeunload = null;
        }
    };

    var css_margin_prev_next = '0px';
    if (navigator.userAgent.toLowerCase().indexOf('webkit') > -1) {
        css_margin_prev_next = '5px';
    }

    var back_cols = {
        'button_std': 'rgb(220, 220, 240)',
        'button_dis': 'silver',
        'term_found': 'yellow',
        'term_found_active': 'gold',
        'context_menu': '#ddd'
    };

    var button_css = {
        'padding': '5px',
        'box-shadow': '1px 1px 1px 1px #ccc',
        'background-color': back_cols['button_std'],
        'color': 'rgb(0, 0, 0)',
        'border': '1px solid rgb(0, 0, 0)',
        'border-radius': '5px',
        'margin-top': '5px',
        'margin-bottom': '5px',
        'font-size': '17px',
        'line-height': '1',
        'text-align': 'center',
        'font-family': 'Helvetica,Arial,sans-serif',
        'text-decoration': 'none',
        'cursor': 'pointer',
        '-moz-box-sizing': 'padding-box'
    };

    var make_random_string = function(length) {
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
        return result;
    };

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

    var start_loading = function() {
        var v = '1.7.1';
        if (window.jQuery === undefined || window.jQuery.fn.jquery < v) {
            var done = false;
            var script = document.createElement('script');
            //script.src = '//ajax.googleapis.com/ajax/libs/jquery/' + v + '/jquery.min.js';
            script.src = window._ubi_cd['jquery_url'];
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

    var load_tags = function(base_url, feed_name) {
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

    var cd_highlight_rank = 0;
    var set_search_plugin = function() {
        // this jQuery highlighting addon is based on
        // http://johannburkard.de/resources/Johann/jquery.highlight-4.js

        jQuery.fn.highlight = function(pat) {
            function innerHighlight(node, pat) {
                var skip = 0;
                if (node.nodeType == 3) {
                    var pat_re = new RegExp(pat, 'i');
                    var re_res = node.data.match(pat_re);
                    if (re_res && ('index' in re_res) && (re_res['index'] >= 0)) {
                        var spannode = document.createElement('span');
                        spannode.className = 'cd_highlight';
                        cd_highlight_rank += 1;
                        spannode.setAttribute('id', 'cd_highlight_' + cd_highlight_rank);
                        $(spannode).css('background-color', back_cols['term_found']);
                        $(spannode).css('color', 'black');
                        var middlebit = node.splitText(re_res['index']);
                        var endbit = middlebit.splitText(re_res[0].length);
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
                innerHighlight(this, pat);
            }) : this;
        };

        jQuery.fn.removeHighlight = function() {
            return this.find('span.cd_highlight').each(function() {
                this.parentNode.firstChild.nodeName;
                with (this.parentNode) {
                    replaceChild(this.firstChild, this);
                    normalize();
                }
            }).end();
        };

    };

    var get_sel_text = function() {
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

    var mini_cd_save_text_snippet = function() {
        $('#mini_cd_form').submit();
    };

    var make_form = function(base_url) {
        var menu = document.createElement('div');
        menu.setAttribute('id', 'mini_cd_txt_menu');
        $('#mini_cd_txt_menu').css('display', 'none');
        $('#mini_cd_txt_menu').html('<div>&nbsp;</div>');

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
            'text_snippet': '' + get_sel_text(),
            'image_title': '',
            'image_url': '',
            'image_png': '',
            'user': '' + window._ubi_cd['user_name'],
            'session': '' + page_session_id,
            'provider': '' + window.location.href
        };

        for (var one_key in params) {
            var oneField = document.createElement('input');
            oneField.setAttribute('type', 'hidden');
            oneField.setAttribute('name', one_key);
            oneField.setAttribute('value', params[one_key]);
            form.appendChild(oneField);
        }

        $(form).css('display', 'none');

        var post_iframe_status = 0;
        $(iframe).on('load', function(ev) {
            post_iframe_status += 1;
            if (2 < post_iframe_status) {
                if (1 == (post_iframe_status % 2)) {
                    window.history.back();
                    return;
                }
            }
        });

        $(form).on('submit', function(ev) {
            items_saved_count += 1;
            var items_word = 'items';
            if (1 == items_saved_count) {
                items_word = 'item';
            }
            $('#mini_cd_page_session').attr('title', ' ' + items_saved_count + ' ' + items_word + ' saved ');
        });

        document.body.appendChild(iframe);
        document.body.appendChild(form);

        $('body').not('img').on('contextmenu', function(e) {
            if (!display_status) {
                return true;
            }

            var cur_snippet = '' + get_sel_text();
            if ('' == cur_snippet) {
                return true;
            }
            $('#mini_cd_form').find('input[name="text_snippet"]').val('' + get_sel_text());

            $('#mini_cd_form').find('input[name="image_png"]').val('');
            $('#mini_cd_form').find('input[name="image_url"]').val('');
            $('#mini_cd_form').find('input[name="image_title"]').val('');

            var menu_html = '<div id="mini_cd_txt_menu_inser_snippet">Save text snippet</div>';

            $('#mini_cd_txt_menu').html(menu_html);

            $('#mini_cd_txt_menu_inser_snippet').css('cursor', 'pointer');
            $('#mini_cd_txt_menu_inser_snippet').on('click', function(ev) {
                mini_cd_save_text_snippet();
                $('#mini_cd_txt_menu').hide();
                return false;
            });

            $('#mini_cd_txt_menu').css({
                'display': 'none',
                'position': 'absolute',
                'padding': '10px',
                'background-color': back_cols['context_menu'],
                'border': '1px solid #000',
                'z-index': '10000'
            });

            $('#mini_cd_txt_menu').css('top', e.pageY+'px');
            $('#mini_cd_txt_menu').css('left', e.pageX+'px');
            $('#mini_cd_txt_menu').show();

            return false;
        });

        $(document).click(function() {
            $('#mini_cd_txt_menu').hide();
        });

        document.body.appendChild(menu);

    };

    var items_saved_count = 0;
    var prepare_open = function(base_url) {

        var form = document.createElement('form');
        form.setAttribute('id', 'mini_cd_open');
        form.setAttribute('method', 'get');
        form.setAttribute('action', base_url + '?ref=' + page_session_id);
        form.setAttribute('target', '_blank');

        var sessionButton = document.createElement('div');
        sessionButton.setAttribute('id', 'mini_cd_page_session');
        sessionButton.setAttribute('title', ' ' + items_saved_count + ' items saved ');

        $(sessionButton).html('page session');

        $(form).css('display', 'none');

        $(sessionButton).css('width', '125px');
        $(sessionButton).css('position', 'fixed');
        $(sessionButton).css('top', '10px');
        $(sessionButton).css('left', '10px');
        $(sessionButton).css('z-index', '10000');

        $(sessionButton).css(button_css);

        $(sessionButton).on('click', function(ev) {
            $(form).submit();
        });

        $(form).on('submit', function(ev) {
            var commit_win = window.open(base_url + '?session=' + page_session_id, 'commit_win');
            return false;
        });

        document.body.appendChild(form);
        document.body.appendChild(sessionButton);
    };

    var search_positions = [];
    var search_positions_index = -1;
    var search_positions_id = null;

    var find_initial_match = function() {
        if (0 == search_positions.length) {
            return;
        }
        page_offset = get_scroll_xy();

        search_positions_index = 0;
        while (search_positions[search_positions_index].top < page_offset.top) {
            search_positions_index += 1;
            if (search_positions_index == search_positions.length) {
                search_positions_index = 0;
                break;
            }
        }

        find_match();
    }

    var find_next_match = function() {
        if (0 == search_positions.length) {
            return;
        }
        search_positions_index += 1;
        if (search_positions_index == search_positions.length) {
            search_positions_index = 0;
        }
        find_match();
    };

    var find_prev_match = function() {
        if (0 == search_positions.length) {
            return;
        }
        search_positions_index -= 1;
        if (search_positions_index == -1) {
            search_positions_index = search_positions.length - 1;
        }
        find_match();
    };

    var find_match = function() {
        cur_data = search_positions[search_positions_index];
        cur_left = cur_data.left - 20;
        if (0 > cur_left) {
            cur_left = 0;
        }
        cur_top = cur_data.top - 20;
        if (0 > cur_top) {
            cur_top = 0;
        }

        if (search_positions_id) {
            $('#' + search_positions_id).css('background-color', back_cols['term_found']);
        }
        search_positions_id = cur_data.id;
        $('#' + search_positions_id).css('background-color', back_cols['term_found_active']);

        var show_rank = search_positions_index + 1;
        $('#mini_cd_find_prev').attr('title', ' ' + show_rank + ' / ' + search_positions.length + ' ');
        $('#mini_cd_find_next').attr('title', ' ' + show_rank + ' / ' + search_positions.length + ' ');

        window.scrollTo(cur_left, cur_top);
    };

    var show_no_result = function() {
        $(document.body).removeHighlight();
        cd_highlight_rank = 0;

        $('#mini_cd_find_terms').prop('disabled', true);
        $('#mini_cd_find_terms').css('background-color', back_cols['button_dis']);
        $('#mini_cd_find_terms').css('color', 'grey');
        $('#mini_cd_find_terms').css('cursor', 'default');
        $('#mini_cd_find_terms').html('none found');
    };

    var set_search_offsets = function() {
        search_positions = [];
        search_positions_index = -1;
        search_positions_id = null;

        $('.cd_highlight').each(function(ind, elm) {
            var pos = $(elm).offset();
            if (pos && ('top' in pos) && ('left' in pos) && (pos.top != null) && (pos.left != null)) {
                if ((pos.top > 0) && (pos.left > 0)) {
                    var pos_data = {'left': pos.left, 'top': pos.top, 'id': elm.id};
                    search_positions.push(pos_data);
                }
            }
        });

        search_positions.sort(function(a,b) {
            var top_diff = a.top - b.top;
            if (0 != top_diff) {
                return top_diff;
            }
            var left_diff = a.left - b.left;
            return left_diff;
        });

        if (0 == search_positions.length) {
            show_no_result();
            return;
        }

        $('#mini_cd_find_prev').show()
        $('#mini_cd_find_next').show()

        find_initial_match();
    };

    var search_make = true;
    var serach_label_idx = 0;
    var serach_labels = ['find terms', 'hide terms'];
    var prepare_search = function() {

        var form = document.createElement('form');
        form.setAttribute('id', 'mini_cd_search');
        form.setAttribute('method', 'get');
        form.setAttribute('target', '_blank');

        var searchButton = document.createElement('div');
        searchButton.setAttribute('id', 'mini_cd_find_terms');
        searchButton.setAttribute('title', ' terms: ' + window._ubi_cd['search_terms'] + ' ');
        $(searchButton).html(serach_labels[serach_label_idx]);

        var findNext = document.createElement('div');
        findNext.setAttribute('id', 'mini_cd_find_next');
        $(findNext).css('display', 'none');
        $(findNext).html('>>');

        var findPrev = document.createElement('div');
        findPrev.setAttribute('id', 'mini_cd_find_prev');
        findPrev.setAttribute('type', 'submit');
        $(findPrev).css('display', 'none');
        $(findPrev).html('<<');

        $(searchButton).css('width', '125px');
        $(searchButton).css(button_css);

        $(form).css('display', 'none');

        $(searchButton).css('position', 'fixed');
        $(searchButton).css('top', '41px');
        $(searchButton).css('left', '10px');
        $(searchButton).css('z-index', '10000');

        $(findNext).css('position', 'fixed');
        $(findNext).css('top', '76px');
        $(findNext).css('left', '75px');
        $(findNext).css('z-index', '10000');

        $(findNext).css(button_css);
        $(findNext).css('width', '60px');
        $(findNext).css('padding-top', '1px');
        $(findNext).css('padding-bottom', '1px');
        $(findNext).css('padding-left', '2px');
        $(findNext).css('padding-right', '2px');
        $(findNext).css('vertical-align', 'middle');
        $(findNext).css('margin-left', css_margin_prev_next);

        $(findPrev).css('position', 'fixed');
        $(findPrev).css('top', '76px');
        $(findPrev).css('left', '10px');
        $(findPrev).css('z-index', '10000');

        $(findPrev).css(button_css);
        $(findPrev).css('width', '60px');
        $(findPrev).css('padding-top', '1px');
        $(findPrev).css('padding-bottom', '1px');
        $(findPrev).css('padding-left', '2px');
        $(findPrev).css('padding-right', '2px');
        $(findPrev).css('vertical-align', 'middle');

        $(searchButton).css(button_css);

        $(searchButton).on('click', function(ev) {
            if ($(searchButton).prop('disabled')) {
                return;
            }

            $(form).submit();
            serach_label_idx = 1 - serach_label_idx;
            $(searchButton).html(serach_labels[serach_label_idx]);
            search_make = !search_make;
        });

        $(form).on('submit', function(ev) {
            $('#mini_cd_find_prev').hide()
            $('#mini_cd_find_next').hide()
            search_positions = [];
            search_positions_index = -1;

            var terms = window._ubi_cd['search_terms'];
            $(document.body).removeHighlight();
            cd_highlight_rank = 0;

            if (!search_make) {
                return false;
            }

            for (ind=(terms.length-1); ind >= 0; ind--) {
                $(document.body).highlight(terms[ind]);
            }
            setTimeout(function(){set_search_offsets();}, 10);
            return false;
        });

        document.body.appendChild(form);
        document.body.appendChild(searchButton);

        document.body.appendChild(findNext);
        document.body.appendChild(findPrev);

        $(findNext).on('click', function(ev) {find_next_match();});
        $(findPrev).on('click', function(ev) {find_prev_match();});
    };

    var mini_cd_save_image_url = function() {
        $('#mini_cd_form').find('input[name="image_png"]').val('');
        $('#mini_cd_form').find('input[name="image_url"]').val('' + image_url_string);
        $('#mini_cd_form').find('input[name="image_title"]').val('' + image_title);
        $('#mini_cd_form').submit();
    };

    var mini_cd_save_image_bitmap = function() {
        $('#mini_cd_form').find('input[name="image_png"]').val('' + image_bitmap_string);
        $('#mini_cd_form').find('input[name="image_url"]').val('' + image_url_string);
        $('#mini_cd_form').find('input[name="image_title"]').val('' + image_title);
        $('#mini_cd_form').submit();
    };

    var image_url_string = null;
    var image_bitmap_string = null;
    var image_title = null;

    var prepare_images = function() {

        var menu = document.createElement('div');
        menu.setAttribute('id', 'mini_cd_img_menu');
        $(menu).css('display', 'none');
        $(menu).html('<div>&nbsp;</div>');

        $('img').bind('contextmenu', function(e) {
            if (!display_status) {
                return true;
            }

            $('#mini_cd_form').find('input[name="text_snippet"]').val('' + get_sel_text());

            var event_img = e.currentTarget;

            image_title = event_img.title;
            image_url_string = event_img.src;

            var doc_host = document.location.host;
            var doc_port = document.location.port;
            var doc_protocol = document.location.protocol;

            var tmp_href = document.createElement('a');
            tmp_href.href = image_url_string;

            var host_same = (tmp_href.host == document.location.host);
            var port_same = (tmp_href.port == document.location.port);

            var has_png = false;

            if (host_same && port_same) {
                try {
                    var tmp_canvas = document.createElement('canvas');
                    var tmp_context = tmp_canvas.getContext('2d');
                    tmp_context.drawImage(event_img, 0, 0);
                    image_bitmap_string = tmp_canvas.toDataURL('image/png');

                    has_png = true;

                } catch(exc) {
                    has_png = false;
                }

            }

            var menu_html = '<div id="mini_cd_img_menu_image_url">Save image URL</div>';
            if (has_png) {
                menu_html += '<div id="mini_cd_img_menu_image_bitmap">Save image bitmap</div>';
            }

            $('#mini_cd_img_menu').html(menu_html);

            $('#mini_cd_img_menu_image_url').css('cursor', 'pointer');
            $('#mini_cd_img_menu_image_url').on('click', function(ev) {
                mini_cd_save_image_url();
                $('#mini_cd_img_menu').hide();
                return false;
            });

            $('#mini_cd_img_menu_image_bitmap').css('cursor', 'pointer');
            $('#mini_cd_img_menu_image_bitmap').css('margin-top', '4px');
            $('#mini_cd_img_menu_image_bitmap').on('click', function(ev) {
                mini_cd_save_image_bitmap();
                $('#mini_cd_img_menu').hide();
                return false;
            });

            $('#mini_cd_img_menu').css({
                'display': 'none',
                'position': 'absolute',
                'padding': '10px',
                'background-color': back_cols['context_menu'],
                'border': '1px solid #000',
                'z-index': '10000'
            });

            $('#mini_cd_img_menu').css('top', e.pageY+'px');
            $('#mini_cd_img_menu').css('left', e.pageX+'px');
            $('#mini_cd_img_menu').show();

            return false;
        });

        $(document).click(function() {
            $('#mini_cd_img_menu').hide();
        });

        document.body.appendChild(menu);
    };

    var init_bookmarklet = function() {
        load_tags(window._ubi_cd['feed_url'], window._ubi_cd['feed_name']);
    };

    var setup_bookmarklet = function() {
        if (!window._ubi_cd['is_initialized']) {
            prepare_images();

            page_session_id = make_random_string(32);
            make_form(window._ubi_cd['feed_url']);
            prepare_open(window._ubi_cd['feed_url']);
            set_search_plugin();
            prepare_search();
            window.onbeforeunload = function() {return leaving_question;};
        } else {
            $('#mini_cd_form').find('input[name="selected"]').val('' + get_sel_text());
        }
        window._ubi_cd['is_initialized'] = true;
    };

    start_loading();

})();
