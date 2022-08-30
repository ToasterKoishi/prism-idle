export const toTitleCase: (string: string) => string = (string: string) => {
  if (string.length === 0) {
    return string;
  }

  let retval = "";
  let insideTag = false;
  let currentWord = "";
  const capitalizeWord = (word: string) => word.length == 0 || word == "of" || word == "with" || word == "for" ? word : word[0].toUpperCase() + word.slice(1);
  for (let i = 0; i < string.length; i++) {
    const char = string[i];
    if (char === '[') {
      retval += capitalizeWord(currentWord);
      currentWord = "";
      insideTag = true;
      retval += char;
    } else if (char === ']') {
      insideTag = false;
      retval += char;
    } else {
      if (!insideTag) {
        if (char == ' ' || char == '(' || char == ')') {
          retval += capitalizeWord(currentWord) + char;
          currentWord = "";
        } else {
          currentWord += char;
        }
      } else {
        retval += char;
      }
    }
  }
  retval += capitalizeWord(currentWord);
  return retval;
}

export const degToRad = (deg: number) => Math.PI * deg / 180.0;
export const radToDeg = (rad: number) => rad / Math.PI * 180.0;

export const costFuncEx = (a: number, b: number, x: bigint | number, c: number, k: number | bigint = 0n) => {
  /**
   f(x) = a * b ^ (x / c) + k
   */
  return BigInt(Math.floor(a * Math.pow(b, Number(x) / c))) + BigInt(k);
}

// Vector factories
export function vec2(x: number | number[] = 0.0, y: number = null) {
  if (typeof x === "number") {
    if (y === null) {
      y = x;
    }
    return new Vec2(x, y);
  } else {
    return new Vec2(x[0], x[1]);
  }
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
  get = () => {
    return new Vec2(this.x, this.y);
  }
  isEqual: (_: Vec2) => boolean = (other: Vec2) => {
    return this.x === other.x && this.y === other.y;
  }
  plus = (other: Vec2) => {
    return new Vec2(this.x + other.x, this.y + other.y);
  }
  plusEquals = (other: Vec2) => {
    this.x += other.x;
    this.y += other.y;
  }
  minus = (other: Vec2) => {
    return new Vec2(this.x - other.x, this.y - other.y);
  }
  times = (other: number | Vec2) => {
    if (typeof other === "number") {
      return new Vec2(this.x * other, this.y * other);
    } else {
      return new Vec2(this.x * other.x, this.y * other.y);
    }
  }
  div = (other: number) => {
    return new Vec2(this.x / other, this.y / other);
  }
  mag = () => {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  unit = () => {
    return this.div(this.mag());
  }
  reverse = () => {
    return new Vec2(this.y, this.x);
  }
  isZero = () => {
    return this.x === 0 && this.y === 0;
  }
  toString = () => {
    return "(" + this.x.toString() + "," + this.y.toString() + ")";
  }

  static unit = (angle: number) => {
    return new Vec2(Math.cos(angle), Math.sin(angle));
  }
  static randomUnit = () => {
    const angle = Math.random() * Math.PI * 2.0;
    return new Vec2(Math.cos(angle), Math.sin(angle));
  }
}

// UUID
let next_uuid: number = 0;
export const generateUUID = () => next_uuid++;