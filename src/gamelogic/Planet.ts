import type { Q5 } from 'q5xts';
import { Entity, type EntityProps } from './Entity';

export class Planet extends Entity {
  rotation: number;
  constructor(props: EntityProps) {
    super({ ...props, type: 'planet' });
    this.rotation = 0;
  }

  draw(sketch: Q5) {
    sketch.push();
    sketch.translate(this.position.x, this.position.y);
    sketch.rotate(this.rotation);
    super.draw(sketch);
    this.rotation += 0.001;
    sketch.pop();
  }
}
