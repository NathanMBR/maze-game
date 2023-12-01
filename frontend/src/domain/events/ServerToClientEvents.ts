import { MazeEventData } from "../types/MazeEventData"

export type ServerToClientEvents = {
  maze: (data: MazeEventData) => void
  death: () => void
}
