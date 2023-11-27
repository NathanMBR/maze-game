import { Server } from "socket.io"

import {
  Player,
  createMatrix,
  getMazePath,
  getPixelRepresentation,
  ClientToServerEvents,
  ServerToClientEvents,
  Coordinates
} from "./domain"
import {
  getRandomInteger,
  isMazeTileAvailable
} from './utils';
import { PORT } from "./settings"

const mazeWidth = 10
const mazeHeight = 10

const mazePath = getMazePath(createMatrix(mazeWidth, mazeHeight))
const maze = getPixelRepresentation(mazePath)

const io = new Server<ClientToServerEvents, ServerToClientEvents>(PORT, {
  cors: {
    origin: "*"
  }
})

const players = new Map<string, Player>()

io.on("connection", socket => {
  const playerId = socket.id

  const emptyMazeTiles = maze.map((row, y) => {
    return row.map((tile, x) => {
      const isPathTile = tile === 0
      const hasPlayerInCurrentCoordinates = Array.from(players.values()).some(({ position }) => position.x === x && position.y === y)

      const isTileEmpty =
        isPathTile &&
        !hasPlayerInCurrentCoordinates

      if (!isTileEmpty)
        return null

      return { x, y }
    }).filter(tile => !!tile) as Array<{ x: number, y: number }>
  }).reduce((list, row) => {
    list.push(...row)
    return list
  }, [])

  const randomStartPositionIndex = getRandomInteger(0, emptyMazeTiles.length - 1)
  const randomStartPosition = emptyMazeTiles[randomStartPositionIndex]

  const isPlayerAlreadyConnected = players.has(playerId)
  if (!isPlayerAlreadyConnected)
    players.set(playerId, {
      id: playerId,
      position: randomStartPosition
    })

  const sendState = () => {
    io.emit("maze", {
      mazePath,
      maze,
      dimensions: {
        width: mazeWidth,
        height: mazeHeight
      },
      players: Array.from(players.values())
    })
  }

  sendState()

  socket.on("movement", direction => {
    const player = players.get(playerId)
    if (!player)
      return

    const position: Coordinates = {
      x: direction === "RIGHT" ? player.position.x + 1 : direction === "LEFT" ? player.position.x - 1 : player.position.x,
      y: direction === "DOWN" ? player.position.y + 1 : direction === "UP" ? player.position.y - 1 : player.position.y
    }

    const isDirectionAvailable = isMazeTileAvailable(maze, position.x, position.y)
    if (!isDirectionAvailable)
      return

    players.set(playerId, {
      ...player,
      position
    })

    sendState()
  })

  socket.on("disconnect", () => {
    players.delete(socket.id)

    sendState()
  })
})

console.log(`Server started at port ${PORT}`)
