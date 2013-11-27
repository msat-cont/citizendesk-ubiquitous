(function(){
    if (typeof window._ubi_cd_sites_specific !== 'object') {
        return;
    }
    if (window._ubi_cd_sites_specific === null) {
        return;
    }

    var youtube_user_take_data = function(user_data) {
        if ((typeof user_data !== 'object') || (!user_data)) {
            return null;
        }

        var use_data = {};

        var use_parts = {
            'title': 'title',
            'summary': 'summary',
            'published': 'published',
            'updated': 'updated',
            'user_id': 'yt$userId',
            'user_name': 'yt$username',
            'channel_id': 'yt$channelId',
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

    var youtube_video_take_data = function(video_data) {
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

    var youtube_video_update_info = function(video_data) {
        var html_escape_inner = window._ubi_cd_utilities['html_escape_inner'];
        var get_show_title = window._ubi_cd_utilities['get_show_title'];
        var get_date_time_show = window._ubi_cd_utilities['get_date_time_show'];

        if ((!video_data) || (typeof video_data !== 'object') || (!('id' in video_data)) || (!video_data.id)) {
            return;
        }

        var video_id = youtube_video_get_id();
        if (video_data.id != video_id) {
            return;
        }
        user_data = null;

        outer_set_page_specific_id(video_id);
        try {
            // make sure the taken keys are valid for JSON
            video_data = youtube_video_take_data(video_data);
        } catch (exc) {
            video_data = {'id': video_id};
        }
        if (('uploader' in video_data) && video_data['uploader']) {
            user_data = {'user_name': video_data['uploader']};
        }

        outer_set_page_specific_data({'video': video_data, 'user': user_data});

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

        if (('title' in video_data) && video_data['title']) {
            var video_link = 'http://www.youtube.com/watch?v=' + encodeURIComponent(video_id);
            video_part = get_show_title(video_data['title'], 40);
            info += '<tr><td ' + video_part['title'] + ' align="right">title:&nbsp;</td><td ' + video_part['title'] + '><a href="' + video_link + '" target="_blank">' + video_part['show'] + '</a></td></tr>';
        }

        if (('uploader' in video_data) && video_data['uploader']) {
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

                // check and change the ($t) keys so that they are valid for JSON
                // take just the important data (id, uri, name/title, summary, ...)
                try {
                    user_data = youtube_user_take_data(user_data);
                }
                catch (exc) {
                    return;
                }

                if ((!('user_name' in user_data)) || (user_to_update != user_data['user_name'])) {
                    return;
                }

                var current_spec_data = outer_get_page_specific_data();
                if (!current_spec_data) {
                    current_spec_data = {};
                }
                current_spec_data['user'] = user_data;
                outer_set_page_specific_data(current_spec_data);

                var user_title = '';
                if (('title' in user_data) && (user_data.title)) {
                    user_title += user_data.title;
                }
                if (('summary' in user_data) && (user_data.summary)) {
                    if (user_title) {
                        user_title += '\n\n';
                    }
                    user_title += user_data.summary;
                }

                if (user_title) {
                    $('#ubi_cd_page_info_detail_youtube_uploader').attr('title', user_title);
                    $('#ubi_cd_page_info_detail_youtube_uploader_label').attr('title', user_title);
                }
            });

        }

        if (('category' in video_data) && video_data['category']) {
            video_part = get_show_title(video_data['category'], 40);
            info += '<tr><td ' + video_part['title'] + ' align="right">category:&nbsp;</td><td ' + video_part['title'] + '>' + video_part['show'] + '</td></tr>';
        }

        if (('description' in video_data) && video_data['description']) {
            video_part = get_show_title(video_data['description'], 40);
            info += '<tr><td ' + video_part['title'] + ' align="right">description:&nbsp;</td><td ' + video_part['title'] + '>' + video_part['show'] + '</td></tr>';
        }

        info += '</table>';
        $('#' + outer_page_info_elm_ids['text']).html(info);

        var media = '';

        if (video_data.thumbnail) {
            if (video_data.thumbnail.hqDefault) {
                media += '<img src="' + encodeURI(video_data.thumbnail.hqDefault) + '">';
            }
            else if (video_data.thumbnail.sqDefault) {
                media += '<img src="' + encodeURI(video_data.thumbnail.sqDefault) + '">';
            }
        }

        $('#' + outer_page_info_elm_ids['media']).html(media);
        $('#' + outer_page_info_elm_ids['media']).show();

        outer_page_set_images();
    };

    var youtube_video_get_id = function() {
        if (!document.location.host.match(/youtube\.(?:co\.|com\.)?[\w]{2,4}$/)) {
            return null;
        }
        var query_string = window._ubi_cd_utilities['get_query_string']();
        if (('v' in query_string) && query_string.v) {
            return query_string.v;
        }

        var embed_match = document.location.pathname.match(/\/embed\/([\w]+)/);
        if (embed_match && ('1' in embed_match)) {
            return embed_match['1'];
        }

        return null;
    };

    var youtube_video_page_type = 'youtube video';

    var outer_page_info_elm_ids = {};
    var outer_page_info_retake = null;
    var outer_page_set_images = null;
    var outer_get_page_specific_id = null;
    var outer_set_page_specific_id = null;
    var outer_get_page_specific_data = null;
    var outer_set_page_specific_data = null;

    var youtube_video_last_id = null;

    var youtube_video_retake_all = function() {
        youtube_video_last_id = null;
        outer_page_info_retake();
    };

    var youtube_video_initialize = function(view_spec) {
        youtube_video_last_id = null;

        outer_page_info_elm_ids = view_spec['view_ids'];
        outer_page_info_retake = view_spec['view_retake'];
        outer_page_set_images = view_spec['set_images'];
        outer_get_page_specific_id = view_spec['get_page_specific_id'];
        outer_set_page_specific_id = view_spec['set_page_specific_id'];
        outer_get_page_specific_data = view_spec['get_page_specific_data'];
        outer_set_page_specific_data = view_spec['set_page_specific_data'];
    };

    var youtube_video_get_type = function() {
        if (youtube_video_get_id()) {
            return youtube_video_page_type;
        }
        return null;
    };

    var youtube_video_set_page_info = function() {

        var video_id = youtube_video_get_id();
        if (!video_id) {
            youtube_video_retake_all();
            return;
        }

        if (youtube_video_last_id == video_id) {
            return;
        }
        youtube_video_last_id = video_id;

        var html_escape = window._ubi_cd_utilities['html_escape'];
        var page_top = 'type: ' + youtube_video_page_type + ' (' + html_escape(video_id) + ')';
        $('#' + outer_page_info_elm_ids['top']).html(page_top);

        $.getJSON('//gdata.youtube.com/feeds/api/videos/' + encodeURIComponent(video_id) + '?v=2&alt=jsonc', function(data, status, xhr) {
            if ((!data) || (!('data' in data)) || (typeof data !== 'object') || (!data.data)) {
                return;
            }
            youtube_video_update_info(data.data);
        });

    };

    window._ubi_cd_sites_specific.push({
        'initialize': youtube_video_initialize,
        'get_type': youtube_video_get_type,
        'set_info': youtube_video_set_page_info
    });

})();
