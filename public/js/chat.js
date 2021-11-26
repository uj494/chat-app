const socket = io()


// Elements
const messageForm = document.querySelector('#message-form')
const messageFormInput = messageForm.querySelector('input')
const messageFormButton = messageForm.querySelector('button')
const locButton = document.querySelector('#send-location')
const messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
const userMessageTemplate = document.querySelector('#user-message-template').innerHTML
const userLocationTemplate = document.querySelector('#user-location-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    // New message element
    const newMessage = messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = messages.offsetHeight

    // Height of messages container
    const containerHeight = messages.scrollHeight

    //How far have I scrolled?
    const scrollOffset = messages.scrollTop + visibleHeight + 10

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log("New message: ", text)

    if (message.username == username.toLowerCase()) {
        const html = Mustache.render(userMessageTemplate, {
            username: message.username,
            message: message.text,
            createdAt: moment(message.createdAt).format('h:mm a') 
        })
        messages.insertAdjacentHTML('beforeend', html)
    } else {
        const html = Mustache.render(messageTemplate, {
            username: message.username,
            message: message.text,
            createdAt: moment(message.createdAt).format('h:mm a') 
        })
        messages.insertAdjacentHTML('beforeend', html)
    }
    autoScroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.on('locationMessage', (url) => {

    if (url.username == username.toLowerCase()) {
        const html = Mustache.render(userLocationTemplate, {
            username: url.username,
            url : url.url,
            createdAt: moment(url.createdAt).format('h:mm a')
        })
        messages.insertAdjacentHTML('beforeend', html)
    } else {
        const html = Mustache.render(locationTemplate, {
            username: url.username,
            url : url.url,
            createdAt: moment(url.createdAt).format('h:mm a')
        })
        messages.insertAdjacentHTML('beforeend', html)
    }

    autoScroll()
})


messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    // messageFormButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.text.value
    
    socket.emit('sendMessage', message, (message) => {

        //messageFormButton.removeAttribute('disabled')
        messageFormInput.value = ''
        messageFormInput.focus()
    })
})

document.querySelector('#send-location').addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser!') 
    }
    locButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position)
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        socket.emit('sendLocation', {
            lat,
            lng
        }, (message) => {
            locButton.removeAttribute('disabled')
            console.log(message)
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})