// <----------------------------- SETTINGS PAGE ----------------------------->
document.querySelectorAll('.settings-components h3').forEach(h3 => {
  h3.addEventListener('click', () => {
    const parent = h3.closest('.settings-components')
    parent.classList.toggle('expanded')
    const form = parent.querySelector('form')
    const deleteAcc = parent.querySelector('delete-account')

    if (form) {
      form.classList.toggle('hidden2')
    } else {
      deleteAcc.classList.toggle('hidden2')
    }
  })
})

// Handle the profile img being changed:
const profileSelector = document.querySelector('profile-selector')
const profileURI = profileSelector.getAttribute('current-img')
const currentImage = profileSelector.querySelector(`img[src="./img/profiles/${profileURI}"]`)
currentImage.setAttribute('current', '')

profileSelector.addEventListener('profileImageChanged', (event) => handleProfileChange(event))

/**
 * Handles the post request to the server to change profile image.
 *
 * @param {Event} event - the custom event for profile images.
 */
async function handleProfileChange (event) {
  try {
    const data = event.detail
    const imageURI = data.fileName

    const response = await fetch('/changeProfileImg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: imageURI
      })
    })

    if (response.status !== 200) {
      throw new Error('post request failed!')
    }

    currentImage.setAttribute('current', '')

    location.replace(location.href)
  } catch (error) {
    console.error('An error occured: ', error)
  }
}

// Handle the deletion of an account in the settings:

const deleteUser = document.querySelector('delete-account')

deleteUser.addEventListener('deleteAccount', () => deleteUserHandler())

/**
 * Handles when a user deletes their account.
 */
async function deleteUserHandler () {
  try {
    const response = await fetch('/deleteUser', { method: 'POST' })

    if (response.status !== 200) {
      location.replace(location.href)
    }

    location.replace('/')
  } catch (error) {
    console.error('An error occured: ', error)
  }
}
