(function(){
    // we should put here strings with (some form of) ids, and date-time formatting
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

    if (typeof window._ubi_cd_runtime !== 'object') {
        return;
    }
    if (window._ubi_cd_runtime === null) {
        return;
    }
    if (window._ubi_cd_runtime['is_localization_started']) {
        return;
    }

    window._ubi_cd_runtime['is_localization_started'] = true;

    window._ubi_cd_localization = {};

    var strings_en = {
        'leaving_question': 'Finished taking the the page snippets?',
        'leaving_question_video_update': 'It is necessary to reload the page to update the video display.'
    };

    var local_strings = {
        'en': strings_en
    };

    var lang = 'en';

    window._ubi_cd_localization['lang'] = function(new_lang) {
        lang = new_lang;
    };

    window._ubi_cd_localization['get'] = function(prop) {
        var default_set = local_strings['en'];
        var string_set = (lang in local_strings) ? local_strings[lang] : default_set;
        if (prop in string_set) {
            return string_set[prop];
        }
        if (prop in default_set) {
            return default_set[prop];
        }
        return '';
    };

})();
