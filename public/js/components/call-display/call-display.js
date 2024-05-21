/**
 * A simple component to view a call coming in.
 *
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

const template = document.createElement('template')
template.innerHTML = `
<style>
</style>
<div>
  <h1>HELLO!</h1>
  <p id=username></p>
  <p id=userID></p>
  <p id=callType></p>
</div>
`
customElements.define('call-display',
  /**
   * Represents a call-display element.
   */
  class extends HTMLElement {
    /**
     * Creates an instance of the current type.
     */
    constructor () {
      super()

      this.attachShadow({ mode: 'open' })
        .appendChild(template.content.cloneNode(true))

      this.username = ''
      this.userID = ''
      this.callType = ''

      this.#insertData()
    }

    /**
     * Set the call type to either 'audio' or 'video'.
     *
     * @param {string} callType - The call type.
     */
    setCallType (callType) {
      if (callType === 'audio') {
        this.callType = 'audio'
      }

      if (callType === 'video') {
        this.callType = 'video'
      }

      this.#insertData()
    }

    /**
     * Sets the caller up.
     *
     * @param {string} username - the username of the caller.
     * @param {string} userID - the id of the caller.
     */
    setCaller (username, userID) {
      this.username = username
      this.userID = userID

      this.#insertData()
    }

    /**
     * Inserts the data into the component.
     */
    #insertData () {
      const user = this.shadowRoot.querySelector('#username')
      const id = this.shadowRoot.querySelector('#userID')
      const callType = this.shadowRoot.querySelector('#callType')

      user.textContent = this.username
      id.textContent = this.userID
      callType.textContent = this.callType
    }
  }
)
