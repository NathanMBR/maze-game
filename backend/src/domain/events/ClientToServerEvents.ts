import { Direction } from "../types";

export type ClientToServerEvents = {
  walk: (direction: Direction) => void
}
