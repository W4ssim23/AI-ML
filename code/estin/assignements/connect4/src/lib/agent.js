class Position {
  constructor() {
    this.WIDTH = 7;
    this.HEIGHT = 6;
    this.MIN_SCORE = -(this.WIDTH * this.HEIGHT) / 2 + 3;
    this.MAX_SCORE = (this.WIDTH * this.HEIGHT + 1) / 2 - 3;

    // Initialize empty board
    this.currentPosition = 0n; // bitboard for current player
    this.mask = 0n; // bitboard for all played positions
    this.moves = 0; // number of moves played

    // Pre-calculate all position masks
    this.initMasks();
  }

  // Initialize all masks at once to avoid recalculation
  initMasks() {
    // Bottom mask (bottom row with one bit set per column)
    this.bottomMask = 0n;
    for (let i = 0; i < this.WIDTH; i++) {
      this.bottomMask |= 1n << BigInt(i * (this.HEIGHT + 1));
    }

    // Board mask (all playable positions)
    this.boardMask = 0n;
    for (let i = 0; i < this.WIDTH; i++) {
      this.boardMask |=
        ((1n << BigInt(this.HEIGHT)) - 1n) << BigInt(i * (this.HEIGHT + 1));
    }

    // Pre-compute column masks
    this.columnMasks = new Array(this.WIDTH);
    this.bottomMaskCols = new Array(this.WIDTH);
    this.topMaskCols = new Array(this.WIDTH);

    for (let col = 0; col < this.WIDTH; col++) {
      this.columnMasks[col] =
        ((1n << BigInt(this.HEIGHT)) - 1n) << BigInt(col * (this.HEIGHT + 1));
      this.bottomMaskCols[col] = 1n << BigInt(col * (this.HEIGHT + 1));
      this.topMaskCols[col] =
        1n << BigInt(this.HEIGHT - 1 + col * (this.HEIGHT + 1));
    }

    // Pre-compute direction shifts for win detection
    this.directions = [
      1n, // vertical
      BigInt(this.HEIGHT + 1), // horizontal
      BigInt(this.HEIGHT), // diagonal /
      BigInt(this.HEIGHT + 2), // diagonal \
    ];
  }

  // Returns a bitmask containing a single 1 for the bottom cell of a given column (optimized)
  bottomMaskCol(col) {
    return this.bottomMaskCols[col];
  }

  // Returns a bitmask containing a single 1 for the top cell of a given column (optimized)
  topMaskCol(col) {
    return this.topMaskCols[col];
  }

  // Return a bitmask with 1 on all cells of a given column (optimized)
  columnMask(col) {
    return this.columnMasks[col];
  }

  // Returns true if the column is playable
  canPlay(col) {
    return (this.mask & this.topMaskCols[col]) === 0n;
  }

  // Plays a move given by column index
  playCol(col) {
    this.play((this.mask + this.bottomMaskCols[col]) & this.columnMasks[col]);
  }

  // Plays a move given by bitmap representation
  play(move) {
    this.currentPosition ^= this.mask;
    this.mask |= move;
    this.moves++;
  }

  // Plays a sequence of moves starting from an empty board (optimized)
  playMoves(sequence) {
    for (let i = 0; i < sequence.length; i++) {
      const col = parseInt(sequence[i]) - 1;
      if (
        col < 0 ||
        col >= this.WIDTH ||
        !this.canPlay(col) ||
        this.isWinningMove(col)
      ) {
        return i;
      }
      this.playCol(col);
    }
    return sequence.length;
  }

  // Returns true if playing in this column would win the game
  isWinningMove(col) {
    return (
      (this.winningPosition() & this.possible() & this.columnMasks[col]) !== 0n
    );
  }

  // Returns a bitmap of all possible winning positions for the current player
  winningPosition() {
    return this.computeWinningPosition(this.currentPosition, this.mask);
  }

  // Returns a bitmap of all possible winning positions for the opponent
  opponentWinningPosition() {
    return this.computeWinningPosition(
      this.currentPosition ^ this.mask,
      this.mask
    );
  }

  // Returns true if current player can win next move
  canWinNext() {
    return (this.winningPosition() & this.possible()) !== 0n;
  }

  // Returns the number of moves played so far
  nbMoves() {
    return this.moves;
  }

  // Returns a bitmap of the next possible valid moves (optimized)
  possible() {
    return (this.mask + this.bottomMask) & this.boardMask;
  }

  // Returns a bitmap of all possible next moves that do not lose immediately (optimized)
  possibleNonLosingMoves() {
    const possibleMask = this.possible();
    const opponentWin = this.opponentWinningPosition();
    const forcedMoves = possibleMask & opponentWin;

    if (forcedMoves !== 0n) {
      // Optimized bitwise check if there is exactly one bit set
      if ((forcedMoves & (forcedMoves - 1n)) !== 0n) {
        return 0n; // opponent has two winning moves and we cannot stop them
      } else {
        return forcedMoves; // enforce to play the single forced move
      }
    }

    // Avoid playing below an opponent winning spot
    return possibleMask & ~(opponentWin >> 1n);
  }

  // Score a possible move
  moveScore(move) {
    return this.popcount(
      this.computeWinningPosition(this.currentPosition | move, this.mask)
    );
  }

  // IMPROVED: Advanced evaluation function for positions that don't reach terminal states
  evaluatePosition() {
    // Base score starts at 0
    let score = 0;

    // Get bitboards for both players
    const currentPlayerBitboard = this.currentPosition;
    const opponentBitboard = this.currentPosition ^ this.mask;

    // Check potential winning patterns
    const currentPlayerPotential = this.countThreats(
      currentPlayerBitboard,
      opponentBitboard
    );
    const opponentPotential = this.countThreats(
      opponentBitboard,
      currentPlayerBitboard
    );

    // Add scores for threats (with higher weight for current player)
    score += currentPlayerPotential * 10;
    score -= opponentPotential * 8;

    // Control of center columns is strategically valuable
    for (let col = 1; col < this.WIDTH - 1; col++) {
      // Weight increases toward center
      const weight = 3 - Math.abs(3 - col);
      const colMask = this.columnMasks[col];

      // Count pieces in this column for both players
      const currentPlayerPieces = this.popcount(
        currentPlayerBitboard & colMask
      );
      const opponentPieces = this.popcount(opponentBitboard & colMask);

      // Add weighted scores for center control
      score += currentPlayerPieces * weight;
      score -= opponentPieces * weight;
    }

    // Evaluate piece height advantage (pieces higher up are more flexible)
    score += this.evaluateHeightAdvantage(
      currentPlayerBitboard,
      opponentBitboard
    );

    // Penalize leaving winning moves for opponent
    if ((this.opponentWinningPosition() & this.possible()) !== 0n) {
      score -= 50;
    }

    return score;
  }

  // New method: Count threats (potential winning patterns)
  countThreats(playerBitboard, opponentBitboard) {
    let threats = 0;
    const emptySpaces = this.boardMask & ~this.mask;

    // For each direction, check for threats
    for (const dir of this.directions) {
      // Shifted player positions
      const pos1 = playerBitboard;
      const pos2 = playerBitboard << dir;
      const pos3 = playerBitboard << (dir * 2n);

      // Count two-in-a-row with space for a third and fourth
      const twoInRow = pos1 & pos2 & ~pos3 & ~(pos3 << dir);
      const validTwoInRow =
        twoInRow & (emptySpaces >> (dir * 2n)) & (emptySpaces >> (dir * 3n));
      threats += this.popcount(validTwoInRow);

      // Count three-in-a-row with space for a fourth
      const threeInRow = pos1 & pos2 & pos3 & ~(pos3 << dir);
      const validThreeInRow = threeInRow & (emptySpaces >> (dir * 3n));
      threats += this.popcount(validThreeInRow) * 5; // Higher weight for three-in-a-row
    }

    return threats;
  }

  // New method: Evaluate height advantage
  evaluateHeightAdvantage(currentPlayerBitboard, opponentBitboard) {
    let score = 0;

    // Check height distribution
    for (let col = 0; col < this.WIDTH; col++) {
      const colMask = this.columnMasks[col];
      const colBits = this.mask & colMask;
      const height = this.popcount(colBits);

      if (height > 0 && height < this.HEIGHT) {
        // Check who has the top piece
        const topPiece = 1n << BigInt(height - 1 + col * (this.HEIGHT + 1));
        if ((currentPlayerBitboard & topPiece) !== 0n) {
          score += 2; // Advantage for having the top piece
        } else if ((opponentBitboard & topPiece) !== 0n) {
          score -= 2;
        }
      }
    }

    return score;
  }

  // Count number of bits set to one (optimized)
  popcount(n) {
    // Optimized popcount for BigInt
    if (n === 0n) return 0;

    // Convert to a binary string and count '1's
    // Modern JS engines optimize this well for smaller bit patterns
    return n.toString(2).split("1").length - 1;
  }

  // Compute positions that would create an alignment (win) - optimized
  computeWinningPosition(position, mask) {
    let r = 0n;

    // For each direction, compute possible winning positions
    for (const dir of this.directions) {
      // Check for 3 in a row and space for 4th
      let p = (position << dir) & (position << (dir * 2n));

      // Check both directions for the 4th piece
      r |= p & (position << (dir * 3n));
      r |= p & (position >> dir);

      // Check other direction
      p = (position >> dir) & (position >> (dir * 2n));
      r |= p & (position << dir);
      r |= p & (position >> (dir * 3n));
    }

    // Return only positions that are on the board and not already played
    return r & (this.boardMask ^ mask);
  }

  // Generate a key for the transposition table
  key() {
    return this.currentPosition + this.mask;
  }

  // Create a string representation of the board
  toString() {
    let result = "";
    for (let y = this.HEIGHT - 1; y >= 0; y--) {
      result += "|";
      for (let x = 0; x < this.WIDTH; x++) {
        const bit = 1n << BigInt(y + x * (this.HEIGHT + 1));
        if ((this.mask & bit) === 0n) {
          result += " ";
        } else if ((this.currentPosition & bit) === 0n) {
          result += "o";
        } else {
          result += "x";
        }
        result += "|";
      }
      result += "\n";
    }
    result += "+";
    for (let x = 0; x < this.WIDTH; x++) {
      result += "-+";
    }
    result += "\n+";
    for (let x = 0; x < this.WIDTH; x++) {
      result += x + 1 + "+";
    }
    result += "\n";
    return result;
  }
}

