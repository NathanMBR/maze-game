import './style.css'

import { io, Socket } from "socket.io-client"

import {
  ServerToClientEvents,
  MazeEventData
} from "./domain"

const canvas = document.querySelector<HTMLCanvasElement>("#game")!
const ctx = canvas.getContext("2d")!

const gameProportionInPixels = 10

let animationFrameId: number | undefined

const socket: Socket<ServerToClientEvents> = io("http://localhost:3000")

let mazeData: MazeEventData
let socketId = ""

const renderScreen = () => {
  const {
    dimensions,
    maze,
    players,

  } = mazeData

  const colors = {
    mazeWall: "#000",
    enemyPlayer: "#F00",
    currentPlayer: "#090"
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

  requestAnimationFrame(renderScreen)
}

socket.on("maze", data => {
  console.log(data)

  mazeData = data
  socketId = socket.id

  if (!animationFrameId)
    animationFrameId = requestAnimationFrame(renderScreen)
})
