import { MazeEventData } from "./MazeEventData"

export type ServerToClientEvents = {
  maze: (data: MazeEventData) => void
}
