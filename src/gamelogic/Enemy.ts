import { type Q5, Vector } from 'q5xts';
import { Entity, type EntityProps } from './Entity';

export class Enemy extends Entity {
  maxSpeed: number;
  velocity: Vector;
  constructor(props: EntityProps) {
    super(props);
    this.collisionPadding = 5;
    this.maxSpeed = 2;
    this.initialRotation = -(Math.PI * 3) / 2;
    this.velocity = new Vector(0, 0);
  }

  update() {
    this.position.add(this.velocity);
  }

  targetPlayer(playerPos: Vector) {
    const copyPos = playerPos.copy();
    // instead of setting we should update?
    const desiredVel = copyPos.sub(this.position).normalize().mult(this.maxSpeed);
    desiredVel.sub(this.velocity);
    const maxForce = 0.05;
    desiredVel.limit(maxForce);
    this.velocity.add(desiredVel);
  }

  draw(sketch: Q5) {
    sketch.push();
    sketch.translate(this.position.x, this.position.y);
    // lets rotate?
    this.rotation = Math.atan2(this.velocity.y, this.velocity.x);
    sketch.rotate(this.initialRotation + this.rotation);
    super.draw(sketch);
    sketch.pop();
  }
}
