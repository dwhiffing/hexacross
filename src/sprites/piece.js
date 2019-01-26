import flatten from 'lodash/flatten'
import compact from 'lodash/compact'

const BACKROW = [4, 2, 3, 1, 0, 3, 2, 4]
export default class Piece {
  constructor(scene, position, hex) {
    const oddPosition = (position + 1) % 2 === 1
    this.index = 5

    this.gridX = hex.gridX
    this.gridY = hex.gridY

    if (position <= 15) {
      if (oddPosition) {
        this.index = BACKROW[position / 2]
      }
    } else if (!oddPosition) {
      this.index = BACKROW[(position - 17) / 2]
    }

    if (position < 16) {
      this.black = true
      this.index += 6
    }

    this.sprite = scene.add.image(hex.sprite.x, hex.sprite.y - 4, 'tiles', this.index)
    this.sprite.scaleX = 0.4
    this.sprite.scaleY = 0.4
    this.position = position
  }

  move(hex) {
    this.sprite.y = hex.sprite.y - 4
    this.sprite.x = hex.sprite.x
    this.gridX = hex.gridX
    this.gridY = hex.gridY
    hex.piece = this
  }

  getPossibleMoves(getHex) {
    const piece = this.index >= 6 ? this.index - 6 : this.index
    if (piece === 5) {
      // pawn
      return this.getLines(
        getHex,
        this.black
          ? [{ name: 'back-right', size: 1 }, { name: 'back-left', size: 1 }]
          : [{ name: 'front-right', size: 1 }, { name: 'front-left', size: 1 }],
      )
    }
    if (piece === 4) {
      // rook
      return this.getLines(getHex, [
        { name: 'front-right', size: 1 },
        { name: 'back-right', size: 1 },
        { name: 'front-left', size: 1 },
        { name: 'back-left', size: 1 },
        { name: 'horizontal', size: 20 },
      ])
    }
    if (piece === 3) {
      // knight
      return this.getLines(getHex, [
        { name: 'front-right', size: 2, canJump: true },
        { name: 'back-right', size: 2, canJump: true },
        { name: 'front-left', size: 2, canJump: true },
        { name: 'back-left', size: 2, canJump: true },
        { name: 'horizontal', size: 2, canJump: true },
      ])
    }
    if (piece === 2) {
      // bishop
      return this.getLines(getHex, [
        { name: 'front-right', size: 20 },
        { name: 'back-right', size: 20 },
        { name: 'front-left', size: 20 },
        { name: 'back-left', size: 20 },
      ])
    }
    if (piece === 1) {
      // queen
      return this.getLines(getHex, [
        { name: 'front-right', size: 20 },
        { name: 'back-right', size: 20 },
        { name: 'front-left', size: 20 },
        { name: 'back-left', size: 20 },
        { name: 'horizontal', size: 20 },
      ])
    }
    if (piece === 0) {
      // king
      return this.getLines(getHex, [
        { name: 'front-right', size: 1 },
        { name: 'back-right', size: 1 },
        { name: 'front-left', size: 1 },
        { name: 'back-left', size: 1 },
        { name: 'horizontal', size: 3 },
      ])
    }
  }

  getLines(getHex, directions) {
    return flatten(
      directions.map((direction) => {
        const { name, size, canJump } = direction
        return [
          ...(name === 'front-right'
            ? this.getDiagonalLine(getHex, {
              size,
              canJump,
              isRight: true,
              isBack: false,
            })
            : []),
          ...(name === 'front-left'
            ? this.getDiagonalLine(getHex, {
              size,
              canJump,
              isRight: false,
              isBack: false,
            })
            : []),
          ...(name === 'back-right'
            ? this.getDiagonalLine(getHex, {
              size,
              canJump,
              isRight: true,
              isBack: true,
            })
            : []),
          ...(name === 'back-left'
            ? this.getDiagonalLine(getHex, {
              size,
              canJump,
              isRight: false,
              isBack: true,
            })
            : []),
          ...(name === 'horizontal'
            ? this.getHorizontalLine(getHex, { size: direction.size })
            : []),
        ]
      }),
    )
  }

  getDiagonalLine(getHex, {
    isRight, isBack, canJump = false, size,
  } = {}) {
    const {
      x, y, even, odd,
    } = this.getCoords()

    let i = 1
    const hexes = []
    const blocked = {}
    const reverse = isRight ? 1 : -1
    let _size = 1

    const addHex = (hex, direction) => {
      if (hex && !blocked[direction]) {
        if (hex.piece && !canJump) {
          blocked[direction] = true
        } else {
          hexes.push(hex)
        }
      }
    }

    while (_size <= size) {
      const moreThanOneToGo = size - _size > 0

      const diagonalOddFront = getHex(x + (_size + 1) * reverse, y - i)
      const diagonalOddBack = getHex(x - (_size + 1) * reverse, y + i)
      const diagonalEvenFront = getHex(x + _size * reverse, y - (even + (i - 1)))
      const diagonalEvenBack = getHex(x - _size * reverse, y + (odd + (i - 1)))

      if (isBack) {
        addHex(diagonalEvenBack, isRight ? 'diagonalBackRight' : 'diagonalBackLeft')
      } else {
        addHex(diagonalEvenFront, isRight ? 'diagonalFrontRight' : 'diagonalFrontLeft')
      }
      if (moreThanOneToGo) {
        if (isBack) {
          addHex(diagonalOddBack, isRight ? 'diagonalBackRight' : 'diagonalBackLeft')
        } else {
          addHex(diagonalOddFront, isRight ? 'diagonalFrontRight' : 'diagonalFrontLeft')
        }
      }
      _size += 2
      i += 1
    }

    return hexes.filter(hex => hex && !hex.piece)
  }

  getCoords() {
    const x = this.gridX
    const y = this.gridY
    const even = x % 2 === 0 ? 1 : 0
    const odd = even === 1 ? 0 : 1

    return {
      x,
      y,
      even,
      odd,
    }
  }

  getHorizontalLine(getHex, { size, canJump } = {}) {
    const { x, y } = this.getCoords()
    const hexes = []
    const blocked = {}
    const addHex = (hex, direction) => {
      if (hex && !blocked[direction]) {
        if (hex.piece && !canJump) {
          blocked[direction] = true
        } else {
          hexes.push(hex)
        }
      }
    }
    let i = 2
    while (i < size) {
      addHex(getHex(x + i, y), 'right')
      addHex(getHex(x - i, y), 'left')
      i += 2
    }
    return hexes.filter(hex => hex && !hex.piece)
  }
}
