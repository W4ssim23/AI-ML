import { Snake } from "./snake";

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const cellSize = 20;

let cellOnY = Math.floor((window.innerHeight * 0.8) / 20);
let cellOnX = Math.floor((window.innerWidth * 0.8) / 20);

if (cellOnY % 2 !== 0) cellOnY += 1; //bc of my hamilton logic,this insures that we always get one
if (cellOnX % 2 !== 0) cellOnX += 1;

canvas.height = cellOnY * 20;
canvas.width = cellOnX * 20;

const snake = new Snake(cellOnX, cellOnY, cellSize, 20);

snake.draw(ctx);

const gameLoop = (currentTime) => {
  requestAnimationFrame(gameLoop);
  snake.update(ctx, canvas.width, canvas.height, currentTime);
};

gameLoop();
