// Handle the nav-icons.
const friendsIcon = document.querySelector('#friend-icon')
const groupIcon = document.querySelector('#group-icon')
const settingsIcon = document.querySelector('#settings-icon')
const userID = document.querySelector('nav').getAttribute('UserID')

settingsIcon.addEventListener('click', () => handleHeaderIcons('/main/settings'))
friendsIcon.addEventListener('click', () => handleHeaderIcons(`/main/friends/${userID}`))
groupIcon.addEventListener('click', () => handleHeaderIcons(`/main/groups/${userID}`))

/**
 * Handles the header icons when clicked and makes a POST req to the server.
 *
 * @param {string} postAdress - Where to make the postAdress.
 */
async function handleHeaderIcons (postAdress) {
  try {
    // Make a POST req to the server.
    const response = await fetch(postAdress, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Error when requesting the ${postAdress}`)
    }
  } catch (err) {
    console.error('Error:', err.message)
  }
}