class TranspositionTable {
  constructor(size) {
    // Size should be a power of 2 for efficient hashing (increased default size)
    this.size = size || 1 << 22; // Default to 4M entries
    // Using typed arrays for better memory efficiency
    this.keys = new Array(this.size).fill(0n);
    this.values = new Int32Array(this.size);
    this.flags = new Uint8Array(this.size); // Added flags for entry type
    this.depths = new Uint8Array(this.size); // Added depths for replacement strategy

    // Constants for entry types
    this.EXACT = 0;
    this.LOWER_BOUND = 1;
    this.UPPER_BOUND = 2;
  }

  // Reset the table
  reset() {
    this.keys.fill(0n);
    this.values.fill(0);
    this.flags.fill(0);
    this.depths.fill(0);
  }

  // Hash function to find index (optimized with better distribution)
  index(key) {
    // Better hash function to reduce collisions
    const hash = Number((key ^ (key >> 32n)) & BigInt(this.size - 1));
    return hash;
  }

  // Store a value for a given key with entry type and depth
  put(key, value, flag = 0, depth = 0) {
    const pos = this.index(key);

    // Replacement strategy: always replace if empty or same key
    // For different keys, replace if new depth is higher or equal
    if (
      this.keys[pos] === 0n ||
      this.keys[pos] === key ||
      this.depths[pos] <= depth
    ) {
      this.keys[pos] = key;
      this.values[pos] = value;
      this.flags[pos] = flag;
      this.depths[pos] = depth;
    }
  }

