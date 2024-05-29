const chatAppStyles = `
#wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
    width: 65vw;
    height: 100%;
    padding-top: 10px;
}

form#chat {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
}

#submit-btns {
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: flex-start;
    align-items: center;
}

#chatWindow {
    height: 55vh;
    width: 60vw;
    margin-bottom: 10px;
    background-color: transparent;
    overflow-y: auto;
    overflow-x: hidden;
}

#message {
    font-size: 18px;
    width: 60vw;
    height: 80px;
    resize: none;
    color: #D3B1C2;
    background-color: #474747;
    padding-left: 5px;
    border: 2px solid #242424;
    border-radius: 10px;
}

.chat-messages {
    word-wrap: break-word;
    white-space: pre-line;
    border-top: 2px solid #242424;
    margin-right: 5px;
    margin-bottom: 30px;
}

.chat-messages:first-of-type {
    border-top: none;
}

.chat-messages > p {
    font-size: 1rem;
    margin: 3px;
    margin-left: 15px;
}

.chat-messages > h4 {
    font-weight: bold;
    color: #C197D2;
    font-size: 1.25rem;
    margin: 3px;
}

.chat-messages img {
    height: 40px;
    width: 40px;
    overflow: hidden;
    border: 2px solid #D3B1C2;
    border-radius: 10px;
    object-fit: contain;
    margin-left: 4px;
    margin-right: 4px;
    margin-top: 4px;
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
    position: absolute;
    z-index: 1;
    bottom: 130px;
    background-color: #474747;
    border-radius: 5px;
    border: 1px solid #D3B1C2;
    max-width: 308px;
    height: 150px;
    overflow-y: auto;
    overflow-x: hidden;
}

#emojiDropdown button {
    margin: 0px;
    width: 60px;
    height: 30px;
}

#emojiDropdown.hidden {
    display: none;
}

#videoCall,
#phoneCall {
    display: flex;
    width: min-content;
    align-items: center;
    justify-content: center;
}

#videoCall > img,
#phoneCall > img {
    display: flex;
    object-fit: contain;
    height: 85%;
    align-items: center;
    justify-content: center;
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
        margin-top: 0;
    }

    #chatWindow {
        width: 90vw;
        height: 50vh;
    }

    #message {
        width: 90vw;
        height: 50px;
    }
}
`

export default chatAppStyles
