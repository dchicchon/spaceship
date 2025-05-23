import { Q5, Vector } from 'q5xts';
import type { Entity } from './Entity';
import earth from '../assets/earth.png';
// import mars from '../assets/mars.png';
import playerImage from '../assets/ship1.png';
import enemyImage from '../assets/pirate.png';
import ast1 from '../assets/ast1.png';
import ast2 from '../assets/ast2.png';
import ast3 from '../assets/ast3.png';
import { Planet } from './Planet';
import { Player } from './Player';
import { Asteroid } from './Asteroid';
import { Enemy } from './Enemy';

// TODO: Create Game Map
// TODO: shift scale of game depending on size of screen
// TODO: Create start screen and game over screen

interface GameImages {
  enemy: {
    default: any;
    random?: Array<any>;
  };
  player: {
    default: any;
  };
  asteroid: {
    default: any;
  };
}

const mobileWidth = 400;

export class Game extends Q5 {
  // game logic
  distance: number;
  mode: number;

  // asteroids
  asteroidSpawnChance: number;
  asteroids: Array<Asteroid>;
  maxAsteroids: number;
  asteroidDeleteQueue: Array<number>;
  asteroidCount: number;

  // enemies
  enemies: Array<Enemy>;
  enemySpawnChance: number;
  maxEnemies: number;
  enemyCount: number;
  enemyDeleteQueue: Array<number>;

  // player
  player: Player;

  // planets
  planets: Array<Planet>;
  viewScale: number;

  // drawing
  cameraPos: Vector;
  deleteCount: number;
  images: GameImages;
  asteroidImages: Array<any>;

  startScreen: HTMLElement;
  gameOverScreen: HTMLElement;

  constructor(parentElm: HTMLElement) {
    super('', parentElm);
    this.mode = 0;

    if (this.width < mobileWidth) {
      this.viewScale = 0.75;
    } else {
      this.viewScale = 1;
    }
    console.log(this.viewScale);
    this.setup = this.setupFn;
    this.draw = this.drawFn;
    this.noiseSeed(1);
    this.deleteCount = 0;

    // figure out the width and height
    // game logic
    this.distance = 0;

    // asteroids
    this.asteroidSpawnChance = 0.1; // % chance each frame
    this.maxAsteroids = 50;
    this.asteroidCount = 0;
    this.asteroids = [];
    this.asteroidDeleteQueue = [];

    // enemies
    this.enemySpawnChance = 0.1;
    // this.enemySpawnChance = 0.01;
    this.maxEnemies = 5;
    this.enemyCount = 0;
    this.enemies = [];
    this.enemyDeleteQueue = [];

    this.planets = [];
    // maybe we could load all the images instead?
    this.images = {
      enemy: {
        default: this.loadImage(enemyImage),
      },
      player: {
        default: this.loadImage(playerImage),
      },
      asteroid: {
        default: [],
      },
    };
    this.asteroidImages = [];
    this.asteroidImages.push(
      this.loadImage(ast1),
      this.loadImage(ast2),
      this.loadImage(ast3)
    );
    this.createPlanets();
    this.player = this.createPlayer();
    this.cameraPos = this.createVector(
      this.player.position.x - this.width / 2,
      this.player.position.y - this.height / 2
    );

    this.startScreen = this.createStartScreen();
    this.gameOverScreen = this.createGameOverScreen();
  }

  createPlanets() {
    this.planets.push(
      new Planet({
        position: this.createVector(this.width / 2, this.height - this.height / 4),
        width: 150 * this.viewScale,
        height: 150 * this.viewScale,
        image: this.loadImage(earth),
      })
    );
    // this.planets.push(
    //   new Planet({
    //     position: this.createVector(this.width - 100, this.height - 100),
    //     width: 150,
    //     height: 150,
    //     image: this.loadImage(mars),
    //   })
    // );
  }

  createVector(x: number, y: number) {
    return new Vector(x, y);
  }

