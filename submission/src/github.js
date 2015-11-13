
import nanoajax from 'nanoajax'

const API_BASE = 'https://api.github.com'

/*
 * Github is restrictive on cookie usage on Github Pages. Use localStorage
 * to store the OAuth token.
 */
let token = window.localStorage.getItem('token')


export const getToken = () => token

export const clearToken = () => {
    window.localStorage.removeItem('token')
}

/**
 * Get access token from Github OAuth code.
 * 
 * @param  {string} code OAuth code from Github API
 */
export const accessToken = (code, cb) => {
    nanoajax.ajax({
        url: 'http://github-gatekeeper.aws.gaiagps.com/authenticate/' + code
    }, (code, response) => {
        token = JSON.parse(response).token
        window.localStorage.setItem('token', token)

        cb(token)
    })
}

/**
 * AJAX call with Github Authorization header.
 * 
 * @param  {object}   options nanoajax options
 * @param  {function} cb      callback
 */
export const ajax = (options, cb) => {
    options.headers = {'Authorization': 'token ' + token}

    nanoajax.ajax(options, (code, response) => cb(JSON.parse(response)))
}

/**
 * Get user.
 * 
 * @param  {function} cb callback
 */
export const getUser = cb => {
    ajax({ url: API_BASE + '/user' }, cb)
}

/**
 * Get repo if exists.
 *
 * @param  {string}   repo repo to check.
 * @param  {function} cb   callback
 */
export const getRepo = (repo, cb) => {
    ajax({ url: API_BASE + '/repos/' + repo }, response => {
        if (response.message && response.message === 'Not Found') {
            cb(null)
        } else {
            cb(response)
        }
    })
}

/**
 * Get latest commit SHA on master branch.
 * 
 * @param  {string}   repo repo to get commit from.
 * @param  {function} cb   callback
 */
export const getHead = (repo, cb) => {
    ajax({ url: API_BASE + '/repos/' + repo + '/git/refs/heads/master' }, response => {
        cb(response.object.sha)
    })
}

/**
 * Fork repo.
 *
 * @param  {string}   repo repo to fork, ie. 'trailbehind/OpenHuntingData'
 * @param  {function} cb   callback
 */
export const forkRepo = (repo, cb) => {
    ajax({
        url: API_BASE + '/repos/' + repo + '/forks',
        method: 'POST'
    }, cb)
}

/**
 * Create branch in repo.
 * 
 * @param  {string}   repo   repo to create the branch in.
 * @param  {string}   branch branch name.
 * @param  {string}   sha    SHA1 to set the branch to.
 * @param  {function} cb     callback
 */
export const branchRepo = (repo, branch, sha, cb) => {
    ajax({
        url: API_BASE + '/repos/' + repo + '/git/refs',
        body: JSON.stringify({
            ref: 'refs/heads/' + branch,
            sha: sha
        })
    }, cb)
}

/**
 * Create file in repo.
 * 
 * @param  {string}   repo    repo to create the file in.
 * @param  {string}   branch  branch to create the file in.
 * @param  {string}   path    file path.
 * @param  {base64}   content base64 encoded file content.
 * @param  {string}   message commit message.
 * @param  {function} cb      callback
 */
export const createFile = (repo, branch, path, content, message, cb) => {
    ajax({
        url: API_BASE + '/repos/' + repo + '/contents/' + path,
        method: 'PUT',
        body: JSON.stringify({
            message: message,
            content: content,
            branch: branch
        })
    }, cb)
}

/**
 * Create a pull request
 * 
 * @param  {string}   repo    repo to create the pull request in.
 * @param  {string}   head    branch to pull request, ie. user:add-source
 * @param  {string}   message pull request title.
 * @param  {function} cb      callback
 */
export const pullRequest = (repo, head, message, cb) => {
    ajax({
        url: API_BASE + '/repos/' + repo + '/pulls',
        body: JSON.stringify({
            title: message,
            head: head,
            base: 'master'
        })
    }, cb)
}
