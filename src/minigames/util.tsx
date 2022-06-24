// Vector factories
export function vec2(x: number = 0.0, y: number = 0.0) {
  return new Vec2(x, y);
}

export class Vec2 {
  x: number = 0.0;
  y: number = 0.0;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  set = (other: Vec2) => {
    this.x = other.x;
    this.y = other.y;
  }
  plus = (other: Vec2) => {
    return vec2(this.x + other.x, this.y + other.y);
  }
  plusEquals = (other: Vec2) => {
    this.x += other.x;
    this.y += other.y;
  }
  minus = (other: Vec2) => {
    return vec2(this.x - other.x, this.y - other.y);
  }
  times = (other: number) => {
    return vec2(this.x * other, this.y * other);
  }
  div = (other: number) => {
    return vec2(this.x / other, this.y / other);
  }
  mag = () => {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  unit = () => {
    return this.div(this.mag());
  }
  toString = () => {
    return "(" + this.x.toString() + "," + this.y.toString() + ")";
  }
}

// UUID
let next_uuid: number = 0;
export const generateUUID = () => next_uuid++;