export const game_const = {
  ROWS: 6,
  COLS: 7,
  EMPTY: null,
  RED_Player: "red",
  YELLOW_Player: "yellow",
};

const { ROWS, COLS, EMPTY } = game_const;

function createEmptyBoard() {
  return Array(ROWS)
    .fill()
    .map(() => Array(COLS).fill(EMPTY));
}

function checkDraw(board) {
  return board[0].every((cell) => cell !== EMPTY);
}

function checkWin(board, row, col, player) {
  const directions = [
    [
      [0, 1],
      [0, -1],
    ], // horizontal
    [
      [1, 0],
      [-1, 0],
    ], // vertical
    [
      [1, 1],
      [-1, -1],
    ], // diagonal down-right
    [
      [1, -1],
      [-1, 1],
    ], // diagonal up-right
  ];

  for (const directionPair of directions) {
    const connectedCells = [[row, col]];

    for (const [dx, dy] of directionPair) {
      let r = row + dx;
      let c = col + dy;

      while (
        r >= 0 &&
        r < ROWS &&
        c >= 0 &&
        c < COLS &&
        board[r][c] === player
      ) {
        connectedCells.push([r, c]);
        r += dx;
        c += dy;
      }
    }

    if (connectedCells.length >= 4) {
      return connectedCells;
    }
  }

  return null;
}

export { createEmptyBoard, checkDraw, checkWin };
