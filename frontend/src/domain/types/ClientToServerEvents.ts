import { Direction } from "./Direction";

export type ClientToServerEvents = {
  movement: (direction: Direction) => void,
}
