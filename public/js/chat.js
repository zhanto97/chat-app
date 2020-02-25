const socket = io()

const $messageForm = document.getElementById('message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $shareLocation = document.getElementById('share-location')
const $messages = document.getElementById('messages')

const messageTemplate = document.getElementById('message-template').innerHTML
const locationTemplate = document.getElementById('location-template').innerHTML

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', (location) => {
    console.log(location)
    const html = Mustache.render(locationTemplate, {
        url: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.msgInput.value
    socket.emit('sendMsg', message, () => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        console.log('Message was delivered')
    })
})

$shareLocation.addEventListener('click', () => {
    if (!navigator.geolocation){
        return alert('Geolocation not supported by your browser')
    }

    $shareLocation.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((pos) => {
        socket.emit('shareLocation', {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
        }, () => {
            $shareLocation.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})

socket.emit('join', {
    username,
    room
})