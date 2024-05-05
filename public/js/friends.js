/**
 * Call this when the friends page is loaded.
 */
export const friendsPage = function () {
  // Handle the search box.
  const searchboxTitle = document.querySelector('#search-users')
  const searchBox = document.querySelector('#searchbox')
  const searchForm = document.querySelector('#search-form')

  searchboxTitle.addEventListener('click', () => {
    searchBox.classList.toggle('expanded')
    searchForm.classList.toggle('hiddenVis')
  })

  // Handle the friend requests.
  const friendRequestTitle = document.querySelector('#friend-reqs')
  const friendRequests = document.querySelector('#friendReq-list')
  const friendReqTable = document.querySelector('#friendReq-table')

  friendRequestTitle.addEventListener('click', () => {
    friendRequests.classList.toggle('expanded')
    friendReqTable.classList.toggle('hiddenVis')
  })
}
