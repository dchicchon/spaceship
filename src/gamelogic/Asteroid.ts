import { Vector, type Q5 } from 'q5xts';
import { Entity, type EntityProps } from './Entity';

// there should be a value that affects all instances of the class
export class Asteroid extends Entity {
  velocity: Vector;
  maxSpeed: number;
  constructor(props: EntityProps) {

    super(props);
    this.maxSpeed = 1;
    const xVel =
      Math.random() > 0.5
        ? Math.random() * this.maxSpeed
        : Math.random() * this.maxSpeed * -1;
    const yVel =
      Math.random() > 0.5
        ? Math.random() * this.maxSpeed
        : Math.random() * this.maxSpeed * -1;
    this.velocity = new Vector(xVel, yVel);
    this.rotation = 0;
    this.collisionPadding = 15;
  }

  update() {
    this.position.add(this.velocity);
  }

  draw(sketch: Q5) {
    sketch.push();
    sketch.translate(this.position.x, this.position.y);
    sketch.rotate(this.rotation);
    super.draw(sketch);
    this.rotation += Math.random() * 0.01;
    sketch.pop();
    // this.drawDebug(sketch);
  }

  drawDebug(sketch: Q5) {
    // draw box
    sketch.stroke('red');
    sketch.rect(
      this.position.x - this.width / 2,
      this.position.y - this.height / 2,
      this.width,
      this.height
    );
    // collision box
    const collision = this.collisionBox();
    sketch.stroke('white');
    sketch.rect(
      collision.left,
      collision.top,
      collision.right - collision.left,
      collision.bottom - collision.top
    );
  }
}