  // Get the value of a key
  get(key) {
    const pos = this.index(key);
    if (this.keys[pos] === key) {
      return {
        value: this.values[pos],
        flag: this.flags[pos],
        depth: this.depths[pos],
      };
    }
    return { value: 0, flag: 0, depth: 0 };
  }
}

class MoveSorter {
  constructor(width) {
    this.width = width;
    // Pre-allocate memory for entry objects
    this.entries = new Array(width);
    for (let i = 0; i < width; i++) {
      this.entries[i] = { move: 0n, score: 0 };
    }
    this.size = 0;

    // History heuristic for move ordering
    this.history = new Map();
  }

  // Add a move with its score
  add(move, score) {
    // Add history score bonus if available
    const historyScore = this.history.get(move.toString()) || 0;
    const combinedScore = score + historyScore / 10;

    // Binary insertion for better performance
    let low = 0;
    let high = this.size;

    while (low < high) {
      const mid = (low + high) >>> 1;
      if (this.entries[mid].score > combinedScore) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }

    // Insert at position
    for (let i = this.size; i > low; i--) {
      this.entries[i] = this.entries[i - 1];
    }

    this.entries[low] = { move, score: combinedScore };
    this.size++;
  }

  // Get next move with highest score
  getNext() {
    if (this.size > 0) {
      return this.entries[--this.size].move;
    }
    return 0n;
  }

