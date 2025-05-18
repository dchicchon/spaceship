// an entity has bounds
// an entity can be blocking or can go through?
// an entity can be drawn with items?
// an entity corresponds with
import type { Q5, Vector } from 'q5xts';

export interface EntityProps {
  type?: string;
  width: number;
  height: number;
  image: any;
  position: Vector;
}

// there should be a draw function on every entity
export class Entity {
  // should there be separate
  // drawing bounds and
  // intersect bounds?
  type?: string;
  position: Vector;
  height: number;
  width: number;
  image: any;
  constructor(props: EntityProps) {
    this.position = props.position;
    this.height = props.height;
    this.width = props.width;
    this.image = props.image;
    if (props.type) {
      this.type = props.type;
    }
  }

  draw(sketch: Q5) {
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

  inView(cameraPos: Vector) {
    // check the position and dimensions of the current entity.
    // check the position and dimensions of the camera
    // if entity view of camera, return true
    return true;
  }
}
