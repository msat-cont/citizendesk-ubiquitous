(function(){
    if (typeof window._ubi_cd_sites_specific != 'object') {
        return;
    }
    if (window._ubi_cd_sites_specific === null) {
        return;
    }

    var take_youtube_user_data = function(user_data) {
        if ((typeof user_data !== 'object') || (!user_data)) {
            return null;
        }

        var use_data = {};

        var use_parts = {
            'user_id': 'yt$userId',
            'google_plus_user_id': 'yt$googlePlusUserId',
            'thumbnail': 'media$thumbnail',
            'statistics': 'yt$statistics',
            'location': 'yt$location',
            'first_name': 'yt$firstName',
            'last_name': 'yt$lastName'
        };

        for (var one_part in use_parts) {
            use_data[one_part] = null;

            var got_part = use_parts[one_part];
            if ((got_part in user_data) && user_data[got_part] && (typeof user_data[got_part] === 'object')) {
                if ('$t' in user_data[got_part]) {
                    var cur_value = user_data[got_part]['$t'];
                    var cur_type = typeof cur_value;

                    if ((cur_value === null) || (cur_type === 'string') || (cur_type === 'number')) {
                        use_data[one_part] = cur_value;
                    }
                }
                else {
                    var cur_use = {};

                    var cur_set = user_data[got_part];
                    for (var one_subkey in cur_set) {
                        var one_subvalue = cur_set[one_subkey];
                        var one_subtype = typeof one_subvalue;

                        var one_subkey_correct = false;
                        if (typeof one_subkey === 'number') {
                            one_subkey_correct = true;
                        }
                        if (typeof one_subkey === 'string') {
                            if (one_subkey.match(/^[\w]+$/)) {
                                one_subkey_correct = true;
                            }
                        }
                        if (!one_subkey_correct) {
                            continue;
                        }

                        if ((one_subvalue === null) || (one_subtype === 'string') || (one_subtype === 'number')) {
                            cur_use[one_subkey] = one_subvalue;
                        }
                    }
                    if (!cur_use) {
                        cur_use = null;
                    }
                    use_data[one_part] = cur_use;
                }
            }
        }

        return use_data;
    };

    var take_youtube_video_data = function(video_data) {
        if ((typeof video_data !== 'object') || (!video_data)) {
            return null;
        }

        var use_data = {};

        for (var video_key in video_data) {
            var video_key_correct = false;
            if (typeof video_key === 'string') {
                if (video_key.match(/^[\w]+$/)) {
                    video_key_correct = true;
                }
            }
            if (typeof video_key === 'number') {
                video_key_correct = true;
            }
            if (video_key_correct) {
                var video_val = video_data[video_key];
                var val_type = typeof video_val;
                if ((video_val === null) || (val_type === 'string') || (val_type === 'number')) {
                    use_data[video_key] = video_val;
                }
                else if (val_type === 'object') {
                    var video_part_correct = true;
                    for (var video_subkey in video_val) {

                        var video_subkey_correct = false;
                        if (typeof video_subkey === 'string') {
                            if (video_subkey.match(/^[\w]+$/)) {
                                video_subkey_correct = true;
                            }
                        }
                        if (typeof video_subkey === 'number') {
                            video_subkey_correct = true;
                        }
                        if (!video_subkey_correct) {
                            video_part_correct = false;
                            break
                        }

                        var video_subval = video_val[video_subkey];
                        var subval_type = typeof video_subval;
                        if ((video_subval !== null) && (subval_type !== 'string') && (subval_type !== 'number')) {
                            video_part_correct = false;
                            break
                        }
                    }
                    if (video_part_correct) {
                        use_data[video_key] = video_val;
                    }
                }
            }
        }

        return use_data;
    };

    var update_youtube_info = function(video_data) {
        var html_escape_inner = window._ubi_cd_utilities['html_escape_inner'];
        var get_show_title = window._ubi_cd_utilities['get_show_title'];
        var get_date_time_show = window._ubi_cd_utilities['get_date_time_show'];

        if ((!video_data) || (typeof video_data !== 'object') || (!('id' in video_data)) || (!video_data.id)) {
            return;
        }

        var video_id = get_youtube_video();
        if (video_data.id != video_id) {
            return;
        }

        set_page_specific_id(video_id);
        try {
            // make sure the taken keys are valid for JSON
            set_page_specific_data({'video': take_youtube_video_data(video_data)});
        } catch (exc) {
            set_page_specific_data({});
        }

        var info = '';
        var video_part = null;

        var uploaded_info = '';
        if ('uploaded' in video_data) {
            try {
                var dt_uploaded = new Date(video_data['uploaded']);
                uploaded_info += 'uploaded: ' + html_escape_inner(get_date_time_show(dt_uploaded));
            }
            catch (exc) {}

            if ('updated' in video_data) {
                try {
                    var dt_updated = new Date(video_data['updated']);
                    uploaded_info += '\n  updated: ' + html_escape_inner(get_date_time_show(dt_updated));
                }
                catch (exc) {}
            }
        }
        if (uploaded_info) {
            $('#ubi_cd_page_info_detail_top').attr('title', uploaded_info)
        }

        info += '<table border="0">';

        if ('title' in video_data) {
            var video_link = 'http://www.youtube.com/watch?v=' + encodeURIComponent(video_id);
            video_part = get_show_title(video_data['title'], 40);
            info += '<tr><td ' + video_part['title'] + ' align="right">title:&nbsp;</td><td ' + video_part['title'] + '><a href="' + video_link + '" target="_blank">' + video_part['show'] + '</a></td></tr>';
        }

        if ('uploader' in video_data) {
            var user_link = 'http://www.youtube.com/user/' + encodeURIComponent(video_data['uploader']);
            video_part = get_show_title(video_data['uploader'], 40);
            info += '<tr><td id="ubi_cd_page_info_detail_youtube_uploader_label" ' + video_part['title'] + ' align="right">uploader:&nbsp;</td><td ' + video_part['title'] + '><a href="' + user_link + '" target="_blank"><span id="ubi_cd_page_info_detail_youtube_uploader" user_id="' + html_escape_inner(video_data['uploader']) + '">' + video_part['show'] + '</span></a></td></tr>';

            $.getJSON('//gdata.youtube.com/feeds/api/users/' + encodeURIComponent(video_data['uploader']) + '?v=2&alt=json', function(data, status, xhr) {
                if ((!data) || (!('entry' in data)) || (!data.entry)) {
                    return;
                }
                var user_to_update = $('#ubi_cd_page_info_detail_youtube_uploader').attr('user_id');
                if (!user_to_update) {
                    return;
                }

                var user_data = data.entry;
                if ((!('author' in user_data)) || (!user_data.author)) {
                    return;
                }
                var user_author_set = user_data.author;
                var user_author = null;
                if (user_author_set && user_author_set.length) {
                    user_author = user_author_set[0];
                }

                if ((!('uri' in user_author)) || (!user_author.uri) || (!('$t' in user_author.uri)) || (!user_author.uri['$t'])) {
                    return;
                }
                if (user_author.uri['$t'].indexOf(user_to_update) == -1) {
                    return;
                }

                // check and change the ($t) keys so that they are valid for JSON
                // take just the important data (id, uri, name/title, summary, ...)
                var current_spec_data = get_page_specific_data();
                try {
                    current_spec_data['user'] = take_youtube_user_data(user_data);
                }
                catch (exc) {
                    current_spec_data['user'] = {'user_id': user_to_update};
                }
                set_page_specific_data(current_spec_data);

                var user_title = '';
                if (('title' in user_data) && (user_data.title) && ('$t' in user_data.title) && (user_data.title['$t'])) {
                    user_title += user_data.title['$t'];
                }
                if (('summary' in user_data) && (user_data.summary) && ('$t' in user_data.summary) && (user_data.summary['$t'])) {
                    if (user_title) {
                        user_title += '\n\n';
                    }
                    user_title += user_data.summary['$t'];
                }

                if (user_title) {
                    $('#ubi_cd_page_info_detail_youtube_uploader').attr('title', user_title);
                    $('#ubi_cd_page_info_detail_youtube_uploader_label').attr('title', user_title);
                }
            });

        }

        if ('category' in video_data) {
            video_part = get_show_title(video_data['category'], 40);
            info += '<tr><td ' + video_part['title'] + ' align="right">category:&nbsp;</td><td ' + video_part['title'] + '>' + video_part['show'] + '</td></tr>';
        }

        if ('description' in video_data) {
            video_part = get_show_title(video_data['description'], 40);
            info += '<tr><td ' + video_part['title'] + ' align="right">description:&nbsp;</td><td ' + video_part['title'] + '>' + video_part['show'] + '</td></tr>';
        }

        info += '</table>';
        $('#' + page_info_elm_ids['text']).html(info);

        var media = '';

        if (video_data.thumbnail) {
            if (video_data.thumbnail.hqDefault) {
                media += '<img src="' + encodeURI(video_data.thumbnail.hqDefault) + '">';
            }
            else if (video_data.thumbnail.sqDefault) {
                media += '<img src="' + encodeURI(video_data.thumbnail.sqDefault) + '">';
            }
        }

        $('#' + page_info_elm_ids['media']).html(media);
        $('#' + page_info_elm_ids['media']).show();

        page_set_images();
    };

    var last_youtube_video_id = null;
    var reload_youtube_video_info = function() {
        last_youtube_video_id = null;

        $(window).on('popstate', function(ev) {
            reload_youtube_video_info();
        });
        $(document).click(function(){
            setTimeout(function(ev) {
                var check_video_id = get_youtube_video();

                if (!check_video_id) {
                    page_info_retake();
                    return;
                }

                if (last_youtube_video_id == check_video_id) {
                    return;
                }

                reload_youtube_video_info();
            }, 1000);
        });

        var video_id = get_youtube_video();
        if (!video_id) {
            page_info_retake();
            return;
        }
        last_youtube_video_id = video_id;

        $.getJSON('//gdata.youtube.com/feeds/api/videos/' + encodeURIComponent(video_id) + '?v=2&alt=jsonc', function(data, status, xhr) {
            if ((!data) || (!('data' in data)) || (!data.data)) {
                return;
            }
            update_youtube_info(data.data);
        });

    };

    var page_info_elm_ids = {};
    var page_info_retake = null;
    var page_set_images = null;
    var set_page_type = null;
    var set_page_specific_id = null;
    var set_page_specific_data = null;
    var get_page_specific_data = null;

    var set_page_info_youtube = function(view_spec) {
        page_info_elm_ids = view_spec['view_ids'];
        page_info_retake = view_spec['view_retake'];
        page_set_images = view_spec['set_images'];
        set_page_type = view_spec['set_page_type'];
        set_page_specific_id = view_spec['set_page_specific_id'];
        set_page_specific_data = view_spec['set_page_specific_data'];
        get_page_specific_data = view_spec['get_page_specific_data'];

        set_page_type('youtube_video');
        var video_id = get_youtube_video();

        var html_escape = window._ubi_cd_utilities['html_escape'];
        var page_top = 'type: youtube video (' + html_escape(video_id) + ')';
        $('#' + page_info_elm_ids['top']).html(page_top);

        reload_youtube_video_info();

    };

    var get_youtube_video = function() {
        var query_string = window._ubi_cd_utilities['get_query_string']();
        if (('v' in query_string) && query_string.v) {
            return query_string.v;
        }
        return null;
    };

    var is_youtube_video = function() {
        if (!document.location.href.match(/youtube.com/)) {
            return false;
        }
        if (!get_youtube_video) {
            return false;
        }
        return true;
    };

    window._ubi_cd_sites_specific.push({
        'belongs': is_youtube_video,
        'set_info': set_page_info_youtube
    });

})();
