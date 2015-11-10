
/**
 * Get params from URL.
 * 
 * Modified from http://stackoverflow.com/a/979996/1377021
 */
export const getParams = () => {
    let params = {}

    for (let param of window.location.search.substring(1).split('&')) {
        let nv = param.split('=')

        if (!nv[0]) continue;

        params[nv[0]] = nv[1] || true
    }

    return params
}
