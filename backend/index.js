require('dotenv').config()

const express = require('express')
const axios = require('axios')
const socketIo = require('socket.io')
const cors = require('cors')
const bodyParser = require('body-parser')
const http = require('http')
const app = express()

app.use(cors({ origin: '*' }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin:"*"
  }
})

const getData = async(socket, query) => {
  try {
      let response = await axios({
        method: 'GET',
        url: `https://api.twitter.com/2/tweets/search/recent?query=${query}`,
        headers: {
          'Authorization': `Bearer ${process.env.TWT_BT}`
        }
      })
      response.data.query = query
      socket.emit("tweet", response.data)
      //
      // for(let i = 0; i < response.data.data.length; i++) {
      //   socket.emit("tweet", response.data.data[i])
      // }
  } catch (e) {
    socket.emit("error", {
      title: e.message,
      detail: e.stack
    })
  }
}

io.on("connection", async (socket) => {

  socket.on("data", (query) => {
    getData(socket, query);
  });
})

server.listen(3001)
