(function(){
    if (typeof window._ubi_cd_runtime !== 'object') {
        return;
    }
    if (window._ubi_cd_runtime === null) {
        return;
    }
    if (window._ubi_cd_runtime['is_ux_started']) {
        return;
    }

    window._ubi_cd_runtime['is_ux_started'] = true;

    window._ubi_cd_ux = {};

    var css_margin_prev_next = '0px';
    if (navigator.userAgent.toLowerCase().indexOf('webkit') > -1) {
        css_margin_prev_next = '5px';
    }
    var get_css_margin_prev_next = function() {
        return css_margin_prev_next;
    };
    window._ubi_cd_ux['margin_prev_next'] = get_css_margin_prev_next;

    var text_unselect_css = {
        '-moz-user-select': 'none',
        '-khtml-user-select': 'none',
        '-webkit-user-select': 'none',
        '-ms-user-select': 'none',
        'user-select': 'none'
    };
    var get_text_unselect_css = function() {
        return text_unselect_css;
    };
    window._ubi_cd_ux['text_unselect_css'] = get_text_unselect_css;

    var back_cols = {
        'button_std': 'rgb(220, 220, 240)',
        'button_dis': 'silver',
        'term_found': 'yellow',
        'term_found_active': 'gold',
        'saved_view': '#f0f0f0',
        'saved_view_iframe': '#f0a020',
        'context_menu': '#ddd'
    };
    var get_back_cols = function() {
        return back_cols;
    };
    window._ubi_cd_ux['back_cols'] = get_back_cols;

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

    var button_css_flash = {
        'box-shadow': '0px 0px 0px 0px #ccc',
        'border': '2px solid rgb(150, 150, 150)',
        'border-radius': '0px'
    };

    var get_button_css = function() {
        if (!flash_css_dealt) {
            adjust_css_on_flash();
        }

        return button_css;
    };
    window._ubi_cd_ux['button_css'] = get_button_css;

    var flash_css_dealt = false;

    var adjust_css_on_flash = function() {
        // if displayed in non-flash way, we probably do not need to change css
        // and we should check other video sites, like vimeo
        var to_adjust_css = false;

        // youtube html5 dealing has issues on fixing the flash videos
        if (document.location.host.match(/youtube\.(?:co\.|com\.)?[\w]{2,4}$/)) {
            to_adjust_css = true;
        }

        // under chrome, it looks we have to call the fix_flash in any case,
        // and then to reload if page is html5 changed...
        if (navigator.userAgent.toLowerCase().indexOf('webkit') > -1) {
            to_adjust_css = false;
        }

        if (to_adjust_css) {
            for (var css_property in button_css_flash) {
                button_css[css_property] = button_css_flash[css_property];
            }
        }

        flash_css_dealt = true;

        return to_adjust_css;
    };

    var adjust_on_flash = function () {
        if (!adjust_css_on_flash()) {
            window._ubi_cd_utilities['fix_flash']();
        }
    };
    window._ubi_cd_ux['adjust_on_flash'] = adjust_on_flash;

    var is_video_update_safe = function() {
        // we have to do the flash fix even on youtube when under a webkit browser
        if (document.location.host.match(/youtube\.(?:co\.|com\.)?[\w]{2,4}$/)) {
            if (navigator.userAgent.toLowerCase().indexOf('webkit') > -1) {
                return false;
            }
        }
        return true;
    };
    window._ubi_cd_ux['video_update_safe'] = is_video_update_safe;

    var is_safe_to_pause = function() {
        // we have to do the flash fix even on youtube when under a webkit browser
        if (document.location.host.match(/youtube\.(?:co\.|com\.)?[\w]{2,4}$/)) {
            if (navigator.userAgent.toLowerCase().indexOf('webkit') > -1) {
                return false;
            }
        }
        return true;
    };
    window._ubi_cd_ux['safe_to_pause'] = is_safe_to_pause;

})();
