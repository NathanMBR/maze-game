import './style.css'

import { io, type Socket } from "socket.io-client"

import type {
  ServerToClientEvents,
  ClientToServerEvents,
  MazeEventData,
  Direction
} from "./domain"

const canvas = document.querySelector<HTMLCanvasElement>("#game")!
const ctx = canvas.getContext("2d")!
const deathMessageHolder = document.querySelector<HTMLHeadingElement>("#death")!

const gameProportionInPixels = 10
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io("http://localhost:3000")

let mazeData: MazeEventData
let socketId = ""
let isRendering = false

const renderScreen = () => {
  if (!isRendering)
    return

  const {
    dimensions,
    maze,
    players,
    bullets
  } = mazeData

  const colors = {
    mazeWall: "#000",
    enemyPlayer: "#F00",
    currentPlayer: "#0C0",
    bullet: "#FC0"
  }

  canvas.width = (2 * dimensions.width - 1) * gameProportionInPixels
  canvas.height = (2 * dimensions.height - 1) * gameProportionInPixels
  canvas.style.border = `solid ${gameProportionInPixels}px black`

  ctx.fillStyle = colors.mazeWall

  for (let i = 0; i < maze.length; i++) {
    for (let j = 0; j < maze[i].length; j++) {
      if (maze[i][j] === 1)
        ctx.fillRect(
          j * gameProportionInPixels,
          i * gameProportionInPixels,
          gameProportionInPixels,
          gameProportionInPixels
        )
    }
  }

  players.forEach(player => {
    ctx.fillStyle = colors.enemyPlayer

    if (player.id === socketId)
      ctx.fillStyle = colors.currentPlayer

    ctx.fillRect(
      player.position.x * gameProportionInPixels,
      player.position.y * gameProportionInPixels,
      gameProportionInPixels,
      gameProportionInPixels
    )
  })

  bullets.forEach(bullet => {
    ctx.fillStyle = colors.bullet

    ctx.fillRect(
      bullet.position.x * gameProportionInPixels,
      bullet.position.y * gameProportionInPixels,
      gameProportionInPixels,
      gameProportionInPixels
    )
  })

  requestAnimationFrame(renderScreen)
}

const keyboardListener = (event: KeyboardEvent) => {
  type WalkMovement = {
    event: "walk"
    data: Direction
  }

  type ShootMovement = {
    event: "shoot"
    data: Direction
  }

  type Movements =
    WalkMovement |
    ShootMovement

  const movementsMap = new Map<string, Movements>()

  // walk
  movementsMap.set("w", { event: "walk", data: "UP" })
  movementsMap.set("a", { event: "walk", data: "LEFT"})
  movementsMap.set("s", { event: "walk", data: "DOWN" })
  movementsMap.set("d", { event: "walk", data: "RIGHT" })

  // shoot
  movementsMap.set("ArrowUp", { event: "shoot", data: "UP" })
  movementsMap.set("ArrowLeft", { event: "shoot", data: "LEFT" })
  movementsMap.set("ArrowDown", { event: "shoot", data: "DOWN" })
  movementsMap.set("ArrowRight", { event: "shoot", data: "RIGHT" })

  const movement = movementsMap.get(event.key)
  if (!movement)
    return

  socket.emit(movement.event, movement.data)
}

socket.on("connect", () => {
  socketId = socket.id

  window.addEventListener("keydown", keyboardListener)
})

socket.on("maze", data => {
  mazeData = data

  if (!isRendering) {
    requestAnimationFrame(renderScreen)
    isRendering = true
  }
})

socket.on("death", () => {
  window.removeEventListener("keydown", keyboardListener)
  deathMessageHolder.innerText = "You died (press F5 to retry)"
})
