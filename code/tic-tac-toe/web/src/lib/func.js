//these are ai generated phrases , but they would do the job
const phrases = {
  move: [
    "Ah, a move of patience and foresight.",
    "Balance and symmetry—this will lead me to victory.",
    "A small step, yet a grand strategy unfolds.",
    "You may not see it yet, but the path is clear to me.",
    "The board whispers its secrets to those who listen.",
    "Every move is a brushstroke on the canvas of fate.",
    "In stillness, I find my strength; in action, my purpose.",
    "The stones align, and the future reveals itself.",
  ],

  win: [
    "Victory, as expected. Do you wish to seek wisdom from this lesson?",
    "The game is simple, yet the mastery is infinite.",
    "A well-fought battle, yet inevitability has taken its course.",
    "The winds of fortune favor the prepared mind.",
    "Another triumph, another lesson for the seeker of truth.",
    "The game ends, but the echoes of strategy linger.",
    "You fought valiantly, but the old ways endure.",
    "Wisdom prevails, as it always has and always will.",
  ],

  tie: [
    "A rare balance has been struck. True wisdom lies in knowing when victory is impossible.",
    "Neither of us has fallen, yet neither has triumphed. Such is the nature of the perfect duel.",
    "The board is silent, and the scales are even. A moment of harmony.",
    "In stalemate, there is no defeat—only the quiet acknowledgment of equals.",
    "The game has spoken: neither of us is master today.",
    "A draw, like the horizon, stretches endlessly between us.",
    "The stones rest, and the universe sighs in equilibrium.",
  ],

  opponentMove: [
    "A respectable move, but is it truly wise?",
    "Ah, the dance of intellect continues.",
    "You seek to corner me? I have walked this path a thousand times.",
    "An interesting choice, but the labyrinth is deeper than you know.",
    "You play with courage, but courage alone cannot unravel the threads of fate.",
    "A bold step, yet the mountain remains unmoved.",
    "The board shifts, but the balance remains in my hands.",
    "You challenge the storm, but the storm has weathered eons.",
  ],
};

export const getRandomPhrase = (type) => {
  return phrases[type][Math.floor(Math.random() * phrases[type].length)];
};

export const checkWinner = (board) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return board.includes(null) ? null : "tie";
};
