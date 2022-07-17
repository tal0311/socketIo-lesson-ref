var gIo
function socketService(server) {
  // connecting to socket server
  const { Server } = require('socket.io')
  gIo = new Server(server)
  const msgs = []

  gIo.on('connection', (socket) => {
    console.log('a user connected', socket.id)
    socket.emit('add-msgs', msgs)
    socket.on('setUser', (nickname) => {
      socket.nickname = nickname
      socket.broadcast.emit('new-connection', `${socket.nickname} connected`)
    })
    socket.on('typing', () => {
      socket.broadcast.emit('typing', 'User typing...')
    })

    // !chat-message
    socket.on('chat-message', async (msg) => {
      msgs.push(msg)
      // !send private msg
      if (msg.to) {
        const socket = await _getSocket(msg.to)
        socket.emit('chat-message', msg)
        return
      }
      // !send to chat room
      if (socket.myTopic) {
        gIo.to(socket.myTopic).emit('chat-message', msg)
      } else {
        console.log('other:', msg)
        // !send msg back to client
        // socket.emit('chat-message', msg)
        // !send to all clients
        gIo.emit('chat-message', msg)
        // !broadCast msg
        // socket.broadcast.emit('chat-message', msg)
      }
    })

    // setting private chat room socket
    socket.on('set-topic', (topic) => {
      if (socket.myTopic) {
        socket.leave(socket.myTopic)
      }
      socket.myTopic = topic
      socket.join(topic)
    })
    socket.on('disconnect', () => {
      console.log(socket.nickname, 'disconnected')
    })
  })
}

// helper functions
async function _getSocket(nickname) {
  const sockets = await _getAllSockets()
  return await sockets.find((socket) => socket.nickname === nickname)
}

async function _getAllSockets() {
  return await gIo.fetchSockets()
}

module.exports = {
  socketService,
}
