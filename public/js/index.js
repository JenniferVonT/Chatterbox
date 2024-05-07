import './components/logged-in-box/index.js'
import './components/settings-comps/delete-account/index.js'
import './components/chat-app/index.js'
import { settingsPage } from './settings.js'
import { friendsPage } from './friends.js'

/**
 * Determine what page is loaded and run the corresponding js file.
 */
function determinePage () {
  const page = document.querySelector('main')
  const firstDiv = page.querySelectorAll('div')
  let currentPage = ''

  if (firstDiv[0].hasAttribute('id')) {
    currentPage = firstDiv[0].getAttribute('id')
  } else {
    currentPage = firstDiv[1].getAttribute('id')
  }

  switch (currentPage) {
    case 'settings':
      settingsPage()
      break
    case 'friends-page':
      friendsPage()
      break
    default:
      console.error('Unknown page:', currentPage)
  }
}

document.addEventListener('DOMContentLoaded', determinePage())
