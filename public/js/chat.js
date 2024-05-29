/**
 * Call this when the chat page is loaded.
 */
export const chatPage = function () {
  const chatApp = document.querySelector('chat-app')

  chatApp.addEventListener('calling', (event) => calling(event.detail.caller, event.detail.callerID))
  chatApp.addEventListener('confirmation', () => handleCall('confirmation'))
}

/**
 * Inserts a call display when someone is calling.
 *
 * @param {string} caller - The callers username.
 * @param {string} callerID - The callers id.
 */
function calling (caller, callerID) {
  const callDisplay = document.createElement('call-display')

  callDisplay.setCaller(caller, callerID)

  callDisplay.addEventListener('callAccepted', () => handleCall('accepted'))
  callDisplay.addEventListener('callDenied', () => handleCall('denied'))

  const chatApp = document.querySelector('chat-app')

  // Disable the call button for 20sec.
  chatApp.toggleCallBtn()
  setTimeout(() => chatApp.toggleCallBtns(), 20_000)

  const documentBody = document.querySelector('#chat-page')
  documentBody.prepend(callDisplay)

  setTimeout(() => {
    if (documentBody.contains(callDisplay)) {
      documentBody.removeChild(callDisplay)
    }
  }, 20_000)
}

/**
 * Handles the calls.
 *
 * @param {string} confirmed - If the call is accepted, denied or if it is a confirmation from the receiver.
 */
function handleCall (confirmed) {
  removeCallDisplay()
  const chatApp = document.querySelector('chat-app')

  if (confirmed === 'accepted' || confirmed === 'confirmation') {
    if (confirmed !== 'confirmation') {
      chatApp.sendConfirmation('accept')
    }

    // Redirect to the video page.
    window.location.href = `./main/chat/video/${chatApp.getAttribute('chatID')}`
  }

  if (confirmed === 'denied') {
    chatApp.sendConfirmation('denied')
  }
}

/**
 * Removes the call display from the DOM.
 */
function removeCallDisplay () {
  const callDisplay = document.querySelector('call-display')
  const documentBody = document.querySelector('#chat-page')

  if (callDisplay) {
    documentBody.removeChild(callDisplay)
  }
}
