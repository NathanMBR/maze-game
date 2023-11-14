export interface MazeMeasurementsInPixels {
  width: number
  height: number
}

export class Maze {
  public readonly board: Array<Array<number>>

  constructor({ height, width }: MazeMeasurementsInPixels) {
    this.board = new Array(height)
      .fill(0)
      .map(() => new Array(width).fill(0))
  }
}
