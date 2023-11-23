import { Direction } from "../types";

export type ClientToServerEvents = {
  movement: (direction: Direction) => void,
}
