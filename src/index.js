const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const {generateMessage,
       generateLocationMessage} = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 1111
const publicDir = path.join(__dirname, '../public')

app.use(express.static(publicDir))

io.on('connection', (socket) => {
    console.log('New WebSocket connection')
    // socket.emit('message', generateMessage('Welcome!'))
    // socket.broadcast.emit('message', generateMessage('A new user has joined!'))

    socket.on('join', ({username, room}) => {
        socket.join(room)

        socket.emit('message', generateMessage('Welcome!'))
        socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined!`))
    })

    socket.on('sendMsg', (message, callback) => {
        io.emit('message', generateMessage(message))
        callback()
    })

    socket.on('shareLocation', (pos, callback) => {
        io.emit('locationMessage',
            generateLocationMessage(`https://google.com/maps?q=${pos.latitude},${pos.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('User has left'))
    })
})

server.listen(port, () => {
    console.log('App started on port ' + port)
})