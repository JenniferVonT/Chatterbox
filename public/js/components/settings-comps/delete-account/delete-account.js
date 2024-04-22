/**
 * A simple component that double checks if a user wants to delete their account.
 *
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

const template = document.createElement('template')
template.innerHTML = `
<style>
  :host {
    font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
    display: block;
    padding: 10px;
    box-sizing: border-box;
    max-width: 300px;
    max-height: 400px;
  }

  .hidden {
    display: none;
  }

  button {
    margin: 5px;
    width: 80px;
    height: min-content;
    border-radius: 5px;
    border: 1px solid #211522;
    color: #211522;
    background-color: #c30a00;
  }

  button:hover {
    border-color: #D3B1C2;
    color: #D3B1C2;
    background-color: #c30a00;
  }

  .container {
    display: block;
    position: relative;
    padding-left: 35px;
    margin-bottom: 12px;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 25px;
    width: 25px;
    border-radius: 5px;
    border: 2px solid #D3B1C2;
    background-color: #211522; 
  }

  .container:hover input ~ .checkmark {
    background-color: #613659;
  }

  .container input:checked ~ .checkmark {
    background-color: #211522;
  }

  .checkmark:after {
    content: "";
    position: absolute;
    display: none;
  }

  .container input:checked ~ .checkmark:after {
    display: block;
  }

  .container .checkmark:after {
    left: 9px;
    top: 5px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 3px 3px 0;
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
  }
</style>
<div id="component-container">
  <button>Delete account</button>

  <form>
    <label class="container">Confirm, you will not be able to retrieve your account again!
      <input type="checkbox" id="delete-box" name="confirmDelete" required>
      <span class="checkmark"></span>
    </label>
    <button type="submit">Delete</button>
  </form>
</div>
`

customElements.define('delete-account',
  /**
   * Represents a profile-selector element.
   */
  class extends HTMLElement {
    /**
     * Creates an instance of the current type.
     */
    constructor () {
      super()

      this.attachShadow({ mode: 'open' })
        .appendChild(template.content.cloneNode(true))
    }
  }
)
