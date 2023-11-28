import { Direction } from "../types/Direction";

export type ClientToServerEvents = {
  walk: (direction: Direction) => void
  shoot: (direction: Direction) => void
}
