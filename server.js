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
  socket.on('KeyDDown', e => {
    console.error('server is recieving: KeyDDown', e)
    socket.emit('keydown', { code: 'KeyD' })
  })
  socket.on('KeyADown', e => {
    console.error('server is recieving: KeyADown', e)
    socket.emit('keydown', { code: 'KeyA' })
  })
  socket.on('KeyWDown', e => {
    console.error('server is recieving: KeyWDown', e)
    socket.emit('keydown', { code: 'KeyW' })
  })
  socket.on('KeySDown', e => {
    console.error('server is recieving: KeySDown', e)
    socket.emit('keydown', { code: 'KeyS' })
  })
  socket.on('KeyGDown', e => {
    console.error('server is recieving: KeyGDown', e)
    socket.emit('keydown', { code: 'KeyG' })
  })
  //  asd
  // asd
  socket.on('KeyDUp', e => {
    console.error('server is recieving: KeyDUp', e)
    socket.emit('keyup', { code: 'KeyD' })
  })
  socket.on('KeyAUp', e => {
    console.error('server is recieving: KeyAUp', e)
    socket.emit('keyup', { code: 'KeyA' })
  })
  socket.on('KeyWUp', e => {
    console.error('server is recieving: KeyWUp', e)
    socket.emit('keyup', { code: 'KeyW' })
  })
  socket.on('KeySUp', e => {
    console.error('server is recieving: KeySUp', e)
    socket.emit('keyup', { code: 'KeyS' })
  })
  socket.on('KeyGUp', e => {
    console.error('server is recieving: KeyGUp', e)
    socket.emit('keyup', { code: 'KeyG' })
  })
})

http.listen(port, () => {
  console.warn('listening on port:', port)
})
