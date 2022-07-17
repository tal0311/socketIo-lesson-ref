const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
// sockets
const { socketService } = require('./services/socket.service')
socketService(server)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

server.listen(3000, () => {
  console.log('listening on http://localhost:3000/')
})
