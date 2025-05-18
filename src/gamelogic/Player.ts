import type { Q5 } from 'q5xts';
import { Vector } from 'q5xts';
import { Entity, type EntityProps } from './Entity';

// i already know the player props so I can pass it in here?

export class Player extends Entity {
  velocity: Vector;
  acceleration: Vector;
  maxSpeed: number;
  rotation: number;
  initialRotation: number;
  constructor(props: EntityProps) {
    super({ ...props, type: 'player' });
    this.velocity = new Vector(0, 0);
    this.acceleration = new Vector(0, 0);
    this.maxSpeed = 5;
    this.rotation = 0;
    this.initialRotation = -(Math.PI * 3) / 2;
  }

  draw(sketch: Q5) {
    // we should be rotating player towards mouse?
    sketch.translate(this.position.x, this.position.y);
    sketch.rotate(this.initialRotation + this.rotation);
    super.draw(sketch);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
  }
}
