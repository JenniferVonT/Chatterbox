/**
 * A component to view the users profile image and select a new one.
 *
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

const template = document.createElement('template')
template.innerHTML = `
<style>
  .hidden {
    display: none;
  }

  #selected {
    border: 2px solid #D3B1C2;
  }

  button {
    margin: 5px;
    width: 80px;
    height: 30px;
    color: #D3B1C2;
    border-radius: 3px;
    border: 1px solid #D3B1C2;
    background-color: #211522;
  }

  .alternatives,
  #currentImgContainer {
    border: 2px solid #242424;
    border-radius: 6px;
    margin: 10px;
    width: 80px;
    height: 80px;
    overflow: hidden;
    object-fit: cover;
  }

  #currentImgContainer {
    width: 100px;
    height: 100px;
  }

  .alternatives:hover {
    border: 2px solid #D3B1C2;
  }

  #imgContainer {
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-around;
  }
</style>

<div id="startContainer">
  <div id="currentImgContainer"></div>

  <button id="startBtn">Change image</button>
</div>

<div id="imgContainer" class="hidden">
  <slot name="profile1" class="alternatives"><slot>
  <slot name="profile2" class="alternatives"><slot>
  <slot name="profile3" class="alternatives"><slot>
  <slot name="profile4" class="alternatives"><slot>
  <slot name="profile5" class="alternatives"><slot>

  <button id="submitBtn">Submit new image</button>
</div>
`

customElements.define('profile-selector',
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

      this.imageCont = this.shadowRoot.querySelector('#imgContainer')
      this.startCont = this.shadowRoot.querySelector('#startContainer')
      this.currentImgCont = this.shadowRoot.querySelector('#currentImgContainer')
      this.images = this.shadowRoot.querySelectorAll('.alternatives')
      this.submitBtn = this.shadowRoot.querySelector('#submitBtn')
      this.startBtn = this.shadowRoot.querySelector('#startBtn')

      this.#insertCurrentImg()
    }

    /**
     * Called when the element is inserted into the DOM.
     */
    connectedCallback () {
      this.startBtn.addEventListener('click', this.#handleStartBtn())
      this.submitBtn.addEventListener('click', this.#handleSubmitBtn())
    }

    /**
     * Called when the element is removed from the DOM.
     */
    disconnectedCallback () {
      this.startBtn.removeEventListener('click', this.#handleStartBtn())
      this.submitBtn.removeEventListener('click', this.#handleSubmitBtn())
    }

    /**
     * Handles the setting up of the start button.
     */
    #handleStartBtn () {
      // INSERT CODE.
    }

    /**
     * Handles the submit button, triggers the custom-event.
     */
    #handleSubmitBtn () {
      // INSERT CODE.
    }

    /**
     * Inserts the currently configured profile image in the [current] slot.
     */
    #insertCurrentImg () {
      // Find the element with the current attribute.
      const currentImg = [...this.images].find(image => image.hasAttribute('current'))

      // If it finds an element with the current attribute set it as the current profile
      if (currentImg) {
        this.currentImgCont.append(currentImg)
      } else {
        const img = document.createElement('img')
        img.setAttribute('src', './img/placeholder-profile-img.png')
        img.setAttribute('alt', 'img')

        this.currentImgCont.append(img)
      }
    }
  }
)
