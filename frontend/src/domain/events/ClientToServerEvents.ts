import { Direction } from "../types/Direction";

export type ClientToServerEvents = {
  movement: (direction: Direction) => void,
}
