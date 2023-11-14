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


  public validateBoardCoordinates(x: number, y: number): boolean {
    const boardHeight = this.board.length
    const boardWidth = this.board[0]?.length || 0

    const areCoordinatesValid =
      x < 0 ||
      y < 0 ||
      x >= boardWidth ||
      y >= boardHeight

    return areCoordinatesValid
  }

  public validateBoardTileAvailability(x: number, y: number): boolean {
    const areBoardCoordinatesValid = this.validateBoardCoordinates(x, y)

    if (!areBoardCoordinatesValid)
      return false

    const isBoardTileAvailable = !!this.board[y]?.[x]
    return isBoardTileAvailable
  }
}
