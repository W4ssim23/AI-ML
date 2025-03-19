import { agent } from "./agent";

class Snake {
  constructor(cellsOnX, cellsOnY, cellSize, delay) {
    this.xpos = cellSize * 2;
    this.ypos = cellSize * 2;
    this.cellSize = cellSize;
    this.direction = "right";
    this.body = [
      [this.xpos, this.ypos],
      [this.xpos - cellSize, this.ypos],
      [this.xpos - cellSize * 2, this.ypos],
    ]; //start with the lenght of three

    this.fruitX = cellSize * 8;
    this.fruitY = cellSize * 8;

    this.cellsOnX = cellsOnX;
    this.cellsOnY = cellsOnY;
    this.delay = delay;
    this.lastUpdate = 0;
  }

  draw(ctx) {
    ctx.fillStyle = "red";
    ctx.fillRect(this.fruitX, this.fruitY, this.cellSize, this.cellSize);

    ctx.fillStyle = "green";
    this.body.map((val) => {
      ctx.fillRect(val[0], val[1], this.cellSize, this.cellSize);
    });
  }

  setDirection(direction) {
    if (
      (this.direction === "left" && direction === "right") ||
      (this.direction === "right" && direction === "left") ||
      (this.direction === "down" && direction === "up") ||
      (this.direction === "up" && direction === "down")
    )
      return;
    this.direction = direction;
  }

  reset() {
    this.xpos = this.cellSize * 2;
    this.ypos = this.cellSize * 2;
    this.direction = "right";
    this.body = [
      [this.xpos, this.ypos],
      [this.xpos - this.cellSize, this.ypos],
      [this.xpos - this.cellSize * 2, this.ypos],
    ];

    this.fruitX = this.cellSize * 8;
    this.fruitY = this.cellSize * 8;
  }

  prohCol(head) {
    if (head[0] > (this.cellsOnX - 1) * this.cellSize) this.reset();
    if (head[1] > (this.cellsOnY - 1) * this.cellSize) this.reset();
    if (head[0] < 0) this.reset();
    if (head[1] < 0) this.reset();
    if (
      this.body.some(
        (part, idx) => part[0] === head[0] && part[1] === head[1] && idx !== 0
      )
    )
      this.reset();
  }

  update(ctx, w, h, currentTime) {
    if (currentTime - this.lastUpdate < this.delay) return;
    ctx.clearRect(0, 0, w, h);

    const head = [...this.body[0]];
    const fruit = [this.fruitX, this.fruitY];
    const arena = {
      head: head,
      body: this.body,
      cellSize: this.cellSize,
      cellsOnX: this.cellsOnX,
      cellsOnY: this.cellsOnY,
    };

    this.setDirection(agent(this.direction, fruit, arena));

    switch (this.direction) {
      case "up":
        head[1] -= this.cellSize;
        break;
      case "down":
        head[1] += this.cellSize;
        break;
      case "left":
        head[0] -= this.cellSize;
        break;
      case "right":
        head[0] += this.cellSize;
        break;
    }

    if (head[0] === this.fruitX && head[1] === this.fruitY) {
      do {
        this.fruitX = Math.floor(Math.random() * this.cellsOnX) * 20;
        this.fruitY = Math.floor(Math.random() * this.cellsOnY) * 20;
      } while (
        this.body.some(
          (snakePart) =>
            snakePart[0] === this.fruitX && snakePart[1] === this.fruitY
        )
      );
    } else {
      this.body.pop();
    }

    this.body = [head, ...this.body];

    this.prohCol(head);

    this.draw(ctx);
    this.lastUpdate = currentTime;
  }
}

export { Snake };
