(function(){
    if (typeof window._ubi_cd_runtime != 'object') {
        return;
    }
    if (window._ubi_cd_runtime === null) {
        return;
    }
    if (window._ubi_cd_runtime['is_sites_started']) {
        return;
    }

    window._ubi_cd_runtime['is_sites_started'] = true;

    var page_specific_data = null;

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

        // make sure the keys are valid for JSON
        page_specific_data = {'video': video_data};
        //page_specific_data = video_data;

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
                //if (page_specific_data) {
                //    page_specific_data['user'] = user_data;
                //}

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

        prepare_images();
    };

    var last_youtube_video_id = null;
    var reload_youtube_video_info = function() {
        last_youtube_video_id = null;

        //$(window).on('onloaddata', function(ev) {
        //    reload_youtube_video_info();
        //});

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

    var set_page_info_youtube = function(video_id) {
        var html_escape = window._ubi_cd_utilities['html_escape'];

        var page_top = 'type: youtube video (' + html_escape(video_id) + ')';
        $('#' + page_info_elm_ids['top']).html(page_top);

        reload_youtube_video_info();

    };

    var set_page_info_general = function() {
        page_specific_data = null;

        var html_escape = window._ubi_cd_utilities['html_escape'];

        var top_info = '';
        top_info += 'type: general';

        var text_info = '';
        text_info += 'title: ' + html_escape(document.title) + '';

        $('#' + page_info_elm_ids['top']).html(top_info);
        $('#' + page_info_elm_ids['text']).html(text_info);
        $('#' + page_info_elm_ids['media']).hide();

    };

    var get_youtube_video = function() {
        var query_string = window._ubi_cd_utilities['get_query_string']();
        if (('v' in query_string) && query_string.v) {
            return query_string.v;
        }
        return null;
    };

    var page_info_elm_ids = {};
    var page_info_retake = null;
    var set_page_particular_info = function(view_spec) {
        page_info_elm_ids = view_spec['view_ids'];
        page_info_retake = view_spec['view_retake'];

        var video_id = get_youtube_video();
        if (video_id) {
            set_page_info_youtube(video_id);
        }
        else {
            set_page_info_general();
        }
    };

    var get_page_specific_data = function() {
        return page_specific_data;
    };

    window._ubi_cd_sites = {};
    window._ubi_cd_sites['set_page_view'] = set_page_particular_info;
    window._ubi_cd_sites['get_page_data'] = get_page_specific_data;

})();
