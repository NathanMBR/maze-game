import { Server } from "socket.io"
import { randomUUID } from "node:crypto"
import { createServer } from "node:http"

import {
  type Player,
  type ClientToServerEvents,
  type ServerToClientEvents,
  type Coordinates,
  type Bullet,
  createMatrix,
  getMazePath,
  getPixelRepresentation
} from "./domain"
import {
  getRandomInteger,
  isMazeTileAvailable,
  isCoordinateOutOfMap,
  waitTimeInMilliseconds
} from './utils';
import { PORT } from "./settings"

const mazeWidth = 10
const mazeHeight = 10
const shootDelayInMilliseconds = 500

const mazePath = getMazePath(createMatrix(mazeWidth, mazeHeight))
const maze = getPixelRepresentation(mazePath)

const httpServer = createServer()
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: "*"
  }
})

const players = new Map<string, Player>()
const bullets = new Map<string, Bullet>()

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
      position: randomStartPosition,
      lastShotAt: 0
    })

  const sendState = () => {
    io.emit("maze", {
      mazePath,
      maze,
      dimensions: {
        width: mazeWidth,
        height: mazeHeight
      },
      players: Array.from(players.values()),
      bullets: Array.from(bullets.values())
    })
  }

  sendState()

  socket.on("walk", direction => {
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

  socket.on("shoot", async direction => {
    const player = players.get(playerId)
    if (!player)
      return

    if (player.lastShotAt + shootDelayInMilliseconds > Date.now())
      return

    players.set(playerId, {
      ...player,
      lastShotAt: Date.now()
    })

    const bulletId = randomUUID()
    const bullet: Bullet = {
      id: bulletId,
      position: {
        x: player.position.x,
        y: player.position.y
      }
    }

    bullets.set(bulletId, bullet)

    let isBulletOffTheMap = false
    let hasBulletCollided = false

    do {
      if (direction === "RIGHT")
        bullet.position.x += 1

      if (direction === "LEFT")
        bullet.position.x -= 1

      if (direction === "DOWN")
        bullet.position.y += 1

      if (direction === "UP")
        bullet.position.y -= 1

      isBulletOffTheMap = isCoordinateOutOfMap(maze, bullet.position.x, bullet.position.y)
      if (isBulletOffTheMap) {
        bullets.delete(bulletId)
        sendState()
        return
      }

      const playersList = Array.from(players.entries()).map(([_id, player]) => player)
      const playerInBulletPosition = playersList.find(player => player.position.x === bullet.position.x && player.position.y === bullet.position.y)
      if (playerInBulletPosition) {
        const shotPlayerId = playerInBulletPosition.id

        hasBulletCollided = true
        players.delete(shotPlayerId)
        socket.to(shotPlayerId).emit("death")
      }

      const tileInBulletPosition = maze[bullet.position.y][bullet.position.x]
      if (tileInBulletPosition === 1) {
        hasBulletCollided = true

        const randomInteger = getRandomInteger(1, 5)
        if (randomInteger === 1)
          maze[bullet.position.y][bullet.position.x] = 0
      }

      sendState()
      await waitTimeInMilliseconds(30)
    } while (
      !isBulletOffTheMap &&
      !hasBulletCollided
    )

    bullets.delete(bulletId)
    sendState()
  })

  socket.on("disconnect", () => {
    players.delete(playerId)

    sendState()
  })
})

httpServer.listen(PORT)
console.log(`Server started at port ${PORT}`)
