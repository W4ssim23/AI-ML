import { checkWinner } from "./func";

const evaluation = (board, agentRole, playerRole, depth) => {
  const winner = checkWinner(board);
  if (winner === null) return null;
  if (winner === agentRole) return 10 - depth;
  if (winner === playerRole) return depth - 10;
  if (winner === "tie") return 0;
};

const minimax = (
  board,
  depth,
  isMaximizing,
  alpha,
  beta,
  agentRole,
  playerRole
) => {
  const val = evaluation(board, agentRole, playerRole, depth);
  if (val !== null) return val;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        board[i] = agentRole;
        let evalScore = minimax(
          board,
          depth + 1,
          false,
          alpha,
          beta,
          agentRole,
          playerRole
        );
        board[i] = null;
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        board[i] = playerRole;
        let evalScore = minimax(
          board,
          depth + 1,
          true,
          alpha,
          beta,
          agentRole,
          playerRole
        );
        board[i] = null;
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
    }
    return minEval;
  }
};

export const agent = (board, agentRole) => {
  let bestScore = -Infinity;
  let move = null;
  const playerRole = agentRole === "X" ? "O" : "X";

  for (let i = 0; i < board.length; i++) {
    if (!board[i]) {
      board[i] = agentRole;
      let score = minimax(
        board,
        0,
        false,
        -Infinity,
        Infinity,
        agentRole,
        playerRole
      );
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
};
