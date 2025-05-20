// an entity has bounds
// an entity can be blocking or can go through?
// an entity can be drawn with items?
// an entity corresponds with
import { Vector, type Q5 } from 'q5xts';

export interface EntityProps {
  type?: string;
  width?: number;
  height?: number;
  image: any;
  position: Vector;
  collisionPadding?: number;
  velocity?: Vector;
}

// there should be a draw function on every entity
export class Entity {
  // should there be separate
  // drawing bounds and
  // intersect bounds?
  initialRotation: number;
  position: Vector;
  height: number;
  width: number;
  rotation: number;
  image: any;
  collisionPadding: number;
  velocity: Vector;

  constructor(props: EntityProps) {
    this.rotation = 0;
    this.initialRotation = 0;
    this.velocity = props.velocity || new Vector();
    this.collisionPadding = props.collisionPadding || 0;
    this.position = props.position;
    this.height = props.height || 0;
    this.width = props.width || 0;
    this.image = props.image;
  }

  draw(sketch: Q5) {
    // we could always translate here and rotate? idk
    // sketch.translate(this.position.x, this.position.y);
    sketch.image(
      this.image,
      0 - this.width / 2,
      0 - this.height / 2,
      this.width,
      this.height
    );
  }

  // every entity should have this?
  update() {
    // console.log('empty update fn');
  }

  // this isn't actually correct?
  collisionBox() {
    return {
      left: this.position.x - this.width / 2 + this.collisionPadding,
      right: this.position.x + this.width / 2 - this.collisionPadding,
      top: this.position.y - this.height / 2 + this.collisionPadding,
      bottom: this.position.y + this.height / 2 - this.collisionPadding,
    };
  }
}
