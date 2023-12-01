import {
  Maze,
  Player,
  Bullet
} from "../types"

type MazeEventData = {
  maze: Maze
  mazePath: Maze
  dimensions: {
    width: number
    height: number
  }
  players: Array<Player>
  bullets: Array<Bullet>
}

export type ServerToClientEvents = {
  maze: (data: MazeEventData) => void
}
