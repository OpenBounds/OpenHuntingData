
import * as github from './github'
import * as utils from './utils'
import Dropdown from './dropdown'

const BASE_REPO = 'OpenBounds/OpenHuntingData'
const REPO_NAME = 'OpenHuntingData'
const TIMEOUT_SECS = 15


let params = utils.getParams()
  , form   = window.document.forms['submission']
  , pr = window.document.getElementById('pr')
  , alert = window.document.getElementById('alert')
  , manual = window.document.getElementById('manual')


/**
 * Sign in user, when loading the page or after authentication.
 * 
 * @param  {object} user Github user object.
 */
const signinUser = (err, user) => {
    let button = window.document.getElementById('signin')
      , signout = window.document.getElementById('signout')
      , blank  = window.document.getElementById('unauthenticated')

    button.setAttribute('href', '#')
    button.innerHTML = `<img class="avatar" src="${user.avatar_url + '&s=40'}" /> ${user.login}`

    blank.style.display = 'none'
    form.style.display = 'block'

    signout.addEventListener('click', signoutUser)

    new Dropdown(button)
}

const signoutUser = () => {
    github.clearToken()

    window.location.href = window.location.pathname
}

/*
 * Handle UI changes for start, done and error submitting events.
 */
const startSubmitting = () => {
    pr.setAttribute('disabled', 'disabled')
    pr.textContent = 'Submitting...'

}

const doneSubmitting = () => {
    pr.removeAttribute('disabled')
    pr.textContent = 'Submit Pull Request'
}

const errorSubmitting = (msg, content) => {
    alert.innerHTML = msg
    manual.getElementsByTagName('textarea')[0].textContent = content

    alert.style.display = 'block'
    manual.style.display = 'block'
}

const doneError = () => {
    alert.innerHTML = ''
    manual.getElementsByTagName('textarea')[0].textContent = ''

    alert.style.display = 'none'
    manual.style.display = 'none'

    doneSubmitting()
}

/**
 * Create a pull request to add a source file.
 *
 * Get the head sha of the master branch. Create a feature branch at that sha
 * named after the file being submitted. In the branch, create the source file
 * with Base64 encoded JSON pretty-printed content. Then submit a pull request
 * of the feature branch to the base repo.
 * 
 * @param  {string} username Github user's username.
 * @param  {string} repo     Repo to create the file in, ie. user/OpenHuntingData
 * @param  {object} source   Source object.
 */
const addSource = (username, repo, source) => {
    let filename = source.species.join('-').replace(/[\s]/g, '').toLowerCase()
      , path = `sources/${source.country}/${source.state}/${filename}.json`
      , branch = `add-${source.country}-${source.state}-${filename}`
      , msg = `add ${source.country}/${source.state}/${filename}.json`
      , errMsg = `Error submitting pull request. Create the file <strong>${path}</strong> with the JSON below.`
      , raw = JSON.stringify(source, null, 3)
      , content = window.btoa(raw)

    github.getHead(repo, (err, sha) => {
        if (err) return errorSubmitting(errMsg, raw)

        github.branchRepo(repo, branch, sha, (err) => {
            if (err) return errorSubmitting(errMsg, raw)

            github.createFile(repo, branch, path, content, msg, (err) => {
                if (err) return errorSubmitting(errMsg, raw)

                github.pullRequest(BASE_REPO, username + ':' + branch, msg, (err) => {
                    if (err) return errorSubmitting(errMsg, raw)

                    doneSubmitting()
                })
            })
        })
    })
}

/*
 * Submit source form to Github pull request.
 *
 * Create a source object from the source form. Get the authenticated user and
 * username from Github, then check if the user has already forked the repo.
 *
 * If the repo is found, add the source to the repo. Otherwise, create a fork
 * of the repo, and wait until it becomes available (async call). If fork
 * does not become available within TIMEOUT_SEC, fail.
 */
const submit = e => {
    let source
      , filename
      , path
      , errMsg
      , raw

    e.preventDefault()

    if (!github.getToken()) return

    startSubmitting()

    source = {
        url: form.url.value,
        species: form.species.value.split(', '),
        attribution: form.attribution.value,
        properties: {},
        country: form.country.value,
        state: form.state.value,
        filetype: form.filetype.value
    }

    for (let property of ['id', 'name']) {
        source.properties[property] = form[property].value
    }

    filename = source.species.join('-').replace(/[\s]/g, '').toLowerCase()
    path = `sources/${source.country}/${source.state}/${filename}.json`
    errMsg = `Error submitting pull request. Create the file <strong>${path}</strong> with the JSON below.`
    raw = JSON.stringify(source, null, 3)

    github.getUser((err, user) => {
        if (err) return errorSubmitting(errMsg, raw)

        let username = user.login
          , repo = username + '/' + REPO_NAME

        github.getRepo(repo, (err, response) => {
            if (err) return errorSubmitting(errMsg, raw)

            if (response) {
                addSource(username, repo, source)
            } else {
                github.forkRepo(BASE_REPO, (err) => {
                    if (err) return errorSubmitting(errMsg, raw)

                    github.getRepo(repo, (err) => {
                        if (err) return errorSubmitting(errMsg, raw)

                        let count = 0
                          , ping = window.setInterval(() => {
                            github.getHead(repo, (err, sha) => {
                                if (sha) {
                                    window.clearInterval(ping)
                                    addSource(username, repo, source)
                                } else {
                                    count += 1

                                    if (count > TIMEOUT_SECS * 2) {
                                        window.clearInterval(ping)

                                        errorSubmitting(errMsg, raw)
                                    }
                                }
                            })
                        }, 500)
                    })
                })
            }
        })
    })
}

/*
 * Handle user authentication and OAuth response. If the user token is present
 * when the page loads, retrieve the user object from Github and update the
 * UI. Otherwise, if the URL parameter `code` is set (a resposne from Github's
 * OAuth API), exchange it for a token with Gatekeeper.
 *
 * Replace the window history state to prevent multiple tokens being created,
 * then update the UI.
 */
if (github.getToken()) {
    github.getUser(signinUser)
} else {
    if (params.code) {
        github.accessToken(params.code, () => {
            window.history.replaceState({}, window.document.title, window.location.pathname)
            github.getUser(signinUser)
        })
    }
}

/*
 * Listen for the form submit event, and submit a pull request of the new source.
 */
form.addEventListener('submit', submit, false)

/*
 * Clear error message when done button is clicked.
 */
window.document.getElementById('doneerror').addEventListener('click', doneError, false)
