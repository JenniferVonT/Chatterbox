// Set up the settings page:

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
