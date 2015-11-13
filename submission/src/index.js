
import * as github from './github'
import * as utils from './utils'
import Dropdown from './dropdown'

const BASE_REPO = 'trailbehind/OpenHuntingData'
const REPO_NAME = 'OpenHuntingData'
const TIMEOUT_SECS = 15


let params = utils.getParams()
  , form   = window.document.forms['submission']
  , pr = window.document.getElementById('pr')


/**
 * Sign in user, when loading the page or after authentication.
 * 
 * @param  {object} user Github user object.
 */
const signinUser = user => {
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

/**
 * Handle UI for start and done submitting events.
 */
const startSubmitting = () => {
    pr.setAttribute('disabled', 'disabled')
    pr.textContent = 'Submitting...'

}

const doneSubmitting = () => {
    pr.removeAttribute('disabeld')
    pr.textContent = 'Submit Pull Request'
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
      , message = `add ${source.country}/${source.state}/${filename}.json`
      , content = window.btoa(JSON.stringify(source, null, 3))

    github.getHead(repo, sha => {
        github.branchRepo(repo, branch, sha, () => {
            github.createFile(repo, branch, path, content, message, () => {
                github.pullRequest(BASE_REPO, username + ':' + branch, message, () => {
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

    github.getUser(user => {
        let username = user.login
          , repo = username + '/' + REPO_NAME

        github.getRepo(repo, response => {
            if (response) {
                addSource(username, repo, source)
            } else {
                github.forkRepo(BASE_REPO, () => {
                    let count = 0
                      , ping = window.setInterval(() => {
                        github.getRepo(repo, response => {
                            if (response) {
                                window.clearInterval(ping)
                                addSource(username, repo, source)
                            } else {
                                count += 1

                                if (count > TIMEOUT_SECS * 2) {
                                    window.clearInterval(ping)
                                    doneSubmitting()
                                }
                            }
                        })
                    }, 500)
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

