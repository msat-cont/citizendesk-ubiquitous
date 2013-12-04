(function(){
    if (typeof window._ubi_cd_runtime !== 'object') {
        return;
    }
    if (window._ubi_cd_runtime === null) {
        return;
    }
    if (!('local_jquery' in window._ubi_cd_runtime)) {
        return;
    }
    var $ = window._ubi_cd_runtime['local_jquery'];

    if (!('api_version' in window._ubi_cd_runtime)) {
        return;
    }
    var api_version = window._ubi_cd_runtime['api_version'];

    if (window._ubi_cd_runtime['is_sites_started']) {
        return;
    }

    window._ubi_cd_runtime['is_sites_started'] = true;

    if (!('_ubi_cd_sites_specific' in window)) {
        window._ubi_cd_sites_specific = [];
    }

    var specific_defs = [
        'ubi_cd_sites_video.js',
        'ubi_cd_sites_photo.js'
    ];

    var sites_url_base = '';
    try {
        sites_url_base = window._ubi_cd_spec['sites_url'];
    }
    catch (exc) {
        sites_url_base = '';
    }

    var last_slash_ind = sites_url_base.lastIndexOf('/');
    if (0 > last_slash_ind) {
        sites_url_base += '/';
    }
    else {
        sites_url_base = sites_url_base.substring(0, (last_slash_ind+1));
    }

    var current_spec = 0;
    var take_specific_defs = function() {
        var full_url_starts = ['http', '//'];

        if (current_spec < specific_defs.length) {
            var spec_to_load = specific_defs[current_spec];
            current_spec += 1;

            var full_url = false;
            for (var ind_fu = (full_url_starts.length-1); ind_fu >= 0; ind_fu-=1) {
                var cur_url_start = full_url_starts[ind_fu];
                if (cur_url_start == spec_to_load.substring(0,cur_url_start.length)) {
                    full_url = true;
                    break;
                }
            }

            if (!full_url) {
                spec_to_load = sites_url_base + spec_to_load;
            }
            take_one_specific(spec_to_load, take_specific_defs);
        }
        else {
            finish_site_preps();
        }
    };

    var take_one_specific = function(url, action) {
        var use_url = url;
        use_url += (url.indexOf('?') > -1) ? '&' : '?';
        var api_part = encodeURIComponent(api_version);
        use_url += 'api=' + api_part;

        var done = false;
        var script = document.createElement('script');
        script.src = use_url;
        script.onerror = script.onload = script.onreadystatechange = function(){
            if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
                done = true;
                action();
            }
        };
        document.getElementsByTagName('head')[0].appendChild(script);
    };
    take_specific_defs();

    var page_type_general = 'general';

    var page_specific_data = null;
    var page_specific_id = null;
    var page_type = page_type_general;

    var last_page_title = null;

    var set_page_info_general = function() {
        var cur_page_title = document.title;
        if (last_page_title === cur_page_title) {
            return;
        }

        page_specific_data = null;
        page_specific_id = null;

        var html_escape = window._ubi_cd_utilities['html_escape'];

        var top_info = '';
        top_info += 'type: ' + page_type_general;

        var text_info = '';
        text_info += 'title: ' + html_escape(cur_page_title) + '';

        $('#' + page_info_elm_ids['top']).html(top_info);
        $('#' + page_info_elm_ids['text']).html(text_info);
        $('#' + page_info_elm_ids['media']).hide();

    };

    var last_page_type = null;
    var catching_changes = false

    var nullify_page_info = function() {
        last_page_type = null;
        page_specific_data = null;
        page_specific_id = null;
        page_type = page_type_general;
        catching_changes = false
        last_page_title = null;
    };

    var page_info_retake_inner = function() {
        nullify_page_info();
        page_info_retake();
    };

    var general_ubi_props = null;
    var page_info_elm_ids = {};
    var page_info_retake = null;
    var page_set_images = null;
    var spec_out = {};
    var set_page_particular_info = function(view_spec) {
        nullify_page_info();

        general_ubi_props = view_spec['ubi_props'];
        page_info_elm_ids = view_spec['view_ids'];
        page_info_retake = view_spec['view_retake'];
        page_set_images = view_spec['set_images'];
        spec_out['api_version'] = api_version;
        spec_out['get_ubi_props'] = general_ubi_props;
        spec_out['view_ids'] = page_info_elm_ids;
        spec_out['view_retake'] = page_info_retake_inner;
        spec_out['set_images'] = page_set_images;
        spec_out['get_page_specific_id'] = get_page_specific_id_inner;
        spec_out['set_page_specific_id'] = set_page_specific_id;
        spec_out['get_page_specific_data'] = get_page_specific_data_inner;
        spec_out['set_page_specific_data'] = set_page_specific_data;

        var is_specific = false;
        var spec_count = window._ubi_cd_sites_specific.length;
        for (var ind_sc = 0; ind_sc < spec_count; ind_sc += 1) {
            var cur_spec = window._ubi_cd_sites_specific[ind_sc];
            if ((!cur_spec) || (typeof cur_spec !== 'object')) {
                cur_spec = window._ubi_cd_sites_specific[ind_sc] = {};
            }
            window._ubi_cd_sites_specific[ind_sc]['prepared'] = false;
            if (!('initialize' in cur_spec)) {
                continue;
            }
            if (!('get_type' in cur_spec)) {
                continue;
            }
            if (!('set_info' in cur_spec)) {
                continue;
            }
            try {
                cur_spec['initialize'](spec_out);
                window._ubi_cd_sites_specific[ind_sc]['prepared'] = true;
            }
            catch (exc) {
                window._ubi_cd_sites_specific[ind_sc]['prepared'] = false;
            }
            if (is_specific) {
                continue;
            }

            try {
                var test_type = cur_spec['get_type']();
                if (test_type) {
                    last_page_type = page_type = test_type;
                    cur_spec['set_info']();
                    is_specific = true;
                }
            }
            catch (exc) {
                page_type = page_type_general;
                last_page_type = null;
                is_specific = false;
                continue;
            }
        }

        if (!is_specific) {
            last_page_type = page_type = page_type_general;
            set_page_info_general();
        }

        catching_changes = true;
        intercept_changes();
    };

    var set_page_type = function(page_type_new) {
        page_type = page_type_new;
    };

    var get_page_type = function() {
        return page_type;
    };

    var set_page_specific_id = function(page_specific_id_new) {
        page_specific_id = page_specific_id_new;
    };

    var get_page_specific_id_inner = function() {
        return get_page_specific_id();
    };

    var get_page_specific_id = function() {
        if (!page_specific_id) {
            return '';
        }
        return page_specific_id;
    };

    var set_page_specific_data = function(page_specific_data_new) {
        page_specific_data = page_specific_data_new;
    };

    var get_page_specific_data_inner = function() {
        var data = get_page_specific_data();
        if (!data) {
            return {};
        }

        return data;
    };

    var get_page_specific_data = function() {
        if (!page_specific_data) {
            return null;
        }

        return page_specific_data;
    };

    var check_site_changed_outer = function() {
        setTimeout(function(ev) {
            check_site_changed();
        }, 10);
    };

    var check_site_changed = function() {
        if (!catching_changes) {
            return;
        }

        var got_type = false;
        var spec_count = window._ubi_cd_sites_specific.length;
        for (var ind_sc = 0; ind_sc < spec_count; ind_sc += 1) {
            var cur_spec = window._ubi_cd_sites_specific[ind_sc];
            if (!cur_spec['prepared']) {
                continue;
            }

            try {
                var test_type = cur_spec['get_type']();
                if (test_type) {
                    if (last_page_type != test_type) {
                        nullify_page_info();
                        page_info_retake();
                    }
                    else {
                        cur_spec['set_info']();
                    }
                    got_type = true;
                    break;
                }
            }
            catch (exc) {
                got_type = false;
                continue;
            }
        }

        if (!got_type) {
            if (page_type != page_type_general) {
                nullify_page_info();
                page_info_retake();
            }
            else {
                set_page_info_general();
            }
        }

    };

    var intercept_changes = function() {
        $(window).on('popstate', function(ev) {
            if (!catching_changes) {
                return;
            }
            setTimeout(function(ev) {
                check_site_changed();
            }, 10);
        });
        $(document).click(function(){
            if (!catching_changes) {
                return;
            }
            setTimeout(function(ev) {
                check_site_changed();
            }, 500);
        });
        
    };

    var pause_page_updates = function() {
        catching_changes = false;
    };

    var resume_page_updates = function() {
        catching_changes = true;
        check_site_changed_outer();
    };

    var finish_site_preps = function() {

        window._ubi_cd_sites = {};
        window._ubi_cd_sites['set_page_view'] = set_page_particular_info;
        window._ubi_cd_sites['check_page_view'] = check_site_changed_outer;
        window._ubi_cd_sites['get_page_data'] = get_page_specific_data;
        window._ubi_cd_sites['get_page_id'] = get_page_specific_id;
        window._ubi_cd_sites['get_page_type'] = get_page_type;
        window._ubi_cd_sites['pause_page_updates'] = pause_page_updates;
        window._ubi_cd_sites['resume_page_updates'] = resume_page_updates;
    };

})();