  createPlayer(): Player {
    // const image = this.loadImage(playerImage);
    const player = new Player({
      position: this.createVector(this.width / 2, this.height / 2),
      image: this.images.player.default,
      width: 50 * this.viewScale,
      height: 50 * this.viewScale,
    });
    return player;
  }

  drawStars() {
    this.push();
    this.stroke('white');
    this.strokeWeight(5);
    const gridSize = 25;
    const noiseScale = 0.2;
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

  drawUI() {
    const uiPad = 50;
    this.push();
    this.stroke('white');
    this.fill('white');
    this.textSize(25);
    this.text(
      Math.floor(this.distance / 10).toString(),
      this.width / 2 - 20,
      this.cameraPos.y + uiPad
    );
    this.pop();
  }

  offScreenPosition() {
    // lets give ourselves some additional padding
    const offScreenPadding = 25;
    return {
      top: {
        xStart: this.cameraPos.x,
        xEnd: this.cameraPos.x + this.width,
        yStart: this.cameraPos.y - this.height / 2,
        yEnd: this.cameraPos.y - offScreenPadding,
      },
      right: {
        xStart: this.cameraPos.x + this.width + offScreenPadding,
        xEnd: this.cameraPos.x + this.width + this.width / 2,
        yStart: this.cameraPos.y,
        yEnd: this.cameraPos.y + this.height,
      },
      bottom: {
        xStart: this.cameraPos.x,
        xEnd: this.cameraPos.x + this.width,
        yStart: this.cameraPos.y + this.height + offScreenPadding,
        yEnd: this.cameraPos.y + this.height + this.height / 2,
      },
      left: {
        xStart: this.cameraPos.x - this.width / 2,
        xEnd: this.cameraPos.x - offScreenPadding,
        yStart: this.cameraPos.y,
        yEnd: this.cameraPos.y + this.height,
      },
    };
  }

  outsideBounds(position: Vector) {
    const offScreenRegions = this.offScreenPosition();
    return (
      position.x < offScreenRegions.left.xStart ||
      position.x > offScreenRegions.right.xEnd ||
      position.y < offScreenRegions.top.yStart ||
      position.y > offScreenRegions.bottom.yEnd
    );
  }

  detectCollision(entity: Entity, entity2: Entity) {
    const box1 = entity.collisionBox();
    const box2 = entity2.collisionBox();
    // still trying to figure this out?
    // each entity should have collision boxes?
    // this is kinda wrong? We need to get the central position of each entity
    // and figure it out somehow
    return (
      box1.left < box2.right &&
      box1.right > box2.left &&
      box1.top < box2.bottom &&
      box1.bottom > box2.top
    );
    // return (
    //   entity.position.x < entity2.position.x + entity2.width &&
    //   entity.position.x + entity.width > entity2.position.x &&
    //   entity.position.y < entity2.position.y + entity2.height &&
    //   entity.position.y + entity.height > entity2.position.y
    // );
  }

  resetGameLogic() {
    this.player = this.createPlayer();
    this.asteroids = [];
    this.asteroidDeleteQueue = [];
    this.enemies = [];
    this.enemyDeleteQueue = [];
    this.enemyCount = 0;
    this.distance = 0;
    this.cameraPos = this.createVector(
      this.player.position.x - this.width / 2,
      this.player.position.y - this.height / 2
    );
  }

  drawEntities() {
    this.drawPlanets();
    this.drawAsteroids();
    this.drawPlayer();
    this.drawEnemies();
  }

  drawPlanets() {
    for (let i = 0; i < this.planets.length; i++) {
      const entity = this.planets[i];
      if (this.outsideBounds(entity.position)) continue;
      entity.update();
      this.push();
      entity.draw(this);
      this.pop();
    }
  }

  collideEntities(entity1: Entity, entity2: Entity) {
    // reflect
    const dx = entity1.position.x - entity2.position.x;
    const dy = entity1.position.y - entity2.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const nx = dx / distance;
    const ny = dy / distance;

    const vx = entity1.velocity.x - entity2.velocity.x;
    const vy = entity1.velocity.y - entity2.velocity.y;

    const dot = vx * nx + vy * ny;

    // its because of this! silly goose
    if (dot > 0) return;

    // masses
    const impulse = (2 * dot) / (10 + 10);

    entity1.velocity.x -= impulse * 10 * nx;
    entity1.velocity.y -= impulse * 10 * ny;

    entity2.velocity.x += impulse * 10 * nx;
    entity2.velocity.y += impulse * 10 * ny;
  }

  // maybe we don't always have to run the full queue each time? who knows
  removeAsteroids() {
    this.deleteCount += this.asteroidDeleteQueue.length;
    if (this.asteroidDeleteQueue.length === 0) return;
    for (let i = 0; i < this.asteroidDeleteQueue.length; i++) {
      const index = this.asteroidDeleteQueue.pop()!;
      const tmp = this.asteroids[index];
      this.asteroids[index] = this.asteroids[this.asteroids.length - 1];
      this.asteroids[this.asteroids.length - 1] = tmp;
      this.asteroids.pop();
    }
  }

  removeEnemies() {
    this.deleteCount += this.enemyDeleteQueue.length;
    if (this.enemyDeleteQueue.length === 0) return;
    for (let i = 0; i < this.enemyDeleteQueue.length; i++) {
      const index = this.enemyDeleteQueue.pop()!;
      const tmp = this.enemies[index];
      this.enemies[index] = this.enemies[this.enemies.length - 1];
      this.enemies[this.enemies.length - 1] = tmp;
      this.enemies.pop();
    }
  }

  updateGameLogic() {
    // update distance score
    this.distance = Math.max(
      Math.floor(Math.abs(this.player.position.y - this.height / 2)),
      this.distance
    );

    this.enemyCount = Math.min(this.maxEnemies, Math.floor(this.distance / 1000) + 1);
    this.asteroidCount = Math.min(
      this.maxAsteroids,
      5 * Math.floor(this.distance / 1000) + 5
    );
  }

  drawCamera() {
    this.cameraPos.set(0, this.player.position.y - this.height / 2);
    this.translate(0, this.cameraPos.y * -1);
  }

  drawPlayer() {
    this.push();
    if (this.player.position.x < 0) {
      this.player.position.x = this.width;
    } else if (this.player.position.x > this.width) {
      this.player.position.x = 0;
    }

    this.player.update();
    this.player.draw(this);

    // check collisions
    for (let i = 0; i < this.asteroids.length; i++) {
      const asteroid = this.asteroids[i];
      if (!this.detectCollision(this.player, asteroid)) continue;
      this.collideEntities(this.player, asteroid);
      const gameOver = this.player.takeDamage();
      if (gameOver) {
        this.mode = 1;
        document.body.appendChild(this.gameOverScreen);
      }
    }

    // check enemies
    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      if (!this.detectCollision(this.player, enemy)) continue;
      this.collideEntities(this.player, enemy);
      const gameOver = this.player.takeDamage();
      if (gameOver) {
        this.mode = 1;
        document.body.appendChild(this.gameOverScreen);
      }
    }

    this.pop();
  }

