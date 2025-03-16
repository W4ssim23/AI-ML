import { Snake } from "./snake";

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const cellSize = 20;

let cellOnY = Math.floor((window.innerHeight * 0.8) / 20);
let cellOnX = Math.floor((window.innerWidth * 0.8) / 20);

canvas.height = cellOnY * 20;
canvas.width = cellOnX * 20;

window.addEventListener("resize", () => {
  cellOnX = Math.floor((window.innerHeight * 0.8) / 20);
  cellOnY = Math.floor((window.innerWidth * 0.8) / 20);
  canvas.height = cellOnX * 20;
  canvas.width = cellOnY * 20;
});

const snake = new Snake(cellOnX, cellOnY, cellSize, 150);

const updateDirection = (e) => {
  switch (e.key) {
    case "ArrowUp":
      snake.setDirection("up");
      break;
    case "ArrowDown":
      snake.setDirection("down");
      break;
    case "ArrowLeft":
      snake.setDirection("left");
      break;
    case "ArrowRight":
      snake.setDirection("right");
      break;
  }
};

window.addEventListener("keydown", updateDirection);

snake.draw(ctx);

const gameLoop = (currentTime) => {
  requestAnimationFrame(gameLoop);
  snake.update(ctx, canvas.width, canvas.height, currentTime);
};

gameLoop();
