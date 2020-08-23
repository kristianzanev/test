/* eslint-disable no-path-concat */
const express = require('express')
const port = process.env.PORT || 8080
const app = express()

app.use(express.static(__dirname + '/dist/'))

// what does this do? - no matter what route after url (localhost:8080) is added i.e. ( /game),  it'll always load file from /dist
app.get(/.*/, function (req, res) {
  res.sendFile(__dirname + '/dist/index.html')
})

app.listen(port)

console.error('jesus ALEYAH')
