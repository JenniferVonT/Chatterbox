/**
 * Call this when the chat page is loaded.
 */
export const chatPage = function () {
  const chatApp = document.querySelector('chat-app')

  chatApp.addEventListener('audioCall', (event) => {
    console.log(event)
    calling('voice', event.detail.caller)
  })
  chatApp.addEventListener('videoCall', (event) => calling('video', event.detail.caller))

  chatApp.addEventListener('acceptCall', (event) => console.log(event))
  chatApp.addEventListener('denyCall', (event) => console.log(event))
}

/**
 * Called to switch the chat-app component for the video-audio-chat component.
 *
 * @param {Event} event - The Event object.
 */
/*
function switchToAudioVideo (event) {

}
*/

/**
 * Inserts a call display when someone is calling.
 *
 * @param {callType} callType - The type of call, audio or video.
 * @param {caller} caller - The callers username.
 */
function calling (callType, caller) {
  const callDisplay = document.createElement('call-display')

  callDisplay.setCaller(caller)
  callDisplay.setCallType(callType)

  const documentBody = document.querySelector('#chat-page')
  documentBody.append(callDisplay)
}
