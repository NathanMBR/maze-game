import { Coordinates } from "./Coordinates"

export type Player = {
  id: string
  position: Coordinates
  lastShotAt: number
}
