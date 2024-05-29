const styles = `
:host {
  width: 100%;
}

#wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin: 5px;
}

#incomingVideo, #placeholder {
  width: 100%;
  height: 70vh;
  background-color: #242424;
  border-radius: 10px;
  border: 2px solid #242424;
}

#placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #242424;
  background-color: #2E2E2E;
  font-size: 1.5em;
  border-radius: 10px;
  border: 2px solid #242424;
}

#outgoingVideo {
  position: absolute;
  right: 0px;
  top: 0;
  width: 20%;
  height: auto;
  border-radius: 10px;
  border: 2px solid #242424;
}

button {
  display: flex;
  margin: 5px;
  width: max-content;
  height: 30px;
  color: #D3B1C2;
  border-radius: 5px;
  border: 1px solid #D3B1C2;
  background-color: #211522;
  align-items: center;
  justify-content: center;
}

button > img {
  display: flex;
  object-fit: contain;
  height: 85%;
  align-items: center;
  justify-content: center;
}

button:hover {
  color: #211522;
  border: 1px solid #211522;
  background-color: #D3B1C2;
}

#activateCameraBtn,
#deactivateCameraBtn {
  position: absolute;
  bottom: 0;
  right: 0;
}

#endCallBtn {
  position: absolute;
  bottom: 0;
}

.hidden {
  display: none !important;
}

/*<-------------------------- MEDIA QUERIES -------------------------->*/

@media (max-width: 600px) {
  #incomingVideo, #placeholder {
    height: 50vh;
  }

  #outgoingVideo {
    width: 15%;
  }
}
`

export default styles
