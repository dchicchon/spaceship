import type { Q5 } from 'q5xts';
import { Color, Vector } from 'q5xts';
import { Entity, type EntityProps } from './Entity';

export class Player extends Entity {
  velocity: Vector;
  acceleration: Vector;
  maxSpeed: number;
  rotation: number;
  shields: number;
  shieldRechargeRate: number;
  accelerationRate: number;
  damageColor: Color;
  colorIncrease: number;

  constructor(props: EntityProps) {
    super(props);

    // physics
    this.velocity = new Vector(0, 0);
    this.acceleration = new Vector(0, 0);

    // drawing
    this.initialRotation = -(Math.PI * 3) / 2;
    this.rotation = -(Math.PI / 2);
    this.damageColor = new Color(255, 0, 0, 1);
    this.colorIncrease = 1;

    // gameplay related
    this.accelerationRate = 0;
    this.maxSpeed = 4;
    this.shields = 1;
    this.shieldRechargeRate = 0.002; // every frame charge by 5%
    this.collisionPadding = 10;
  }

  // should return back game over boolean?
  takeDamage() {
    if (this.shields < 1) return true;
    this.shields -= 1;
    return false;
  }

  update() {
    // how to indicate shield?
    if (this.shields < 1) {
      // maybe slowly draw shields over?
      this.shields += this.shieldRechargeRate;
    }
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
  }

  draw(sketch: Q5) {
    sketch.push();
    // we should be rotating player towards mouse?
    sketch.translate(this.position.x, this.position.y);
    // this.rotation = Math.atan2(this.velocity.y, this.velocity.x)
    sketch.rotate(this.initialRotation + this.rotation);
    super.draw(sketch);

    if (this.shields < 1) {
      // draw recharging shield
      sketch.strokeWeight(2);
      sketch.fill('transparent');
      sketch.stroke('cyan');
      sketch.arc(0, 0, 45, 45, 0, 6 * this.shields, sketch.OPEN);

      // damage blend
      if (this.damageColor._a > 0.9) {
        this.colorIncrease = -1;
      } else if (this.damageColor._a < 0.1) {
        this.colorIncrease = 1;
      }
      this.damageColor._a += 0.03 * this.colorIncrease;
      sketch.fill(this.damageColor);
      sketch.blendMode('color');
      sketch.circle(0, 0, 45);
    }
    // sketch.stroke('cyan');
    // sketch.fill('transparent');
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
