import { getRandomInteger } from "../utils"

type CoordinatesResolver = () => void

export interface MazeMeasurementsInPixels {
  width: number
  height: number
}

export class Maze {
  public readonly board: Array<Array<number>>

  constructor({ height, width }: MazeMeasurementsInPixels) {
    if (height < 3 || width < 3)
      throw new Error("Maze must be at least 3x3")

    this.board = new Array(height)
      .fill(0)
      .map(() => new Array(width).fill(0))
  }

  public validateBoardCoordinates(x: number, y: number): boolean {
    const boardHeight = this.board.length
    const boardWidth = this.board[0]!.length

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

  public getRandomizedBoard() {
    const boardHeight = this.board.length
    const boardWidth = this.board[0]!.length
    const boardArea = boardHeight * boardWidth

    let x = getRandomInteger(0, boardHeight - 1)
    let y = getRandomInteger(0, boardWidth - 1)
    const pathStack: Array<{ x: number, y: number }> = []

    const getNextCoordinatesResolver = (): CoordinatesResolver => {
      const coordinatesResolvers = [
        () => {
          y -= 1
        },

        () => {
          x += 1
        },

        () => {
          y += 1
        },

        () => {
          x -= 1
        }
      ] as const

      const allDirections = [
        [0, this.validateBoardTileAvailability(x    , y - 1)],
        [1, this.validateBoardTileAvailability(x + 1, y    )],
        [2, this.validateBoardTileAvailability(x    , y + 1)],
        [3, this.validateBoardTileAvailability(x - 1, y    )]
      ] as const

      const possibleDirections = allDirections.filter(direction => !!direction[1]);
      if (possibleDirections.length <= 0) {
        pathStack.pop()

        const previousDirection = pathStack[pathStack.length - 1]!
        x = previousDirection.x
        y = previousDirection.y

        const coordinatesResolver = getNextCoordinatesResolver()
        return coordinatesResolver
      }

      const chosenCoordinatesResolver = possibleDirections[
        getRandomInteger(0, possibleDirections.length - 1)
      ]![0]!

      const coordinatesResolver = coordinatesResolvers[chosenCoordinatesResolver]
      return coordinatesResolver
    }

    for (let i = 1; i < boardArea; i++) {
      this.board[y]![x] = i
      pathStack.push({ x, y })

      const coordinatesResolver = getNextCoordinatesResolver()
      coordinatesResolver()
    }

    this.board[y]![x] = boardArea

    return this.board
  }
}
