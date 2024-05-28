import './components/settings-comps/delete-account/index.js'
import { settingsPage } from './settings.js'
import { friendsPage } from './friends.js'
import { chatPage } from './chat.js'
import { videoPage } from './video.js'

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
    case 'chat-page':
      chatPage()
      break
    case 'video-page':
      videoPage()
      break
    default:
      console.error('Unknown page:', currentPage)
  }
}

document.addEventListener('DOMContentLoaded', determinePage())
