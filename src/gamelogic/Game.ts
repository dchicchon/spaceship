import { Q5, Vector } from 'q5xts';
import type { Entity } from './Entity';
import earth from '../assets/earth.png';
import mars from '../assets/mars.png';
import playerImage from '../assets/ship1.png';
import ast1 from '../assets/ast1.png';
import ast2 from '../assets/ast2.png';
import ast3 from '../assets/ast3.png';
import { Planet } from './Planet';
import { Player } from './Player';
import { Asteroid } from './Asteroid';

// TODO: Create Game Map
// ? Should there be game map? Or should this be an infinite map?
// ? With a game map it would be more logical? players could understand
// ? locations better across the galaxy?
// DONE: Create Player camera
  // offscreen region
// any point in this being a preact app?

export class Game extends Q5 {
  // stars: Array<Vector>;
  entities: Array<Entity>;
  player: Player;
  cameraPos: Vector;

  constructor(parentElm: HTMLElement) {
    super('', parentElm);
    this.setup = this.setupFn;
    this.draw = this.drawFn;
    this.noiseSeed(1);
    this.entities = [];
    // maybe planets are not entities? not sure. we should be drawing them
    // if they come up?
    this.createPlanets();
    this.player = this.createPlayer();
    this.cameraPos = this.createVector(
      this.player.position.x - this.width / 2,
      this.player.position.y - this.height / 2
    );
  }

  createPlanets() {
    this.entities.push(
      new Planet({
        position: this.createVector(100, 100),
        width: 150,
        height: 150,
        image: this.loadImage(earth),
      })
    );
    this.entities.push(
      new Planet({
        position: this.createVector(this.width - 100, this.height - 100),
        width: 150,
        height: 150,
        image: this.loadImage(mars),
      })
    );
  }

  createVector(x: number, y: number) {
    return new Vector(x, y);
  }

  createPlayer(): Player {
    const image = this.loadImage(playerImage);
    const player = new Player({
      position: this.createVector(this.width / 2, this.height / 2),
      image,
      width: 50,
      height: 50,
    });
    return player;
  }

  drawStars() {
    this.push();
    this.background('black');
    this.stroke('white');
    this.strokeWeight(5);
    const gridSize = 25;
    const noiseScale = 0.1;
    const startX = Math.floor(this.cameraPos.x / gridSize) * gridSize;
    const endX = this.cameraPos.x + this.width;

    const startY = Math.floor(this.cameraPos.y / gridSize) * gridSize;
    const endY = this.cameraPos.y + this.height;

    for (let worldX = startX; worldX < endX; worldX += gridSize) {
      for (let worldY = startY; worldY < endY; worldY += gridSize) {
        let n = this.noise(worldX * noiseScale, worldY * noiseScale);
        if (n > 0.75) {
          this.strokeWeight(4);
          this.point(worldX, worldY);
        }
      }
    }

    // we should be drawing the stars on the screen based on perlin noise instead?
    // for (let star of this.stars) {
    //   const val = Math.random();
    //   if (val > 0.9) {
    //     this.strokeWeight(3);
    //   } else if (val > 0.7) {
    //     this.strokeWeight(1);
    //   } else {
    //     this.strokeWeight(2);
    //   }
    //   this.point(star);
    // }
    this.pop();
  }

  drawEntities() {
    for (const entity of this.entities) {
      entity.update();
      if (!entity.inView(this.cameraPos)) return;
      if (entity.type === 'asteroid') {
        // TODO: If asteroid is out of bounds a certain amount, remove it from the game
      }
      this.push();
      entity.draw(this);
      this.pop();
    }
  }

  drawCamera() {
    this.cameraPos.set(
      this.player.position.x - this.width / 2,
      this.player.position.y - this.height / 2
    );
    this.translate(-this.cameraPos.x, -this.cameraPos.y);

    // this.push()
    this.stroke('white');
  }

  drawPlayer() {
    this.push();
    this.player.draw(this);
    this.pop();
  }

  mouseClickFn() {
    if (this.mouseIsPressed) {
      // base it off the center of the camera
      // treat the mouse vector like it's in relation to camera position
      // const mouseVector = this.createVector(this.pmouseX, this.pmouseY);
      const mouseVector = this.createVector(this.mouseX, this.mouseY);
      mouseVector.add(this.cameraPos);
      // console.log(`MouseVector: ${mouseVector.toString()}`);
      // console.log(`Player: ${this.player.position.toString()}`);
      // console.log(`Camera: ${this.cameraPos.toString()}`);

      const copyPlayerPos = this.player?.position.copy();
      const force = mouseVector.sub(copyPlayerPos!);
      const angle = force.heading();

      const maxAccel = 1;
      force.setMag(0.001);
      force.limit(maxAccel);
      this.player?.acceleration.add(force);
      this.player!.rotation = angle;
    } else {
      this.player?.acceleration.mult(0);
    }
  }

