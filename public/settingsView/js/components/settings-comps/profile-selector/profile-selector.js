/**
 * A component to view the users profile image and select a new one.
 *
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

const template = document.createElement('template')
template.innerHTML = `
<style nonce="brdS0E4VftZB/fVvwQYczJwsdsspXTLV0EV5DRnxwtE=">
  :host {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  #startContainer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  #selected {
    border: 2px solid #12ed7c;
  }

  button {
    margin: 5px;
    width: 80px;
    height: min-content;
    color: #D3B1C2;
    border-radius: 5px;
    border: 1px solid #D3B1C2;
    background-color: #211522;
  }

  button:hover {
    border-color: #211522;
    color: #211522;
    background-color: #D3B1C2;
  }

  ::slotted(img),
  img[slot] {
    width: 100%;
    height: 100%;
    object-fit: contain;
    overflow: hidden;
  }

  .alternatives,
  #currentImgContainer {
    background-color: #242424;
    border: 2px solid #242424;
    border-radius: 10px;
    margin: 10px;
    width: 70px;
    height: 70px;
    overflow: hidden;
  }

  #currentImgContainer {
    width: 100px;
    height: 100px;
    margin: 5px;
  }

  .alternatives:hover {
    border: 2px solid #D3B1C2;
  }

  #imgContainer {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
  }

  .hidden {
    display: none !important;
  }
</style>

<div id="startContainer">
  <div id="currentImgContainer"></div>

  <button id="startBtn">Change image</button>
</div>

<div id="imgContainer" class="hidden">
  <div class="alternatives">
    <slot name="profile1"><slot>
  </div>
  <div class="alternatives">
    <slot name="profile2"><slot>
  </div>
  <div class="alternatives">
    <slot name="profile3"><slot>
  </div>
  <div class="alternatives">
    <slot name="profile4"><slot>
  </div>
  <div class="alternatives">
    <slot name="profile5"><slot>
  </div>
</div>
<div id="imgBtns" class="hidden">
  <button id="submitBtn">Change</button>
  <button id="backBtn">Back</button>
<div>
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

      // Images and containers.
      this.imageCont = this.shadowRoot.querySelector('#imgContainer')
      this.startCont = this.shadowRoot.querySelector('#startContainer')
      this.currentImgCont = this.shadowRoot.querySelector('#currentImgContainer')
      this.images = this.querySelectorAll('img')
      this.imgContainers = this.shadowRoot.querySelectorAll('.alternatives')

      // Buttons.
      this.submitBtn = this.shadowRoot.querySelector('#submitBtn')
      this.startBtn = this.shadowRoot.querySelector('#startBtn')
      this.backBtn = this.shadowRoot.querySelector('#backBtn')
      this.imgBtns = this.shadowRoot.querySelector('#imgBtns')

      // Methods and eventlisteners.
      this.startBtn.addEventListener('click', () => this.#handleStartBtn())
      this.submitBtn.addEventListener('click', () => this.#handleSubmitBtn())
      this.backBtn.addEventListener('click', () => this.#handleBackBtn())
      this.#insertCurrentImg()
      this.#handleAmountOfImg()
      this.#handleImgEvents()
    }

    /**
     * Handles the setting up of the start button.
     */
    #handleStartBtn () {
      this.startCont.classList.add('hidden')
      this.imageCont.classList.remove('hidden')
      this.imgBtns.classList.remove('hidden')
    }

    /**
     * Handles the submit button, triggers the custom-event.
     */
    #handleSubmitBtn () {
      // Find the image container with the selected attribute.
      const selectedImgCont = this.shadowRoot.querySelector('.alternatives[id="selected"]').firstElementChild

      if (selectedImgCont) {
        // Get the name attribute and the img element.
        const attribute = selectedImgCont.getAttribute('name')

        let selectedImg = ''

        this.images.forEach(img => {
          if (img.getAttribute('slot') === attribute) {
            selectedImg = img
          }
        })

        // If a selected image exists get the file name and trigger the custom event.
        if (selectedImg) {
          const src = selectedImg.getAttribute('src')
          let fileName = ''

          // Extract file name.
          const lastIndex = src.lastIndexOf('/')
          if (lastIndex !== -1) {
            fileName = src.substring(lastIndex + 1)
          } else {
            fileName = src
          }

          // Insert the newly selected image into the preview.
          this.#insertCurrentImg()

          // Trigger the custom event to communicate a change has been made.
          this.dispatchEvent(new CustomEvent('profileImageChanged', {
            bubbles: true,
            composed: true,
            detail: { fileName }
          }))
        }
      }

      // Remove selected.
      this.imgContainers.forEach(cont => {
        cont.removeAttribute('id')
      })

      this.startCont.classList.remove('hidden')
      this.imageCont.classList.add('hidden')
      this.imgBtns.classList.add('hidden')
    }

    /**
     * Handles the button to get back to the original form.
     */
    #handleBackBtn () {
      this.startCont.classList.remove('hidden')
      this.imageCont.classList.add('hidden')
      this.imgBtns.classList.add('hidden')

      // Remove selected.
      this.imgContainers.forEach(cont => {
        cont.removeAttribute('id')
      })
    }

    /**
     * Removes slots if there isn't 5 images.
     */
    #handleAmountOfImg () {
      const length = this.images.length
      // If there is less than 5 images slotted remove the slots.
      if (length < 5) {
        for (let i = 5; i > length; i--) {
          const slotToRemove = this.shadowRoot.querySelector('.alternatives:nth-last-child(1)')
          if (slotToRemove) {
            slotToRemove.remove()
          }
        }
      }
    }

    /**
     * Sets all the eventlisteners for the images.
     */
    #handleImgEvents () {
      this.imgContainers.forEach(cont => {
        cont.addEventListener('click', () => {
          // Remove the selected id attribute from all the img options.
          this.imgContainers.forEach(cont => {
            cont.removeAttribute('id', 'selected')
          })

          // Add the selected id to the element being clicked.
          cont.setAttribute('id', 'selected')
        })
      })
    }

    /**
     * Inserts the currently configured profile image in the [current] slot.
     */
    #insertCurrentImg () {
      // Remove the the img in the container.
      this.currentImgCont.textContent = ''

      // Find the element with the current attribute and insert it into the current image container.
      for (const img of this.images) {
        if (img.hasAttribute('current')) {
          const currentImg = img.cloneNode(true)
          this.currentImgCont.append(currentImg)
        }
      }
    }
  }
)
