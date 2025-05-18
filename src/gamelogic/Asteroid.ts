import { Vector, type Q5 } from 'q5xts';
import { Entity, type EntityProps } from './Entity';

export class Asteroid extends Entity {
  velocity: Vector;
  rotation: number;

  constructor(props: EntityProps) {
    super({ ...props, type: 'asteroid' });

    const xVel = Math.random() > 0.5 ? Math.random() * 2 : Math.random() * 2 * -1;
    const yVel = Math.random() > 0.5 ? Math.random() * 2 : Math.random() * 2 * -1;
    this.velocity = new Vector(xVel, yVel);
    this.rotation = 0;
  }

  update() {
    // logic
    this.position.add(this.velocity);
  }

  draw(sketch: Q5) {
    // drawing
    sketch.translate(this.position.x, this.position.y);
    sketch.rotate(this.rotation);
    super.draw(sketch);
    this.rotation += Math.random() * 0.01;
  }
}
