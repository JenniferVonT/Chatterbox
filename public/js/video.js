/**
 * Call this when the chat page is loaded.
 */
export const videoPage = function () {
  const audioVideoChat = document.querySelector('video-audio-chat')
  audioVideoChat.addEventListener('endCall', () => revertToTextChat())
}

/**
 * Reroutes to the chat-page.
 */
function revertToTextChat () {
  const id = document.querySelector('video-audio-chat').getAttribute('chatID')

  // Redirect to the chat page.
  window.location.href = `./main/chat/${id}`
}