  // Update history score for a good move
  updateHistory(move, depth) {
    const moveStr = move.toString();
    const currentScore = this.history.get(moveStr) || 0;
    this.history.set(moveStr, currentScore + (1 << depth));
  }

  // Reset the sorter
  reset() {
    this.size = 0;
    // Don't reset history - it's useful across positions
  }

  // Reset all data including history
  resetAll() {
    this.size = 0;
    this.history.clear();
  }
}

class Solver {
  constructor() {
    this.transTable = new TranspositionTable();
    this.nodeCount = 0;
    this.positionPool = []; // Object pool for positions

    // Killer moves heuristic - stores good moves at each depth
    this.killerMoves = new Array(100).fill(0n);

    // Column exploration order - start with center columns
    this.columnOrder = [3, 2, 4, 1, 5, 0, 6]; // Pre-calculated order

    this.INVALID_MOVE = -1000;

    // Entry type flags
    this.EXACT = 0;
    this.LOWER_BOUND = 1;
    this.UPPER_BOUND = 2;

    // Fixed values for scores
    this.WIN_SCORE = 1000000; // High value to distinguish from heuristic values
    this.DRAW_SCORE = 0;
  }

  // Get a Position object from the pool or create new one
  getPosition() {
    if (this.positionPool.length > 0) {
      return this.positionPool.pop();
    }
    return new Position();
  }

  // Return a Position object to the pool
  releasePosition(position) {
    // Reset critical fields
    position.currentPosition = 0n;
    position.mask = 0n;
    position.moves = 0;
    this.positionPool.push(position);
  }

  // Reset solver state
  reset() {
    this.nodeCount = 0;
    this.transTable.reset();
    this.killerMoves.fill(0n);
  }

