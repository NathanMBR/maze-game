import { Server } from "socket.io"
import { randomUUID } from "node:crypto"
import { createServer } from "node:http"

import {
  type Player,
  type ClientToServerEvents,
  type ServerToClientEvents,
  type Coordinates,
  type Bullet,
  type Bomb,
  createMatrix,
  getMazePath,
  getPixelRepresentation,
  calculateDistanceBetweenTwoCoordinates
} from "./domain"
import {
  getRandomInteger,
  isMazeTileAvailable,
  isCoordinateOutOfMap,
  waitTimeInMilliseconds
} from './utils';
import { PORT } from "./settings"

const mazeWidth = 20
const mazeHeight = 20
const shootDelayInMilliseconds = 500
const explosionRadiusInTiles = 5
const initialBombsCount = 1
const bombSpawnDelayInMilliseconds = 10 * 1000

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
const bombs = new Map<string, Bomb>()

const getEmptyMazeTiles = () => maze.map((row, y) => {
  return row.map((tile, x) => {
    const isPathTile = tile === 0
    const hasPlayerInCurrentCoordinates = Array.from(players.values()).some(({ position }) => position.x === x && position.y === y)
    const hasBombInCurrentCoordinates = Array.from(bombs.values()).some(({ position }) => position.x === x && position.y === y)

    const isTileEmpty =
      isPathTile &&
      !hasPlayerInCurrentCoordinates &&
      !hasBombInCurrentCoordinates

    if (!isTileEmpty)
      return null

    return { x, y }
  }).filter(tile => !!tile) as Array<{ x: number, y: number }>
}).reduce((list, row) => {
  list.push(...row)
  return list
}, [])

const sendState = () => {
  io.emit("maze", {
    mazePath,
    maze,
    dimensions: {
      width: mazeWidth,
      height: mazeHeight
    },
    players: Array.from(players.values()),
    bullets: Array.from(bullets.values()),
    bombs: Array.from(bombs.values())
  })
}

const killPlayer = (id: string) => {
  players.delete(id)
  io.to(id).emit("death")
}

const spawnBomb = () => {
  setTimeout(spawnBomb, bombSpawnDelayInMilliseconds)

  const minimumPlayersQuantityToSpawnBomb = 2
  const maximumSpawnedBombs = 5

  if (players.size < minimumPlayersQuantityToSpawnBomb)
    return

  if (bombs.size >= maximumSpawnedBombs)
    return

  const emptyMazeTiles = getEmptyMazeTiles()

  const randomSpawnPositionIndex = getRandomInteger(0, emptyMazeTiles.length - 1)
  const randomSpawnPosition = emptyMazeTiles[randomSpawnPositionIndex]

  const bombId = randomUUID()
  bombs.set(bombId, {
    id: bombId,
    position: randomSpawnPosition
  })

  sendState()
}

setTimeout(spawnBomb, bombSpawnDelayInMilliseconds)

io.on("connection", socket => {
  const playerId = socket.id

  const emptyMazeTiles = getEmptyMazeTiles()

  const randomStartPositionIndex = getRandomInteger(0, emptyMazeTiles.length - 1)
  const randomStartPosition = emptyMazeTiles[randomStartPositionIndex]

  const isPlayerAlreadyConnected = players.has(playerId)
  if (!isPlayerAlreadyConnected)
    players.set(playerId, {
      id: playerId,
      position: randomStartPosition,
      lastShotAt: 0,
      bombs: initialBombsCount
    })

  sendState()

  socket.on("walk", direction => {
    const player = players.get(playerId)
    if (!player)
      return

    const newPlayerPosition: Coordinates = {
      x: direction === "RIGHT" ? player.position.x + 1 : direction === "LEFT" ? player.position.x - 1 : player.position.x,
      y: direction === "DOWN" ? player.position.y + 1 : direction === "UP" ? player.position.y - 1 : player.position.y
    }

    const isDirectionAvailable = isMazeTileAvailable(maze, newPlayerPosition.x, newPlayerPosition.y)
    if (!isDirectionAvailable)
      return

    const bombBelowPlayer = Array.from(bombs.values()).find(bomb => bomb.position.x === newPlayerPosition.x && bomb.position.y === newPlayerPosition.y)

    players.set(playerId, {
      ...player,
      position: newPlayerPosition,
      bombs: bombBelowPlayer ? player.bombs + 1 : player.bombs
    })

    if (bombBelowPlayer)
      bombs.delete(bombBelowPlayer.id)

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
        killPlayer(shotPlayerId)
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

  socket.on("explode", () => {
    const currentPlayer = players.get(playerId)
    if (!currentPlayer)
      return

    if (currentPlayer.bombs <= 0)
      return

    const explosionCenter = currentPlayer.position
    for (let y = explosionCenter.y - explosionRadiusInTiles; y <= explosionCenter.y + explosionRadiusInTiles; y++) {
      for (let x = explosionCenter.x - explosionRadiusInTiles; x <= explosionCenter.x + explosionRadiusInTiles; x++) {
        const isCurrentCoordinateOutOfMap = isCoordinateOutOfMap(maze, x, y)
        const tileDistanceToExplosionCenter = calculateDistanceBetweenTwoCoordinates(explosionCenter, { x, y })
        const isTileInsideExplosionRadius = tileDistanceToExplosionCenter <= explosionRadiusInTiles

        if (!isCurrentCoordinateOutOfMap && isTileInsideExplosionRadius) {
          maze[y][x] = 0
        }
      }
    }

    players.forEach(player => {
      if (player.id === currentPlayer.id)
        return

      const distanceFromPlayerToExplosionCenterInTiles = calculateDistanceBetweenTwoCoordinates(player.position, explosionCenter)
      if (distanceFromPlayerToExplosionCenterInTiles <= explosionRadiusInTiles)
        killPlayer(player.id)
    })

    players.set(playerId, {
      ...currentPlayer,
      bombs: currentPlayer.bombs - 1
    })

    sendState()
  })

  socket.on("disconnect", () => {
    players.delete(playerId)

    sendState()
  })
})

httpServer.listen(PORT)
console.log(`Server started at port ${PORT}`)
