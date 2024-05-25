/**
 * Call this when the chat page is loaded.
 */
export const chatPage = function () {
  const chatApp = document.querySelector('chat-app')

  chatApp.addEventListener('audioCall', (event) => calling('voice', event.detail.caller, event.detail.callerID))
  chatApp.addEventListener('videoCall', (event) => calling('video', event.detail.caller, event.detail.callerID))
  chatApp.addEventListener('confirmation', (event) => handleCall(event.detail.state))
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
  removeCallDisplay()

  if (type === 'audio' || type === 'video') {
    const chatApp = document.querySelector('chat-app')
    const documentBody = document.querySelector('#chat-page')
    chatApp.sendConfirmation(type)

    const audioVideoChat = document.createElement('video-audio-chat')
    audioVideoChat.setType(type)
    audioVideoChat.addEventListener('endCall', () => revertToTextChat())

    // Set all the same attributes from the chatApp onto the audio chat.
    for (const attr of chatApp.attributes) {
      audioVideoChat.setAttribute(attr.name, attr.value)
    }

    // Insert the video-audio-chat
    documentBody.prepend(audioVideoChat)
    documentBody.removeChild(chatApp)
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

/**
 * Removes the audio/video chat and brings back the text chat.
 */
function revertToTextChat () {
  const audioVideoChat = document.querySelector('video-audio-chat')
  const chatApp = document.createElement('chat-app')

  // Set all the same attributes from the audio chat onto the chatApp.
  for (const attr of audioVideoChat.attributes) {
    chatApp.setAttribute(attr.name, attr.value)
  }

  const documentBody = document.querySelector('#chat-page')
  documentBody.prepend(chatApp)
  documentBody.removeChild(audioVideoChat)
}
