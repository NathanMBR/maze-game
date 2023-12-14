import type {
  Maze,
  Player,
  Bullet,
  Bomb
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
  bombs: Array<Bomb>
}

export type ServerToClientEvents = {
  maze: (data: MazeEventData) => void
  death: () => void
}
