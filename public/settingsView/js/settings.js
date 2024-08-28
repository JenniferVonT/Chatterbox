/**
 * Call this when the settings page is loaded.
 */
export const settingsPage = function () {
  document.querySelectorAll('.settings-components h3').forEach(h3 => {
    h3.addEventListener('click', () => {
      const parent = h3.closest('.settings-components')
      parent.classList.toggle('expanded')
      const form = parent.querySelector('form')
      const deleteAcc = parent.querySelector('delete-account')

      if (form) {
        form.classList.toggle('hiddenVis')
      } else {
        deleteAcc.classList.toggle('hiddenVis')
      }
    })
  })

  // Handle the profile img being changed:
  const profileSelector = document.querySelector('profile-selector')

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

      const response = await fetch('/chatterbox/changeProfileImg', {
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

      profileSelector.removeAttribute('current-img')
      profileSelector.setAttribute('current-img', `./profile/${imageURI}`)

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
      const response = await fetch('/chatterbox/deleteUser', { method: 'POST' })

      if (response.status !== 200) {
        console.error('Couldn\'t delete the user.')
        location.reload()
      }

      location.replace('/chatterbox')
    } catch (error) {
      console.error('An error occured: ', error)
    }
  }
}
