import {
  getRandomInteger,
  checkMazeWay,
  isMazeTileOccupied
} from "../utils"

import {
  Maze,
  CoordinateResolver,
  Coordinates
} from "./types"

export const createMatrix = (width: number, height: number): Maze => new Array(height)
  .fill(0)
  .map(() => new Array(width).fill(0))

export const getMazePath = (maze: Maze) => {
  if (maze.length < 3 || maze[0].length < 3)
    throw new Error("Maze must be at least 3x3")

  if (maze.some(mazeRow => mazeRow.length !== maze[0].length))
    throw new Error("All maze rows must have the same length")

  let x = getRandomInteger(0, maze.length - 1)
  let y = getRandomInteger(0, maze[0].length - 1)
  const pathStack: Array<Coordinates> = []

  const getNextCoordinatesResolver = (): CoordinateResolver => {
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
      [0, checkMazeWay(maze, x    , y - 1)],
      [1, checkMazeWay(maze, x + 1, y    )],
      [2, checkMazeWay(maze, x    , y + 1)],
      [3, checkMazeWay(maze, x - 1, y    )]
    ] as const

    const possibleDirections = allDirections.filter(direction => !!direction[1])
    if (possibleDirections.length <= 0) {
      pathStack.pop()

      const previousDirection = pathStack[pathStack.length - 1]
      x = previousDirection.x
      y = previousDirection.y

      const coordinatesResolver = getNextCoordinatesResolver()
      return coordinatesResolver
    }

    const [chosenCoordinatesResolver] = possibleDirections[
      getRandomInteger(0, possibleDirections.length - 1)
    ]

    const coordinatesResolver = coordinatesResolvers[chosenCoordinatesResolver]
    return coordinatesResolver
  }

  const mazeArea = maze.length * maze[0].length
  for (let i = 1; i < mazeArea; i++) {
    maze[y][x] = i
    pathStack.push({ x, y })

    const coordinatesResolver = getNextCoordinatesResolver()
    coordinatesResolver()
  }
  maze[y][x] = mazeArea

  return maze
}

export const getPixelRepresentation = (maze: Maze) => {
  const mazeHeight = maze.length
  const mazeWidth = maze[0].length

  const pixelRepresentation = createMatrix(mazeWidth * 2 - 1, mazeHeight * 2 - 1)
    .map(
      (rowPixels, rowIndex) => rowPixels.map((_, columnIndex) => rowIndex % 2 === 0 && columnIndex % 2 === 0  ? 0 : 1)
    )

  const directionModifiers = {
    x: [0, 1, 0, -1],
    y: [-1, 0, 1, 0]
  }

  const resolveRepresentation = (
    index: number,
    posX: number,
    posY: number
  ) => {
    const nextPosX = posX * 2 + directionModifiers.x[index]
    const nextPosY = posY * 2 + directionModifiers.y[index]

    pixelRepresentation[nextPosY][nextPosX] = 0
  }

  for (let i = mazeHeight * mazeWidth; i > 1; i--) {
    let posX = 0, posY = 0
    let isSearching = true

    for (posY = 0; posY < mazeHeight; posY++) {
      for (posX = 0; posX < mazeWidth; posX++)
        if (maze[posY][posX] === i) {
          isSearching = false
          break
        }

      if (!isSearching)
        break
    }

    const allDirections = new Array(4)
      .fill(0)
      .map(
        (_, index) => [
          index,
          isMazeTileOccupied(
            maze,
            posX + directionModifiers.x[index],
            posY + directionModifiers.y[index]
          )
        ]
      ) as Array<[number, boolean]>

    const possibleDirections = allDirections.filter(direction => !!direction[1])
    const highestPossibleValueDirection = possibleDirections
      .map(
        direction => {
          const [directionIndex] = direction
          const nextPosX = posX + directionModifiers.x[directionIndex]
          const nextPosY = posY + directionModifiers.y[directionIndex]

          const directionData = {
            directionIndex,
            value: maze[nextPosY][nextPosX]
          }
          return directionData
        }
      )
      .reduce(
        (currentDirectionData, nextDirectionData) => {
          const isCurrentValueGreaterThanReference = currentDirectionData.value > maze[posY][posX]
          if (isCurrentValueGreaterThanReference)
            return nextDirectionData

          const isNextValueAsGreatAsPossible = nextDirectionData.value > currentDirectionData.value &&
            nextDirectionData.value < maze[posY][posX]

          return isNextValueAsGreatAsPossible
            ? nextDirectionData
            : currentDirectionData
        }
      )

    const highestPossibleValueDirectionIndex = highestPossibleValueDirection.directionIndex
    resolveRepresentation(highestPossibleValueDirectionIndex, posX, posY)
  }

  return pixelRepresentation
}
