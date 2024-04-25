/**
 * Call this when the friends page is loaded.
 */
export const friendsPage = function () {
  const searchboxTitle = document.querySelector('#search-users')
  const searchBox = document.querySelector('#searchbox')
  const searchForm = document.querySelector('#search-form')
  console.log(searchBox, searchForm, searchboxTitle)

  searchboxTitle.addEventListener('click', () => {
    searchBox.classList.toggle('expanded')
    searchForm.classList.toggle('hiddenVis')
  })
}
