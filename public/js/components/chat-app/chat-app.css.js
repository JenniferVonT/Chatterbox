const chatAppStyles = `
#wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 30px;
    font-weight: bold;
    font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
    width: 65vw;
    height: 100%;
}

form#chat {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

#submit-btns {
    display: inline-block;
    width: 100%;
    justify-content: left;
}

#chatWindow {
    width: 60vw;
    height: 50vh;
    margin-bottom: 15px;
    background-color: transparent;
    overflow-y: auto;
}

p {
    margin: 10px;
    margin-top: 20px;
    word-wrap: break-word;
    white-space: pre-line;
}

#message {
    font-size: 18px;
    width: 60vw;
    height: 80px;
    resize: none;
    color: #D3B1C2;
    background-color: #474747;
}

button {
    margin: 5px;
    width: max-content;
    height: 30px;
    color: #D3B1C2;
    border-radius: 5px;
    border: 1px solid #D3B1C2;
    background-color: #211522;
}

button:hover {
    color: #211522;
    border: 1px solid #211522;
    background-color: #D3B1C2;
}

#emojiDropdown {
    display: flex;
    flex-wrap: wrap;
    max-width: 300px;
    height: 150px;
    background-color: white;
    overflow-y: auto;
    overflow-x: hidden;
    border: 1px solid black;
}

#emojiDropdown.hidden {
    display: none;
}

/*<-------------------------- SCROLL-BAR CUSTOMIZATION -------------------------->*/
/* Width */
::-webkit-scrollbar {
    width: 7px; /* width of the entire scrollbar */
}

/* Track */
::-webkit-scrollbar-track {
    background: #474747; /* color of the track */
    border-radius: 10px;
}

/* Handle */
::-webkit-scrollbar-thumb {
    background: #211522; /* color of the scroll thumb */
    border-radius: 10px; /* roundness of the scroll thumb */
}

/* Firefox-specific styles */
@-moz-document url-prefix() {
    /* Track and handle styles for Firefox */
    * {
        scrollbar-color: #211522 #474747; /* thumb and track color */
        scrollbar-width: thin; /* width of the scrollbar */
    }

    *::-moz-scrollbar-thumb {
        background: #211522; /* color of the scroll thumb */
        border-radius: 10px; /* roundness of the scroll thumb */
    }

    *::-moz-scrollbar-track {
        background: #474747; /* color of the track */
        border-radius: 10px; /* roundness of the scrollbar track */
    }
}

/*<-------------------------- MEDIA QUERIES -------------------------->*/

@media (max-width: 600px) {
    #wrapper {
        width: 100%;
    }

    #chatWindow {
        width: 90vw;
        height: 40vh;
    }

    #message {
        width: 90vw;
    }
}

`

export default chatAppStyles