  offScreenPosition() {
    return {
      top: {
        xStart: this.cameraPos.x,
        xEnd: this.cameraPos.x + this.width,
        yStart: this.cameraPos.y - this.height / 2,
        yEnd: this.cameraPos.y,
      },
      right: {
        xStart: this.cameraPos.x + this.width,
        xEnd: this.cameraPos.x + this.width + this.width / 2,
        yStart: this.cameraPos.y,
        yEnd: this.cameraPos.y + this.height,
      },
      bottom: {
        xStart: this.cameraPos.x,
        xEnd: this.cameraPos.x + this.width,
        yStart: this.cameraPos.y + this.height,
        yEnd: this.cameraPos.y + this.height + this.height / 2,
      },
      left: {
        xStart: this.cameraPos.x - this.width / 2,
        xEnd: this.cameraPos.x,
        yStart: this.cameraPos.y,
        yEnd: this.cameraPos.y + this.height,
      },
    };
  }

  debugView() {
    const offScreenRegions = this.offScreenPosition();

    // draw spawn regions
    this.push();
    this.fill('red');
    this.stroke('red');
    this.strokeWeight(10);
    this.rect(
      offScreenRegions.top.xStart,
      offScreenRegions.top.yStart,
      offScreenRegions.top.xEnd - offScreenRegions.top.xStart,
      offScreenRegions.top.yEnd - offScreenRegions.top.yStart
    );
    this.rect(
      offScreenRegions.right.xStart,
      offScreenRegions.right.yStart,
      offScreenRegions.right.xEnd - offScreenRegions.right.xStart,
      offScreenRegions.right.yEnd - offScreenRegions.right.yStart
    );
    this.rect(
      offScreenRegions.bottom.xStart,
      offScreenRegions.bottom.yStart,
      offScreenRegions.bottom.xEnd - offScreenRegions.bottom.xStart,
      offScreenRegions.bottom.yEnd - offScreenRegions.bottom.yStart
    );
    this.rect(
      offScreenRegions.left.xStart,
      offScreenRegions.left.yStart,
      offScreenRegions.left.xEnd - offScreenRegions.left.xStart,
      offScreenRegions.left.yEnd - offScreenRegions.left.yStart
    );
    this.pop();

    // draw coordinates, entity count
    this.push();
    this.stroke('white');
    const padding = 20;
    this.text(
      `coordinates: ${this.player.position.x.toFixed(0)},${this.player.position.y.toFixed(
        0
      )}`,
      this.cameraPos.x + padding,
      this.cameraPos.y + padding
    );
    this.text(
      `Entity count: ${this.entities.length}`,
      this.cameraPos.x + padding,
      this.cameraPos.y + padding * 2
    );
    this.pop();
  }

  spawnAsteroids() {
    if (Math.random() > 0.99) {
      const images = [ast1, ast2, ast3];

      const image = this.loadImage(images[Math.floor(Math.random() * 3)]);

      const offScreenRegions = this.offScreenPosition();
      const randomSide = Object.keys(offScreenRegions)[Math.floor(Math.random() * 4)];
      // @ts-ignore
      const side = offScreenRegions[randomSide];
      const posX = this.random(side.xStart, side.xEnd); // random doesn't work lke i thought
      const posY = this.random(side.yStart, side.yEnd);

      const width = this.random(25, 75);
      const height = this.random(25, 75);
      const position = this.createVector(posX, posY);

      const asteroid = new Asteroid({
        position,
        width,
        height,
        image,
      });
      this.entities.push(asteroid);
    }
  }

  setupFn() {
    this.pixelDensity(window.devicePixelRatio);
    this.frameRate(60);
    this.mouseClickFn();
    this.touchStarted = () => {};
    this.touchMoved = () => {};
    this.touchEnded = () => {};
    this.cursor(this.CROSS);
  }

  // for now should we have a set map for our game?
  // maybe a bounds of 10,000 pixels?

  // this way we could create a quad tree in our game to check collisions?

  drawFn() {
    this.drawCamera();
    this.spawnAsteroids();
    this.drawStars();
    this.drawEntities();
    this.debugView();
    this.drawPlayer();
    this.mouseClickFn();
  }
}
