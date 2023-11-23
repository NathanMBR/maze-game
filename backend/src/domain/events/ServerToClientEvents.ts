import {
  Maze,
  Player
} from "../types"

type MazeEventData = {
  maze: Maze
  mazePath: Maze
  dimensions: {
    width: number
    height: number
  }
  players: Array<Player>
}

export type ServerToClientEvents = {
  maze: (data: MazeEventData) => void
}
