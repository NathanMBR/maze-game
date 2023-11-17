import './style.css'

import { io, Socket } from "socket.io-client"

import { ServerToClientEvents } from "./domain"

const canvas = document.querySelector<HTMLCanvasElement>("#game")!
const ctx = canvas.getContext("2d")!

const gameProportionInPixels = 10

const socket: Socket<ServerToClientEvents> = io("http://localhost:3000")

socket.on("maze", ({ dimensions, mazePath, maze }) => {
  canvas.width = (2 * dimensions.width - 1) * gameProportionInPixels
  canvas.height = (2 * dimensions.height - 1) * gameProportionInPixels
  canvas.style.border = `solid ${gameProportionInPixels}px black`

  console.log(mazePath)

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
})
