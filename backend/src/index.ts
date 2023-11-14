import { Server } from "socket.io"
import { PORT } from "./settings"

const io = new Server()

io.on("connection", socket => {
  console.log(`Socket with ID ${socket.id} connected`)
})

io.listen(PORT)
console.log(`Websocket connection established at port ${PORT}`)
