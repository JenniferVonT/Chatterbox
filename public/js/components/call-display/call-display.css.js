const styles = `
:host {
  position: fixed;
  top: 40%;
  left: 50%;
  width: min-content;
  height: max-content;
  transform: translate(-50%, -50%);
  background-color: #613659;
  border: 2px solid #242424;
  border-radius: 10px;
  padding: 20px;
  z-index: 1000;
  box-shadow: 0 4px 8px #242424;
}

#call-display-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

button {
  margin: 5px;
  width: max-content;
  font-weight: bold;
  height: 30px;
  color: #242424;
  border-radius: 5px;
  border: 1px solid #242424;
  background-color: #b80006;
  cursor: pointer;
}

button:hover {
  color: #211522;
  border: 1px solid #211522;
  background-color: #ff161e;
}

#videoCall:hover,
#phoneCall:hover {
  color: #211522;
  border: 1px solid #211522;
  background-color: #92ff93;
}

#videoCall,
#phoneCall {
    display: flex;
    width: min-content;
    align-items: center;
    justify-content: center;
    background-color: #59c658;
    border-color: #211522;
}

#videoCall > img,
#phoneCall > img {
    display: flex;
    object-fit: contain;
    height: 85%;
    align-items: center;
    justify-content: center;
}

#submit-btns {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}
`

export default styles
