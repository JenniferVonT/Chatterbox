/**
 * Call this when the chat page is loaded.
 */
export const chatPage = function () {
  const chatApp = document.querySelector('chat-app')

  chatApp.addEventListener('audioCall', (event) => calling('voice', event.detail.caller, event.detail.callerID))
  chatApp.addEventListener('videoCall', (event) => calling('video', event.detail.caller, event.detail.callerID))
}

/**
 * Inserts a call display when someone is calling.
 *
 * @param {string} callType - The type of call, audio or video.
 * @param {string} caller - The callers username.
 * @param {string} callerID - The callers id.
 */
function calling (callType, caller, callerID) {
  const callDisplay = document.createElement('call-display')

  callDisplay.setCaller(caller, callerID)
  callDisplay.setCallType(callType)

  callDisplay.addEventListener('audioCallAccepted', () => handleCall('audio'))
  callDisplay.addEventListener('videoCallAccepted', () => handleCall('video'))
  callDisplay.addEventListener('callDenied', () => handleCall('denied'))

  const chatApp = document.querySelector('chat-app')

  // Disable the call buttons for 20sec.
  chatApp.toggleCallBtns()
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
 * @param {string} type - Type of call (audio or video) or denied call.
 */
function handleCall (type) {
  const chatApp = document.querySelector('chat-app')
  const documentBody = document.querySelector('#chat-page')
  removeCallDisplay()

  if (type === 'audio' || type === 'video') {
    chatApp.sendConfirmation(type)
    chatApp.classList.add('hidden')

    const audioChat = document.createElement('video-audio-chat')
    audioChat.setType(type)

    // Set all the same attributes from the chatApp onto the audio chat.
    for (const attr of chatApp.attributes) {
      audioChat.setAttribute(attr.name, attr.value)
    }

    documentBody.prepend(audioChat)
  }
}

/**
 * Removes the call display from the DOM.
 */
function removeCallDisplay () {
  const callDisplay = document.querySelector('call-display')
  const documentBody = document.querySelector('#chat-page')
  documentBody.removeChild(callDisplay)
}
