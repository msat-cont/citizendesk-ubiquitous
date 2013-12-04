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

    if (typeof window._ubi_cd_sites_specific !== 'object') {
        return;
    }
    if (window._ubi_cd_sites_specific === null) {
        return;
    }

    // just a boilerplate for next development on photo-oriented sites
})();
