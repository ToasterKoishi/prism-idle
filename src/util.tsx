export const degToRad = (deg: number) => Math.PI * deg / 180.0;
export const radToDeg = (rad: number) => rad / Math.PI * 180.0;


export const costFuncEx = (a: number, b: number, x: bigint | number, c: number, k: number | bigint = 0n) => {
  /**
   f(x) = a * b ^ (x / c) + k
   */
  return BigInt(Math.floor(a * Math.pow(b, Number(x) / c))) + BigInt(k);
}

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
  isZero = () => {
    return this.x === 0 && this.y === 0;
  }
  toString = () => {
    return "(" + this.x.toString() + "," + this.y.toString() + ")";
  }

  static unit = (angle: number) => {
    return vec2(Math.cos(angle), Math.sin(angle));
  }
  static randomUnit = () => {
    const angle = Math.random() * Math.PI * 2.0;
    return vec2(Math.cos(angle), Math.sin(angle));
  }
}

// UUID
let next_uuid: number = 0;
export const generateUUID = () => next_uuid++;