  // FIXED: Negamax function with proper depth-limited search
  negamax(position, alpha, beta, depth = 0, maxDepth = Infinity) {
    this.nodeCount++;

    // Terminal node checks
    if (position.canWinNext()) {
      return this.WIN_SCORE - depth; // Win sooner is better
    }

    // Check for non-winning moves
    const possible = position.possibleNonLosingMoves();
    if (possible === 0n) {
      // If no possible moves, opponent wins next move
      return -this.WIN_SCORE + depth; // Lose later is better
    }

    // Check for draw
    if (position.nbMoves() >= position.WIDTH * position.HEIGHT - 2) {
      return this.DRAW_SCORE;
    }

    // If we've hit the depth limit, use evaluation function
    if (depth >= maxDepth && maxDepth !== Infinity) {
      return position.evaluatePosition();
    }

    // Check transposition table
    const key = position.key();
    const entry = this.transTable.get(key);

    if (entry.value !== 0 && entry.depth >= maxDepth - depth) {
      if (entry.flag === this.EXACT) {
        return entry.value;
      } else if (entry.flag === this.LOWER_BOUND) {
        alpha = Math.max(alpha, entry.value);
      } else if (entry.flag === this.UPPER_BOUND) {
        beta = Math.min(beta, entry.value);
      }

      if (alpha >= beta) {
        return entry.value;
      }
    }

    // Move ordering
    const moves = new MoveSorter(position.WIDTH);

    // Try killer move first if valid
    const killerMove = this.killerMoves[depth];
    if (killerMove !== 0n && (possible & killerMove) !== 0n) {
      moves.add(killerMove, 1000000); // High priority
    }

    // Then try other moves ordered by score
    for (let i = 0; i < position.WIDTH; i++) {
      const col = this.columnOrder[i];
      const colMask = position.columnMask(col);
      const move = possible & colMask;

      if (move !== 0n && move !== killerMove) {
        // Improved move ordering with quick evaluation
        moves.add(move, position.moveScore(move));
      }
    }

    // Try each move and use negamax recursively
    let bestScore = -Infinity;
    let bestMove = 0n;
    let next;
    let flag = this.UPPER_BOUND;

    while ((next = moves.getNext()) !== 0n) {
      const newPosition = this.getPosition();
      newPosition.currentPosition = position.currentPosition;
      newPosition.mask = position.mask;
      newPosition.moves = position.moves;

      newPosition.play(next);

      const score = -this.negamax(
        newPosition,
        -beta,
        -alpha,
        depth + 1,
        maxDepth
      );

      this.releasePosition(newPosition);

      if (score > bestScore) {
        bestScore = score;
        bestMove = next;
      }

      if (score > alpha) {
        alpha = score;
        flag = this.EXACT;
      }

      if (alpha >= beta) {
        // Store killer move for this depth - good for move ordering
        this.killerMoves[depth] = next;
        moves.updateHistory(next, depth);
        this.transTable.put(key, alpha, this.LOWER_BOUND, maxDepth - depth);
        return alpha;
      }
    }

    // Store the result in the transposition table with proper flag
    this.transTable.put(key, alpha, flag, maxDepth - depth);

    // If we found a good move, update history
    if (bestMove !== 0n) {
      moves.updateHistory(bestMove, depth);
    }

    return alpha;
  }

  // FIXED: Solve function that properly handles the depth limit
  solve(position, weak = false, maxDepth = Infinity) {
    // Check for immediate win
    if (position.canWinNext()) {
      return this.WIN_SCORE;
    }

    // For depth limited search with weak solver
    if (maxDepth !== Infinity && weak) {
      return this.negamax(position, -Infinity, Infinity, 0, maxDepth);
    }

    // For weak solver (just determine win/loss/draw)
    if (weak) {
      const score = this.negamax(
        position,
        -this.WIN_SCORE,
        this.WIN_SCORE,
        0,
        maxDepth
      );
      if (score > 0) return 1;
      if (score < 0) return -1;
      return 0;
    }

    // For full solver, use iterative deepening if depth limited
    if (maxDepth !== Infinity) {
      let bestScore = -Infinity;

      // Start with small depth and increase
      for (let currDepth = 1; currDepth <= maxDepth; currDepth++) {
        const score = this.negamax(position, -Infinity, Infinity, 0, currDepth);
        bestScore = score;

        // If we found a definitive result, we can stop
        if (Math.abs(score) >= this.WIN_SCORE - 100) {
          break;
        }
      }

      return bestScore;
    }

    // For full depth search without limit
    return this.negamax(position, -Infinity, Infinity, 0, Infinity);
  }

  // FIXED: Analyze function with proper iterative deepening
  analyze(position, weak = false, maxDepth = Infinity) {
    const scores = new Array(position.WIDTH).fill(this.INVALID_MOVE);

    // Check for immediate wins first
    for (let col = 0; col < position.WIDTH; col++) {
      if (position.canPlay(col) && position.isWinningMove(col)) {
        scores[col] = this.WIN_SCORE;
      }
    }

    // Implement iterative deepening properly
    if (maxDepth !== Infinity) {
      // Start with shallow searches
      for (let currDepth = 1; currDepth <= maxDepth; currDepth++) {
        // Create a copy of scores to track progress
        const tempScores = [...scores];
        let allResolved = true;

        // Analyze each column with current depth
        for (let col = 0; col < position.WIDTH; col++) {
          if (position.canPlay(col) && scores[col] === this.INVALID_MOVE) {
            const newPosition = this.getPosition();
            newPosition.currentPosition = position.currentPosition;
            newPosition.mask = position.mask;
            newPosition.moves = position.moves;

            newPosition.playCol(col);

            // Use negamax with current depth limit
            tempScores[col] = -this.negamax(
              newPosition,
              -Infinity,
              Infinity,
              0,
              currDepth
            );

            this.releasePosition(newPosition);

            // If we haven't reached max depth, we're not fully resolved
            if (currDepth < maxDepth) {
              allResolved = false;
            }
          }
        }

        // Update scores with this iteration's results
        for (let col = 0; col < position.WIDTH; col++) {
          if (tempScores[col] !== this.INVALID_MOVE) {
            scores[col] = tempScores[col];
          }
        }

        // If all columns are resolved or we've reached max depth, we can stop
        if (allResolved || currDepth === maxDepth) {
          break;
        }
      }
    } else {
      // Full-depth search for each column
      for (let col = 0; col < position.WIDTH; col++) {
        if (position.canPlay(col) && scores[col] === this.INVALID_MOVE) {
          const newPosition = this.getPosition();
          newPosition.currentPosition = position.currentPosition;
          newPosition.mask = position.mask;
          newPosition.moves = position.moves;

          newPosition.playCol(col);
          scores[col] = -this.solve(newPosition, weak, maxDepth);

          this.releasePosition(newPosition);
        }
      }
    }

    return scores;
  }

