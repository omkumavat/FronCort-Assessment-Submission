// server.js
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

const app = express()
app.use(cors())
const server = createServer(app)
const io = new Server(server, { cors: { origin: '*' } })

io.on('connection', (socket) => {
  console.log('a user connected')

  socket.on('edit', (data) => {
    socket.broadcast.emit('edit', data) // send changes to others
  })
})

server.listen(4000, () => console.log('Server running on 4000'))
