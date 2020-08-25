/* eslint-disable no-path-concat */
const express = require('express')
const port = process.env.PORT || 8080
const app = express()
const http = require('http').Server(app)
const socketio = require('socket.io')(http)
// let lastPos;
app.use(express.static(__dirname + '/dist/'))

// what does this do? - no matter what route after url (localhost:8080) is added i.e. ( /game),  it'll always load file from /dist
app.get(/.*/, function (req, res) {
  res.sendFile(__dirname + '/dist/index.html')
})

socketio.on('connection', socket => {
  socket.emit('connected', () => {
  })
})
socketio.on('connect', socket => {
  socket.on('keyup', e => {
    console.error('server is recieving: keyup', e)
    socket.emit('keyupServe', e)
  })

  socket.on('keydown', e => {
    console.error('server is recieving: keydown', e)
    socket.emit('keydownServe', { ...e })
  })
})

http.listen(port, () => {
  console.warn('listening on port:', port)
})
