import { calling } from '../../chatView/js/chat.js'

// export const socket = new WebSocket(`wss://cscloud6-191.lnu.se/chatterbox/${document.querySelector('header').getAttribute('userID')}`)
export const socket = new WebSocket(`ws://localhost:9696/${document.querySelector('header').getAttribute('userID')}`) /* USE WHEN WORKING LOCALLY */

// ----------------------------------------------------------------------------
// Event handlers.
//

// Connection closed.
socket.addEventListener('close', (event) => {
  console.info('close', event)
})

// Connection error.
socket.addEventListener('error', (event) => {
  console.error('error', event)
})

// Listen for messages.
socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data)
  const page = window.location.pathname

  console.log('message', event)

  // Listen for 'notification - msg' or 'notification - call' type messages.
  if (data.type === 'notification - msg') {
    let count = 0

    if (data.data.length > 0) {
      count = data.data.length
    }

    const badge = document.querySelector('#notification-badge')

    // Show the amount of unread messages in the header.
    if (count > 0) {
      badge.textContent = count
      badge.style.display = 'flex'
    } else {
      badge.textContent = ''
      badge.style.display = 'none'
    }

    // Show the amount of unread messages in each chat.
    const unreadNotifications = {}

    // First decide how many notifications per chat room.
    for (const chat of data.data) {
      if (!unreadNotifications[chat.chatID]) {
        unreadNotifications[chat.chatID] = 0
      }
      unreadNotifications[chat.chatID] += 1
    }

    const uniqueChats = []

    // Remove all the doublicates to be able to assign all the notifications to each chat.
    data.data.forEach(obj => {
      if (!uniqueChats.includes(obj.chatID)) {
        uniqueChats.push(obj.chatID)
      }
    })

    console.log('unique: ', uniqueChats)

    // Update the DOM with all the notifications.
    for (const chat of uniqueChats) {
      const listBadge = document.querySelector(`[chatList=${chat}] .chat-notification`)
      listBadge.textContent = unreadNotifications[chat]
      listBadge.style.display = 'flex'
    }

    // Show or hide notification badges depending on if there is an unread message or not.
    const allBadges = document.querySelectorAll('.chat-notification')

    for (const badge of allBadges) {
      if (badge.textContent === '' || badge.textContent === undefined) {
        badge.style.display = 'none'
      } else {
        badge.style.display = 'flex'
      }
    }
  } else if (data.type === 'call' && !page.includes(data.key)) {
    // Show the call notification.
    calling(data.caller, data.callerID, data.key)
  }
})

// Connection opened.
socket.addEventListener('open', (event) => {
  console.info('open', event)
})
