import flatten from 'lodash/flatten'

export default class Piece {
  constructor(scene, position, hex) {
    this.index = 5

    this.gridX = hex.gridX
    this.gridY = hex.gridY

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
    return this.getLines(getHex, [
      { name: 'front-right', size: 20 },
      { name: 'back-right', size: 20 },
      { name: 'front-left', size: 20 },
      { name: 'back-left', size: 20 },
      { name: 'horizontal', size: 20 },
    ])
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