  // Find the best move with enhanced decision making
  findBestMove(position, maxDepth = Infinity) {
    const scores = this.analyze(position, false, maxDepth);
    let bestScore = -Infinity;
    let bestCol = -1;

    // Find the best scoring move
    for (let col = 0; col < position.WIDTH; col++) {
      if (position.canPlay(col) && scores[col] > bestScore) {
        bestScore = scores[col];
        bestCol = col;
      }
    }

    return { column: bestCol, score: bestScore };
  }

  // Get number of nodes explored
  getNodeCount() {
    return this.nodeCount;
  }
}

// Interface for using the solver
class Connect4Interface {
  constructor() {
    this.position = new Position();
    this.solver = new Solver();
  }

  // Reset the game
  reset() {
    this.position = new Position();
    this.solver.reset();
  }

  // Play sequence from the start
  setPosition(sequence) {
    this.reset();
    const played = this.position.playMoves(sequence);
    return played === sequence.length;
  }

  // Play a single move
  playMove(column) {
    if (
      column < 0 ||
      column >= this.position.WIDTH ||
      !this.position.canPlay(column)
    ) {
      return false;
    }
    this.position.playCol(column);
    return true;
  }

  // Check if column will result in a win
  isWinningMove(column) {
    return this.position.isWinningMove(column);
  }

  // Get best move with its score and optional depth limit
  getBestMove(weakSolver = false, maxDepth = Infinity) {
    this.solver.reset();
    return this.solver.findBestMove(this.position, maxDepth);
  }

  // Get scores for all possible moves with optional depth limit
  getMovesScores(weakSolver = false, maxDepth = Infinity) {
    this.solver.reset();
    return this.solver.analyze(this.position, weakSolver, maxDepth);
  }

  // Get current board as string
  getBoardString() {
    return this.position.toString();
  }

  // Get current player (1 for first player, 2 for second player)
  getCurrentPlayer() {
    return (this.position.nbMoves() % 2) + 1;
  }

  // Check if position is a draw
  isDraw() {
    return (
      this.position.nbMoves() === this.position.WIDTH * this.position.HEIGHT
    );
  }

  // Check if position is a win for the last player
  isWin() {
    // If the last move was a winning move, the current player can't move
    for (let col = 0; col < this.position.WIDTH; col++) {
      if (this.position.canPlay(col) && this.position.isWinningMove(col)) {
        return false;
      }
    }

    // Check if previous move resulted in a win
    if (this.position.nbMoves() > 0) {
      // Create a temporary position with the previous move undone
      const prevPosition = new Position();
      let sequence = "";
      for (let i = 0; i < this.position.nbMoves() - 1; i++) {
        sequence +=
          (Math.floor(i / this.position.HEIGHT) % this.position.WIDTH) + 1;
      }
      prevPosition.playMoves(sequence);

      // Check if the last move was winning
      const lastCol =
        Math.floor((this.position.nbMoves() - 1) / this.position.HEIGHT) %
        this.position.WIDTH;
      return prevPosition.isWinningMove(lastCol);
    }

    return false;
  }
}

export { Position, Solver, Connect4Interface };