  drawAsteroids() {
    for (let i = 0; i < this.asteroids.length; i++) {
      const asteroid = this.asteroids[i];
      if (this.outsideBounds(asteroid.position)) {
        this.asteroidDeleteQueue.push(i);
        continue;
      }
      for (let j = 0; j < this.asteroids.length; j++) {
        if (i === j) continue;
        // dont let collide with self?
        const targetAsteroid = this.asteroids[j];
        if (!this.detectCollision(asteroid, targetAsteroid)) continue;
        this.collideEntities(asteroid, targetAsteroid);
      }
      asteroid.update();
      asteroid.draw(this);
    }
  }

  drawEnemies() {
    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      if (this.outsideBounds(enemy.position)) {
        this.enemyDeleteQueue.push(i);
        continue;
      }
      enemy.targetPlayer(this.player.position);

      // check if they collide with asteroids
      for (let j = 0; j < this.asteroids.length; j++) {
        // if (i === j) continue;
        // dont let collide with self?
        const targetAsteroid = this.asteroids[j];
        if (!this.detectCollision(enemy, targetAsteroid)) continue;
        this.collideEntities(enemy, targetAsteroid);
        this.enemyDeleteQueue.push(i);
      }
      enemy.update();
      enemy.draw(this);
    }
  }

  mouseClickFn() {
    if (this.mouseIsPressed) {
      const mouseVector = this.createVector(this.mouseX, this.mouseY);
      mouseVector.add(this.cameraPos);
      mouseVector.sub(this.player.position);
      const angle = mouseVector.heading();

      const maxAccel = 1;
      mouseVector.setMag(0.002);
      mouseVector.limit(maxAccel);
      this.player.acceleration.add(mouseVector);
      this.player.rotation = angle;
    } else {
      this.player.acceleration.mult(0);
    }
  }

  debugView() {
    // const offScreenRegions = this.offScreenPosition();
    // draw spawn regions
    // this.push();
    // this.fill('red');
    // this.stroke('red');
    // this.strokeWeight(10);
    // this.rect(
    //   offScreenRegions.top.xStart,
    //   offScreenRegions.top.yStart,
    //   offScreenRegions.top.xEnd - offScreenRegions.top.xStart,
    //   offScreenRegions.top.yEnd - offScreenRegions.top.yStart
    // );
    // this.rect(
    //   offScreenRegions.right.xStart,
    //   offScreenRegions.right.yStart,
    //   offScreenRegions.right.xEnd - offScreenRegions.right.xStart,
    //   offScreenRegions.right.yEnd - offScreenRegions.right.yStart
    // );
    // this.rect(
    //   offScreenRegions.bottom.xStart,
    //   offScreenRegions.bottom.yStart,
    //   offScreenRegions.bottom.xEnd - offScreenRegions.bottom.xStart,
    //   offScreenRegions.bottom.yEnd - offScreenRegions.bottom.yStart
    // );
    // this.rect(
    //   offScreenRegions.left.xStart,
    //   offScreenRegions.left.yStart,
    //   offScreenRegions.left.xEnd - offScreenRegions.left.xStart,
    //   offScreenRegions.left.yEnd - offScreenRegions.left.yStart
    // );
    // this.pop();

    // draw coordinates, entity count
    this.push();
    this.stroke('white');
    const padding = 20;

    // technically it's coordinates are 0?
    this.text(
      `coordinates: ${this.player.position.x.toFixed(0)},${this.player.position.y.toFixed(
        0
      )}`,
      this.cameraPos.x + padding,
      this.cameraPos.y + padding
    );

    this.text(
      `Asteroid count: ${this.asteroids.length}`,
      this.cameraPos.x + padding,
      this.cameraPos.y + padding * 3
    );

    this.text(
      `Delete count: ${this.deleteCount}`,
      this.cameraPos.x + padding,
      this.cameraPos.y + padding * 4
    );
    this.text(
      `Enemy count: ${this.enemies.length}`,
      this.cameraPos.x + padding,
      this.cameraPos.y + padding * 5
    );
    this.pop();
  }

  spawnAsteroids() {
    if (this.asteroids.length + 1 > this.asteroidCount) return;
    if (1 - Math.random() <= this.asteroidSpawnChance) {
      const image = this.asteroidImages[Math.floor(Math.random() * 3)];
      const offScreenRegions = this.offScreenPosition();
      const randomSide = Object.keys(offScreenRegions)[Math.floor(Math.random() * 4)] as
        | 'top'
        | 'right'
        | 'left'
        | 'bottom';
      const side = offScreenRegions[randomSide];
      const posX = this.random(side.xStart, side.xEnd);
      const posY = this.random(side.yStart, side.yEnd);

      const position = this.createVector(posX, posY);
      const mass = Math.floor(Math.random() * 4) + 1;
      const size = mass * 25 * this.viewScale;
      const asteroid = new Asteroid({
        width: size,
        height: size,
        position,
        image,
      });
      this.asteroids.push(asteroid);
    }
  }

  spawnEnemy() {
    if (this.enemies.length + 1 > this.enemyCount) return;
    if (1 - Math.random() <= this.enemySpawnChance) {
      const offScreenRegions = this.offScreenPosition();
      const sides = [
        offScreenRegions.left,
        offScreenRegions.right,
        offScreenRegions.top,
        offScreenRegions.bottom,
      ];
      const side = sides[Math.floor(Math.random() * sides.length)];
      const posX = this.random(side.xStart, side.xEnd); // random doesn't work lke i thought
      const posY = this.random(side.yStart, side.yEnd);
      const position = this.createVector(posX, posY);
      const enemy = new Enemy({
        position,
        width: 50 * this.viewScale,
        height: 50 * this.viewScale,
        image: this.images.enemy.default,
      });
      this.enemies.push(enemy);
    }
  }

  updateEntities() {
    // whats the point of update in a separate method?
    // seems like a good idea to modularize to separate concerns?
    // but we end up looping through twice, do we want that? just think about it
    // updateAsteroids()
    // updatePlayer()?
  }

  removeEntities() {
    this.removeAsteroids();
    this.removeEnemies();
  }

  createStartScreen() {
    // create start screen and game over screen here
    const start = document.createElement('div');
    start.style.position = 'absolute';
    start.style.width = '100%';
    start.style.display = 'flex';
    start.style.justifyContent = 'center';
    start.style.fontFamily = 'monospace';

    const wrapper = document.createElement('div');
    wrapper.style.border = '1px solid white';
    wrapper.style.padding = '10px';
    wrapper.style.width = '50%';
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = 'center';
    start.appendChild(wrapper);

    const title = document.createElement('h2');
    title.innerHTML = 'SpaceShip';
    const button = document.createElement('button');
    button.innerHTML = 'Start';
    button.onclick = () => {
      document.body.removeChild(start);
      this.mode = 2;
    };
    wrapper.append(title);
    wrapper.append(button);
    return start;
  }

  createGameOverScreen() {
    // create start screen and game over screen here
    const gameOver = document.createElement('div');
    gameOver.style.position = 'absolute';
    gameOver.style.width = '100%';
    gameOver.style.display = 'flex';
    gameOver.style.justifyContent = 'center';
    gameOver.style.fontFamily = 'monospace';

    const wrapper = document.createElement('div');
    wrapper.style.border = '1px solid white';
    wrapper.style.padding = '10px';
    wrapper.style.width = '50%';
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = 'center';
    gameOver.appendChild(wrapper);

    const title = document.createElement('h2');
    title.innerHTML = 'Game Over';

    const button = document.createElement('button');
    button.innerHTML = 'Start Screen';
    button.onclick = () => {
      this.mode = 0;
      document.body.removeChild(gameOver);
      this.resetGameLogic();
      document.body.appendChild(this.startScreen);
    };
    wrapper.append(title);
    wrapper.append(button);
    return gameOver;
  }

  // to start game
  setupFn() {
    this.pixelDensity(window.devicePixelRatio);
    this.frameRate(60);
    this.textFont('monospace');
    this.touchStarted = () => {};
    this.touchMoved = () => {};
    this.touchEnded = () => {};
    this.cursor(this.CROSS);
    this.noFill();
    document.body.appendChild(this.startScreen);
  }

  // timer is now 60 frames per second
  drawFn() {
    this.background('black');
    this.drawCamera();
    this.drawStars();
    if (this.mode === 0) {
      // before this we would have added start screen
      this.drawPlanets();
      return;
    } else if (this.mode === 1) {
      this.drawEntities();
      this.drawUI();
      this.removeEntities();
      this.player.acceleration.mult(0);
      return;
    }

    // updates
    this.spawnAsteroids();
    this.spawnEnemy();
    this.updateGameLogic();
    this.mouseClickFn();

    // draw
    this.drawEntities();
    this.drawUI();
    this.removeEntities();
    // this.debugView();
  }
}
