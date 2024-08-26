// Define mapping of page names to module paths and function names
const pageModuleMap = {
  'settings-page': { path: '../../settingsView/js/settings.js', functionName: 'settingsPage' },
  'friends-page': { path: '../../friendView/js/friends.js', functionName: 'friendsPage' },
  'chat-page': { path: '../../chatView/js/chat.js', functionName: 'chatPage' },
  'video-page': { path: '../../chatView/js/video.js', functionName: 'videoPage' }
}

// Dynamically import JavaScript files based on the current page
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Determine the current page
    const page = document.querySelector('main')
    const firstDiv = page.querySelectorAll('div')
    let currentPage = ''

    if (firstDiv[0].hasAttribute('id')) {
      currentPage = firstDiv[0].getAttribute('id')
    } else {
      currentPage = firstDiv[1].getAttribute('id')
    }

    const { path, functionName } = pageModuleMap[currentPage]
    if (path && functionName) {
      await importAndRun(path, functionName)
    }
  } catch (err) {
    // Do nothing if the page is not found.
  }
})

/**
 * Imports and runs the module.
 *
 * @param {string} path - The path to the module.
 * @param {string} functionName - The main function to run in said module.
 */
async function importAndRun (path, functionName) {
  const module = await import(path)
  module[functionName]()
}
