(function(){
    if (typeof(window._ubi_cd) != 'object') {
        return;
    }
    if (window._ubi_cd === null) {
        return;
    }
    var ubi_els_class_name = 'ubi_cd_part';

    var page_session_id = null;
    var leaving_question = 'Wanna leave the page?';

    var get_ubi_cd = function(var_key) {
        if (!(var_key in window._ubi_cd)) {
            return null;
        }
        return window._ubi_cd[var_key];
    };
    var set_ubi_cd = function(var_key, var_value) {
        window._ubi_cd[var_key] = var_value;
    };

    var finish_switch_on = function(reload_tags) {
        update_search_view();

        if (reload_tags) {
            prepare_tags();
        }

        $('#ubi_cd_page_session').show();
        $('#ubi_cd_page_tags').show();
        $('#ubi_cd_find_terms').show();
        if (get_ubi_cd('warn_leave')) {
            window.onbeforeunload = function() {return leaving_question;};
        }
    };

    var display_status = true;
    var show_switch_action = function(switch_options) {
        display_status = !display_status;

        if (display_status) {
            var use_options = {
                'user_name': get_ubi_cd('user_name'),
                'feed_url': get_ubi_cd('feed_url'),
                'feed_name': get_ubi_cd('feed_name'),
                'warn_leave': get_ubi_cd('warn_leave')
            };
            for (var one_key in use_options) {
                if (one_key in switch_options) {
                    use_options[one_key] = switch_options[one_key];
                }
            }

            user_name = use_options['user_name'];
            feed_url = use_options['feed_url'];
            feed_name = use_options['feed_name'];
            warn_leave = use_options['warn_leave'];

            set_ubi_cd('warn_leave', warn_leave);
            set_ubi_cd('user_name', user_name);
            $('#ubi_cd_form').find('input[name="user_name"]').val('' + get_ubi_cd('user_name'));

            var feed_differs = false;
            if (get_ubi_cd('feed_url') != feed_url) {
                feed_differs = true;
            }
            if (get_ubi_cd('feed_name') != feed_name) {
                feed_differs = true;
            }

            if (feed_differs) {
                set_ubi_cd('feed_url', feed_url);
                set_ubi_cd('feed_name', feed_name);
                load_feed(get_ubi_cd('feed_url'), get_ubi_cd('feed_name'), function() {finish_switch_on(true);});
            }
            else {
                finish_switch_on(false);
            }
        }
        else {
            $('#ubi_cd_page_session').hide();
            $('#ubi_cd_page_tags').hide();
            tags_shown = false;
            $('#ubi_cd_tags_' + tags_set_current).hide();
            $('#ubi_cd_find_terms').hide();
            $('#ubi_cd_find_prev').hide();
            $('#ubi_cd_find_next').hide();

            $('#ubi_cd_find_terms').prop('disabled', false);

            search_make = true;
            search_positions = [];
            search_positions_index = -1;
            search_positions_id = null;

            $(document.body).removeHighlight();
            cd_highlight_rank = 0;

            if (get_ubi_cd('warn_leave')) {
                window.onbeforeunload = null;
            }
        }
    };
    set_ubi_cd('show_switch', show_switch_action);

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
            script.src = get_ubi_cd('jquery_url');
            script.onload = script.onreadystatechange = function(){
                if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
                    done = true;
                    json2_loading();
                }
            };
            document.getElementsByTagName('head')[0].appendChild(script);
        } else {
            json2_loading();
        }
    };

    var json2_loading = function() {
        var json2_url = get_ubi_cd('json2_url');
        if (!json2_url) {
            init_bookmarklet();
            return;
        }

        var done = false;
        var script = document.createElement('script');
        //script.src = '//cdn.jsdelivr.net/json2/0.1/json2.min.js;
        script.src = json2_url;
        script.onload = script.onreadystatechange = function(){
            if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
                done = true;
                init_bookmarklet();
            }
        };
        document.getElementsByTagName('head')[0].appendChild(script);
    };

    var load_feed = function(base_url, feed_name, next_action) {
        var done = false;
        var script = document.createElement('script');
        script.src = base_url + '?feed=' + feed_name;
        script.onload = script.onreadystatechange = function(){
            if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
                done = true;
                next_action();
            }
        };
        document.getElementsByTagName('head')[0].appendChild(script);
    };

    var is_ubi_node = function(node) {
        if (!node) {
            return false;
        }
        var par_node = node.parentNode;
        if (!par_node) {
            return false;
        }
        var par_class = par_node.className;
        if (!par_class) {
            return false;
        }

        if(par_class == ubi_els_class_name) {
            return true;
        }
        return false;
    };

    var is_ubi_elm = function(elm) {
        if (!elm) {
            return false;
        }
        var elm_class = elm.className;
        if (!elm_class) {
            return false;
        }

        if(elm_class == ubi_els_class_name) {
            return true;
        }
        return false;
    };

    var get_regexp = function(term_info) {
        var pattern = null;
        var known_modes = {'simple':true, 'wildcard':true, 'regexp':true};

        if ((!term_info) || (!('term' in term_info)) || (!('mode' in term_info))) {
            return null;
        }

        var term = term_info['term'];
        var mode = term_info['mode'];
        if ((!term) || (!mode)) {
            return null;
        }
        if (!(mode in known_modes)) {
            return null;
        }

        if ((!term) || (!term.length)) {
            return null;
        }

        if ('regexp' == mode) {
            pattern = new RegExp(term, 'i');
            return pattern;
        }

        if ('simple' == mode) {
            term = term.replace(/[$^\\.*+?()[\]{}|]/g, "\\$&");
            pattern = new RegExp(term, 'i');
            return pattern;
        }

        // wildcard; used (but replaced) chars: ? *
        // other (escaped) special chars: ^ $ \ . + ( ) [ ] { } |
        var wc_term = '';

        var term_parts_1 = term.split('?');
        var term_parts_1_count = term_parts_1.length;
        for (var ind_p1 = 0; ind_p1 < term_parts_1_count; ind_p1+=1) {
            if (0 < ind_p1) {
                wc_term += '.';
            }

            var part_1 = term_parts_1[ind_p1];

            var term_parts_2 = part_1.split('*');
            var term_parts_2_count = term_parts_2.length;
            for (var ind_p2 = 0; ind_p2 < term_parts_2_count; ind_p2+=1) {
                if (0 < ind_p2) {
                    wc_term += '.*?';
                }

                var part_2 = term_parts_2[ind_p2];
                var part_escaped = part_2.replace(/[$^\\.+()[\]{}|]/g, "\\$&");

                wc_term += part_escaped;
            }
        }

        pattern = new RegExp(wc_term, 'i');
        return pattern;
    };

    var cd_highlight_rank = 0;
    var set_search_plugin = function() {
        // this jQuery highlighting addon is based on
        // http://johannburkard.de/resources/Johann/jquery.highlight-4.js

        jQuery.fn.highlight = function(pat) {
            function innerHighlight(node, pat) {
                var skip = 0;
                if (node.nodeType == 3) {
                    var re_res = node.data.match(pat);
                    if ((!is_ubi_node(node)) && re_res && ('index' in re_res) && (re_res['index'] >= 0)) {
                        var spannode = document.createElement('span');
                        spannode.className = 'ubi_cd_highlight';
                        cd_highlight_rank += 1;
                        spannode.setAttribute('id', 'ubi_cd_highlight_' + cd_highlight_rank);
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
            return this.length && pat ? this.each(function() {
                innerHighlight(this, pat);
            }) : this;
        };

        jQuery.fn.removeHighlight = function() {
            return this.find('span.ubi_cd_highlight').each(function() {
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

    var run_cd_save_text_snippet = function() {
        var comment = $('#ubi_cd_txt_menu_comment').val();
        $('#ubi_cd_form').find('input[name="comment"]').val(comment);
        $('#ubi_cd_form').submit();
    };

    var make_form = function(base_url) {
        var menu = document.createElement('div');
        menu.setAttribute('id', 'ubi_cd_txt_menu');
        menu.className = ubi_els_class_name;
        $('#ubi_cd_txt_menu').css('display', 'none');
        $('#ubi_cd_txt_menu').html('<div>&nbsp;</div>');

        var iframe = document.createElement('iframe');
        iframe.setAttribute('name', 'ubi_cd_frame_post');
        iframe.setAttribute('src', base_url);
        iframe.name = 'ubi_cd_frame_post';
        $(iframe).css('display', 'none');

        var form = document.createElement('form');
        form.setAttribute('id', 'ubi_cd_form');
        form.className = ubi_els_class_name;
        form.setAttribute('method', 'post');
        form.setAttribute('action', base_url);
        form.setAttribute('target', 'ubi_cd_frame_post');

        var params = {
            'text_snippet': '' + get_sel_text(),
            'image_title': '',
            'image_url': '',
            'image_png': '',
            'user': '' + get_ubi_cd('user_name'),
            'session': '' + page_session_id,
            'page_title': document.title,
            'tags': '',
            'comment': '',
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
            var chosen_tags = get_chosen_tags();
            $('#ubi_cd_form').find('input[name="tags"]').val(JSON.stringify(chosen_tags));

            items_saved_count += 1;
            var items_word = 'items';
            if (1 == items_saved_count) {
                items_word = 'item';
            }
            $('#ubi_cd_page_session').attr('title', ' feed "' + get_ubi_cd('feed_name') + '": ' + items_saved_count + ' ' + items_word + ' saved ');

            return true;
        });

        document.body.appendChild(iframe);
        document.body.appendChild(form);

        $('body').not('img').on('contextmenu', function(e) {
            if (!display_status) {
                return true;
            }
            if (e && e.target && is_ubi_elm(e.target)) {
                return true;
            }

            $('#ubi_cd_img_menu').hide();

            var cur_snippet = '' + get_sel_text();
            if ('' == cur_snippet) {
                return true;
            }
            $('#ubi_cd_form').find('input[name="text_snippet"]').val('' + get_sel_text());

            $('#ubi_cd_form').find('input[name="image_png"]').val('');
            $('#ubi_cd_form').find('input[name="image_url"]').val('');
            $('#ubi_cd_form').find('input[name="image_title"]').val('');

            var menu_html = '<textarea id="ubi_cd_txt_menu_comment" title=" snippet comment " rows="2" cols="16"></textarea>';
            menu_html += '<div id="ubi_cd_txt_menu_insert_snippet">Save text snippet</div>';

            $('#ubi_cd_txt_menu').html(menu_html);
            $('#ubi_cd_txt_menu').addClass(ubi_els_class_name);
            $('#ubi_cd_txt_menu').on('click', function(ev) {
                return false;
            });

            $('#ubi_cd_txt_menu_comment').addClass(ubi_els_class_name);
            $('#ubi_cd_txt_menu_comment').on('click', function(ev) {
                return false;
            });

            $('#ubi_cd_txt_menu_insert_snippet').addClass(ubi_els_class_name);
            $('#ubi_cd_txt_menu_insert_snippet').css({
                'margin-top': '8px',
                'cursor': 'pointer'
            });
            $('#ubi_cd_txt_menu_insert_snippet').attr('title', ' saving into feed: ' + get_ubi_cd('feed_name') + ' ');
            $('#ubi_cd_txt_menu_insert_snippet').on('click', function(ev) {
                run_cd_save_text_snippet();
                $('#ubi_cd_txt_menu').hide();
                return false;
            });

            $('#ubi_cd_txt_menu').css({
                'display': 'none',
                'position': 'absolute',
                'padding': '10px',
                'background-color': back_cols['context_menu'],
                'border': '1px solid #000',
                'z-index': '10000'
            });

            $('#ubi_cd_txt_menu').css('top', e.pageY+'px');
            $('#ubi_cd_txt_menu').css('left', e.pageX+'px');
            $('#ubi_cd_txt_menu').show();

            return false;
        });

        $(document).click(function() {
            $('#ubi_cd_txt_menu').hide();
        });

        document.body.appendChild(menu);

    };

    var items_saved_count = 0;
    var prepare_open = function(base_url) {

        var form = document.createElement('form');
        form.setAttribute('id', 'ubi_cd_open');
        form.className = ubi_els_class_name;
        form.setAttribute('method', 'get');
        form.setAttribute('action', base_url + '?ref=' + page_session_id);
        form.setAttribute('target', '_blank');

        var sessionButton = document.createElement('div');
        sessionButton.setAttribute('id', 'ubi_cd_page_session');
        sessionButton.className = ubi_els_class_name;
        sessionButton.setAttribute('title', ' feed "' + get_ubi_cd('feed_name') + '": ' + items_saved_count + ' items saved ');

        $(sessionButton).html('saved parts');

        $(form).css('display', 'none');

        $(sessionButton).css('width', '125px');
        $(sessionButton).css('position', 'fixed');
        $(sessionButton).css('top', '41px');
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

    var tags_shown = false;
    var page_tags = [];

    var tags_col_count = 10;
    var tags_row_count = 5;
    var tags_set_doses = [];
    var tags_set_doses_count = 0;
    var tags_set_current = 0;
    var tags_sel_button_ids = [];

    var get_chosen_tags = function() {
        var chosen_tags = [];

        var get_chosen_tags_count = page_tags.length;
        for (var ind_gct = 0; ind_gct < get_chosen_tags_count; ind_gct+=1) {
            var cur_tag_info = page_tags[ind_gct];
            if (cur_tag_info['status']) {
                chosen_tags.push(cur_tag_info['value']);
            }
        }

        return chosen_tags;
    };

    var prepare_tags = function() {
        page_tag_values = get_ubi_cd('page_tags');
        var page_tags_count = page_tag_values.length;
        page_tags = [];
        for (var ind_ptv = 0; ind_ptv < page_tags_count; ind_ptv+=1) {
            var new_page_tag = {
                'value': page_tag_values[ind_ptv],
                'status': false
            };
            page_tags.push(new_page_tag);
        }

        for (var ind_rem_tsb = tags_sel_button_ids.length - 1; ind_rem_tsb >= 0; ind_rem_tsb-=1) {
            var cur_tsb_id = tags_sel_button_ids[ind_rem_tsb];
            if (!cur_tsb_id) {
                continue;
            }
            var cur_tsb = document.getElementById(cur_tsb_id);
            if (!cur_tsb) {
                continue;
            }
            try {
                cur_tsb.parentNode.removeChild(cur_tsb);
            } catch (exc) {}
        }
        tags_sel_button_ids = [];

        for (var ind_rem_tsd = tags_set_doses.length - 1; ind_rem_tsd >= 0; ind_rem_tsd-=1) {
            var cur_tsd = tags_set_doses[ind_rem_tsd];
            if (!cur_tsd) {
                continue;
            }
            try {
                cur_tsd.parentNode.removeChild(cur_tsd);
            } catch (exc) {}
        }
        tags_set_doses = [];

        tags_set_current = 0;
        tags_shown = false;
        var max_tag_name_show_len = 10;

        tags_col_count = 10;
        tags_row_count = 5;
        tags_set_doses_count = 0;

        var old_ptb = document.getElementById('ubi_cd_page_tags');
        if (old_ptb) {
            old_ptb.parentNode.removeChild(old_ptb);
        }

        var tagsButton = document.createElement('div');
        tagsButton.setAttribute('id', 'ubi_cd_page_tags');
        tagsButton.className = ubi_els_class_name;

        $(tagsButton).css(button_css);
        $(tagsButton).css('width', '125px');
        $(tagsButton).css('position', 'fixed');
        $(tagsButton).css('top', '10px');
        $(tagsButton).css('left', '10px');
        $(tagsButton).css('z-index', '10000');

        if (0 == page_tags_count) {
            tagsButton.setAttribute('title', ' no tag defined ');
            $(tagsButton).html('no tags');

            $(tagsButton).prop('disabled', true);
            $(tagsButton).css('background-color', back_cols['button_dis']);
            $(tagsButton).css('color', 'grey');
            $(tagsButton).css('cursor', 'default');

            document.body.appendChild(tagsButton);
            return;
        }

        var left_offset_0 = 150;
        var left_offset_1 = 140;

        var win_width = $(window).width();
        for (var ind_ww = 5; ind_ww > 0; ind_ww-=1) {
            tags_row_count = ind_ww;
            if ((left_offset_0 + (ind_ww*left_offset_1)) <= win_width) {
                break;
            }
        }

        var top_offset_0 = 10;
        var top_offset_1 = 31;

        var win_height = $(window).height();
        for (var ind_wh = 10; ind_wh > 2; ind_wh-=1) {
            tags_col_count = ind_wh;
            if ((top_offset_0 + (ind_wh*top_offset_1)) <= win_height) {
                break;
            }
        }

        var tags_dose_mx = tags_col_count * tags_row_count;
        var tags_dose_count_rest = page_tags_count%tags_dose_mx;
        tags_set_doses_count = (page_tags_count - tags_dose_count_rest) / tags_dose_mx;
        if (0 < tags_dose_count_rest) {
            tags_set_doses_count += 1;
        }

        var tags_total_rank = 0;
        for (var ind_td = 0; ind_td < tags_set_doses_count; ind_td+=1) {
            var form = document.createElement('form');
            form.setAttribute('id', 'ubi_cd_tags_' + ind_td);
            form.className = ubi_els_class_name;
            form.setAttribute('method', 'get');

            for (var ind_tags = 0; (ind_tags < tags_dose_mx) && (tags_total_rank < page_tags_count); tags_total_rank+=1, ind_tags+=1) {
                var selButton = document.createElement('div');
                var sel_tag_id_start = 'ubi_cd_sel_tag_';
                var sel_tag_id_full = sel_tag_id_start + tags_total_rank;
                tags_sel_button_ids.push(sel_tag_id_full);
                selButton.setAttribute('id', sel_tag_id_full);
                selButton.className = ubi_els_class_name;

                var cur_tag_value = page_tags[tags_total_rank]['value'];
                var cur_tag_value_show = cur_tag_value;
                if (cur_tag_value.length > max_tag_name_show_len) {
                    cur_tag_value_show = cur_tag_value.substr(0, (max_tag_name_show_len - 2)) + '..';
                }

                $(selButton).attr('title', ' ' + cur_tag_value + ' ');
                $(selButton).html(cur_tag_value_show);

                var cur_sel_idx_inner = ind_tags%tags_col_count;
                var cur_sel_idx_outer = (ind_tags - cur_sel_idx_inner) / tags_col_count;

                var selTop = top_offset_0 + (top_offset_1 * (cur_sel_idx_inner));
                var selLeft = left_offset_0 + (left_offset_1 * cur_sel_idx_outer);

                $(selButton).css(button_css);

                $(selButton).css('width', '125px');
                $(selButton).css('position', 'fixed');
                $(selButton).css('top', '' + selTop + 'px');
                $(selButton).css('left', '' + selLeft + 'px');
                $(selButton).css('z-index', '10000');
                $(selButton).css('font-size', '15px');

                $(selButton).css('background-color', back_cols['button_dis']);

                $(selButton).on('click', function(ev) {
                    var cur_button = this;
                    var cur_ind = parseInt(cur_button.id.substr(sel_tag_id_start.length));

                    var cur_status = page_tags[cur_ind]['status'];
                    page_tags[cur_ind]['status'] = !cur_status;
                    if (cur_status) {
                        $(cur_button).css('background-color', back_cols['button_dis']);
                    }
                    else {
                        $(cur_button).css('background-color', back_cols['button_std']);
                    }

                    return false;
                });

                form.appendChild(selButton);
            }

            $(form).css('display', 'none');

            document.body.appendChild(form);
            tags_set_doses.push(form);

        }

        $(tagsButton).html('item tags');
        tagsButton.setAttribute('title', ' specify snippet/image tags ');

        $(tagsButton).on('click', function(ev) {
            if (0 == tags_set_doses_count) {
                return true;
            }

            if (!tags_shown) {
                tags_shown = true;
                $('#ubi_cd_tags_' + tags_set_current).show();
                return false;
            }

            $('#ubi_cd_tags_' + tags_set_current).hide();
            tags_set_current += 1;
            if (tags_set_current == tags_set_doses_count) {
                tags_set_current = 0;
                tags_shown = false;
                return false;
            }

            $('#ubi_cd_tags_' + tags_set_current).show();
            return false;
        });

        document.body.appendChild(tagsButton);
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
        $('#ubi_cd_find_prev').attr('title', ' ' + show_rank + ' / ' + search_positions.length + ' ');
        $('#ubi_cd_find_next').attr('title', ' ' + show_rank + ' / ' + search_positions.length + ' ');

        window.scrollTo(cur_left, cur_top);
    };

    var show_no_result = function() {
        $(document.body).removeHighlight();
        cd_highlight_rank = 0;

        $('#ubi_cd_find_terms').prop('disabled', true);
        $('#ubi_cd_find_terms').css('background-color', back_cols['button_dis']);
        $('#ubi_cd_find_terms').css('color', 'grey');
        $('#ubi_cd_find_terms').css('cursor', 'default');
        $('#ubi_cd_find_terms').html('none found');
    };

    var set_search_offsets = function() {
        search_positions = [];
        search_positions_index = -1;
        search_positions_id = null;

        $('.ubi_cd_highlight').each(function(ind, elm) {
            var pos = $(elm).offset();
            if (pos && ('top' in pos) && ('left' in pos) && (pos.top != null) && (pos.left != null)) {
                if ((pos.top > 0) && (pos.left > 0)) {
                    var pos_data = {'left': pos.left, 'top': pos.top, 'id': elm.id, 'rank': ind};
                    search_positions.push(pos_data);
                }
            }
        });

        search_positions.sort(function(a,b) {
            var top_diff = a.top - b.top;
            if (0 != top_diff) {
                return top_diff;
            }
            // it seems better to use the 'rank' than 'left' for texts going over lines
            var rank_diff = a.rank - b.rank;
            return rank_diff;
        });

        if (0 == search_positions.length) {
            show_no_result();
            return;
        }

        $('#ubi_cd_find_prev').show()
        $('#ubi_cd_find_next').show()

        find_initial_match();
    };

    var update_search_view = function() {
        serach_label_idx = 0;

        var search_info = get_ubi_cd('search_terms');
        var search_info_count = search_info.length;
        var search_title = '';
        var search_term_some = false;
        for (var ind_std = 0; ind_std < search_info_count; ind_std+=1) {
            var cur_search_info = search_info[ind_std];
            if (cur_search_info && cur_search_info['term']) {
                if (0 < search_title.length) {
                    search_title += ', ';
                }
                search_title += cur_search_info['term'];
                if (cur_search_info['mode']) {
                    search_title += ' (' + cur_search_info['mode'].substring(0,1) + ')';
                }
                search_term_some = true;
            }
        }

        var searchButton = document.getElementById('ubi_cd_find_terms');
        if (!searchButton) {
            return;
        }

        if (search_term_some) {
            searchButton.setAttribute('title', ' search phrases: ' + search_title + ' ');
        }
        else {
            searchButton.setAttribute('title', ' no search phrases ');
        }

        $(searchButton).html(serach_labels[serach_label_idx]);

        $(searchButton).css(button_css);
        $(searchButton).css('width', '125px');
        $(searchButton).css('position', 'fixed');
        $(searchButton).css('top', '72px');
        $(searchButton).css('left', '10px');
        $(searchButton).css('z-index', '10000');

        if (!search_term_some) {
            $(searchButton).prop('disabled', true);
            $(searchButton).css('background-color', back_cols['button_dis']);
            $(searchButton).css('color', 'grey');
            $(searchButton).css('cursor', 'default');
            $(searchButton).html('no terms');
        }
    };

    var search_make = true;
    var serach_label_idx = 0;
    var serach_labels = ['find terms', 'hide terms'];
    var prepare_search = function() {

        var form = document.createElement('form');
        form.setAttribute('id', 'ubi_cd_search');
        form.className = ubi_els_class_name;
        form.setAttribute('method', 'get');
        form.setAttribute('target', '_blank');

        var searchButton = document.createElement('div');
        searchButton.setAttribute('id', 'ubi_cd_find_terms');
        searchButton.className = ubi_els_class_name;

        var findNext = document.createElement('div');
        findNext.setAttribute('id', 'ubi_cd_find_next');
        findNext.className = ubi_els_class_name;
        $(findNext).css('display', 'none');
        $(findNext).html('>>');

        var findPrev = document.createElement('div');
        findPrev.setAttribute('id', 'ubi_cd_find_prev');
        findPrev.className = ubi_els_class_name;
        findPrev.setAttribute('type', 'submit');
        $(findPrev).css('display', 'none');
        $(findPrev).html('<<');

        $(form).css('display', 'none');

        $(findNext).css('position', 'fixed');
        $(findNext).css('top', '107px');
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
        $(findPrev).css('top', '107px');
        $(findPrev).css('left', '10px');
        $(findPrev).css('z-index', '10000');

        $(findPrev).css(button_css);
        $(findPrev).css('width', '60px');
        $(findPrev).css('padding-top', '1px');
        $(findPrev).css('padding-bottom', '1px');
        $(findPrev).css('padding-left', '2px');
        $(findPrev).css('padding-right', '2px');
        $(findPrev).css('vertical-align', 'middle');

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
            $('#ubi_cd_find_prev').hide()
            $('#ubi_cd_find_next').hide()
            search_positions = [];
            search_positions_index = -1;

            $(document.body).removeHighlight();
            cd_highlight_rank = 0;

            if (!search_make) {
                return false;
            }

            var terms = get_ubi_cd('search_terms');
            var terms_count = terms.length;
            for (ind_st=0; ind_st < terms_count; ind_st+=1) {
                var cur_pattern = get_regexp(terms[ind_st]);
                if (!cur_pattern) {
                    continue;
                }
                $(document.body).highlight(cur_pattern);
            }
            setTimeout(function(){set_search_offsets();}, 10);
            return false;
        });

        document.body.appendChild(form);
        document.body.appendChild(searchButton);

        update_search_view();

        document.body.appendChild(findNext);
        document.body.appendChild(findPrev);

        $(findNext).on('click', function(ev) {find_next_match();});
        $(findPrev).on('click', function(ev) {find_prev_match();});
    };

    var run_cd_save_image_url = function() {
        var comment = $('#ubi_cd_img_menu_comment').val();
        $('#ubi_cd_form').find('input[name="comment"]').val(comment);
        $('#ubi_cd_form').find('input[name="image_png"]').val('');
        $('#ubi_cd_form').find('input[name="image_url"]').val('' + image_url_string);
        $('#ubi_cd_form').find('input[name="image_title"]').val('' + image_title);
        $('#ubi_cd_form').submit();
    };

    var run_cd_save_image_bitmap = function() {
        var comment = $('#ubi_cd_img_menu_comment').val();
        $('#ubi_cd_form').find('input[name="comment"]').val(comment);
        $('#ubi_cd_form').find('input[name="image_png"]').val('' + image_bitmap_string);
        $('#ubi_cd_form').find('input[name="image_url"]').val('' + image_url_string);
        $('#ubi_cd_form').find('input[name="image_title"]').val('' + image_title);
        $('#ubi_cd_form').submit();
    };

    var image_url_string = null;
    var image_bitmap_string = null;
    var image_title = null;

    var prepare_images = function() {

        var menu = document.createElement('div');
        menu.setAttribute('id', 'ubi_cd_img_menu');
        menu.className = ubi_els_class_name;
        $(menu).css('display', 'none');
        $(menu).html('<div>&nbsp;</div>');

        $('img').bind('contextmenu', function(e) {
            if (!display_status) {
                return true;
            }

            $('#ubi_cd_txt_menu').hide();

            $('#ubi_cd_form').find('input[name="text_snippet"]').val('' + get_sel_text());

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

            var menu_html = '<textarea id="ubi_cd_img_menu_comment" title=" image comment " rows="2" cols="16"></textarea>';
            menu_html += '<div id="ubi_cd_img_menu_image_url">Save image URL</div>';
            if (has_png) {
                menu_html += '<div id="ubi_cd_img_menu_image_bitmap">Save image bitmap</div>';
            }

            $('#ubi_cd_img_menu').html(menu_html);
            $('#ubi_cd_img_menu').addClass(ubi_els_class_name);
            $('#ubi_cd_img_menu').on('click', function(ev) {
                return false;
            });

            $('#ubi_cd_img_menu_comment').addClass(ubi_els_class_name);
            $('#ubi_cd_img_menu_comment').on('click', function(ev) {
                return false;
            });

            $('#ubi_cd_img_menu_image_url').addClass(ubi_els_class_name);
            $('#ubi_cd_img_menu_image_url').css('cursor', 'pointer');
            $('#ubi_cd_img_menu_image_url').css('margin-top', '5px');
            $('#ubi_cd_img_menu_image_url').attr('title', ' saving into feed: ' + get_ubi_cd('feed_name') + ' ');
            $('#ubi_cd_img_menu_image_url').on('click', function(ev) {
                run_cd_save_image_url();
                $('#ubi_cd_img_menu').hide();
                return false;
            });

            $('#ubi_cd_img_menu_image_bitmap').addClass(ubi_els_class_name);
            $('#ubi_cd_img_menu_image_bitmap').css('cursor', 'pointer');
            $('#ubi_cd_img_menu_image_bitmap').css('margin-top', '4px');
            $('#ubi_cd_img_menu_image_bitmap').attr('title', ' saving into feed: ' + get_ubi_cd('feed_name') + ' ');
            $('#ubi_cd_img_menu_image_bitmap').on('click', function(ev) {
                run_cd_save_image_bitmap();
                $('#ubi_cd_img_menu').hide();
                return false;
            });

            $('#ubi_cd_img_menu').css({
                'display': 'none',
                'position': 'absolute',
                'padding': '10px',
                'background-color': back_cols['context_menu'],
                'border': '1px solid #000',
                'z-index': '10000'
            });

            $('#ubi_cd_img_menu').css('top', e.pageY+'px');
            $('#ubi_cd_img_menu').css('left', e.pageX+'px');
            $('#ubi_cd_img_menu').show();

            return false;
        });

        $(document).click(function() {
            $('#ubi_cd_img_menu').hide();
        });

        document.body.appendChild(menu);
    };

    var setup_bookmarklet = function() {
        if (!get_ubi_cd('is_initialized')) {
            prepare_images();

            page_session_id = make_random_string(32);
            make_form(get_ubi_cd('feed_url'));
            prepare_open(get_ubi_cd('feed_url'));
            prepare_tags();
            set_search_plugin();
            prepare_search();
            if (get_ubi_cd('warn_leave')) {
                window.onbeforeunload = function() {return leaving_question;};
            }

        } else {
            $('#ubi_cd_form').find('input[name="selected"]').val('' + get_sel_text());
        }
        set_ubi_cd('is_initialized', true);
    };

    var init_bookmarklet = function() {
        load_feed(get_ubi_cd('feed_url'), get_ubi_cd('feed_name'), setup_bookmarklet);
    };

    start_loading();

})();
