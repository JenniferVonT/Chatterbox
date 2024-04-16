/**
 * A simple component to view a logged in users status.
 *
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

const template = document.createElement('template')
template.innerHTML = `
<style>
  :host {
    display: inline-block;
    color: #D3B1C2;
  }

  #container {
    display: flex;
    align-items: center;
    height: 50px;
    width: max-content;
    background-color: transparent;
    border: 2px solid #D3B1C2;
    border-radius: 10px;
  }

  h4 {
    font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
    font-weight: 200;
    font-size: larger;
    margin: 10px;
    padding: 0;
  }

  #username {
    color: #ecdde5;
  }

  #profile-container img,
  #profile-container ::slotted(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  #profile-container {
    width: 40px;
    height: 40px;
    border: 2px solid #D3B1C2;
    border-radius: 6px;
    overflow: hidden;
    margin-left: 15px;
    margin-right: 5px;
  }
</style>

<div id="container">
  <div id="profile-container">
    <slot name="profile"></slot>
  </div>

  <h4>Logged in: <b id="username"></b></h4>

</div>
`
customElements.define('logged-in-box',
  /**
   * Represents a logged-in-box element.
   */
  class extends HTMLElement {
    /**
     * Creates an instance of the current type.
     */
    constructor () {
      super()

      this.attachShadow({ mode: 'open' })
        .appendChild(template.content.cloneNode(true))

      this.component = this.shadowRoot.querySelector('#container')
      this.username = this.shadowRoot.querySelector('#username')
    }

    /**
     * Observe the name attribute.
     *
     * @returns {string[]} - an array representing the attribute.
     */
    static get observedAttributes () {
      return ['name']
    }

    /**
     * Calls the handleName method if the name attribute is being added to the component.
     *
     * @param {string} name - the name of the attribute.
     */
    attributeChangedCallback (name) {
      if (name === 'name') {
        this.#handleName()
      }
    }

    /**
     * Sets the name attribute on the component.
     *
     * @param {string} username - The username to display.
     */
    setName (username) {
      this.setAttribute('name', username)
    }

    /**
     * Sets the name in the component.
     */
    #handleName () {
      if (this.getAttribute('name') !== null) {
        this.username.textContent = this.getAttribute('name')
      } else {
        this.username.textContent = 'undefined'
      }
    }
  })
