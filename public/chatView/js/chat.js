import { socket } from '../../mainView/js/webSocket.js'

/**
 * Call this when the chat page is loaded.
 */
export const chatPage = function () {
  const chatApp = document.querySelector('chat-app')
  const chatID = chatApp.getAttribute('chatID')

  chatApp.addEventListener('calling', (event) => calling(event.detail.caller, event.detail.callerID, event.detail.chatID))
  chatApp.addEventListener('confirmation', () => handleCall('confirmation', chatID))

  // Remove the notifications for the current chat.
  const globalNotifications = document.querySelector('#notification-badge')
  const lokalNotifications = document.querySelector(`[chatlist=${chatID}] .chat-notification`)

  const amountToRemove = parseInt(lokalNotifications.textContent)

  // If there is any notifications to remove, remove them from both the global and individual notifications.
  if (amountToRemove) {
    const total = parseInt(globalNotifications.textContent) - amountToRemove
    globalNotifications.textContent = total
    if (total === 0) {
      globalNotifications.style.display = 'none'
    }
    lokalNotifications.textContent = ''
    lokalNotifications.style.display = 'none'
  }
}

/**
 * Inserts a call display when someone is calling.
 *
 * @param {string} caller - The callers username.
 * @param {string} callerID - The callers id.
 * @param {string} chatID - The chat rooms id.
 * @returns {string} - Returns the callerID for confirmation.
 */
export function calling (caller, callerID, chatID) {
  const callDisplay = document.createElement('call-display')

  callDisplay.setCaller(caller, callerID)

  callDisplay.addEventListener('callAccepted', () => handleCall('accepted', chatID))
  callDisplay.addEventListener('callDenied', () => handleCall('denied', chatID))

  const chatApp = document.querySelector('chat-app')

  // Disable the call button for 20sec.
  if (chatApp) {
    chatApp.toggleCallBtn()
    setTimeout(() => chatApp.toggleCallBtns(), 20_000)
  }

  const documentBody = document.querySelector('.content-body')
  documentBody.prepend(callDisplay)

  setTimeout(() => {
    if (documentBody.contains(callDisplay)) {
      documentBody.removeChild(callDisplay)
    }
  }, 20_000)

  return callerID
}

/**
 * Handles the calls.
 *
 * @param {string} confirmed - If the call is accepted, denied or if it is a confirmation from the receiver.
 * @param {string} chatID - The chat room that is making the call.
 */
function handleCall (confirmed, chatID) {
  const callerID = removeCallDisplay()
  const chatApp = document.querySelector('chat-app')
  let userID

  if (chatApp) {
    userID = chatApp.getAttribute('secondUserID')
  }

  if (confirmed === 'accepted' || confirmed === 'confirmation') {
    if (confirmed !== 'confirmation') {
      // If the user is already in the correct chatroom send a confirmation via the chat-app component.
      // Otherwise send directly in the socket with the correct chatID.
      if ((chatApp && userID === callerID)) {
        chatApp.sendConfirmation('accept')
      } else {
        const data = {
          type: 'confirmation',
          key: chatID,
          caller: callerID
        }

        socket.send(JSON.stringify(data))
      }

      removeCallDisplay()
    }

    // Redirect to the video page.
    window.location.href = `./main/chat/video/${chatID}`
  }

  // Do the same when the call is denied as the confirmation.
  if (confirmed === 'denied') {
    if ((chatApp && userID === callerID)) {
      chatApp.sendConfirmation('denied')
    } else {
      const data = {
        type: 'deniedCall',
        key: chatID,
        caller: callerID
      }

      socket.send(JSON.stringify(data))
    }

    removeCallDisplay()
  }
}

/**
 * Removes the call display from the DOM.
 */
function removeCallDisplay () {
  const callDisplay = document.querySelector('call-display')
  const documentBody = document.querySelector('.content-body')

  if (callDisplay) {
    documentBody.removeChild(callDisplay)
  }
}
