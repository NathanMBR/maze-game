import { Server } from "socket.io"

import {
  createMatrix,
  getMazePath,
  getPixelRepresentation
} from "./domain"
import { PORT } from "./settings"

const mazeWidth = 30
const mazeHeight = 30

const mazePath = getMazePath(createMatrix(mazeWidth, mazeHeight))
const maze = getPixelRepresentation(mazePath)

const io = new Server(PORT, {
  cors: {
    origin: "*"
  }
})

io.on("connection", socket => {
  socket.emit("maze", {
    mazePath,
    maze,
    dimensions: {
      width: mazeWidth,
      height: mazeHeight
    }
  })
})

console.log(`Server started at port ${PORT}`)
