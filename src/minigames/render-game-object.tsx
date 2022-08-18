import React from "react";
import { generateUUID, vec2, Vec2 } from "../util";

interface RenderGameObjectProps {
  position: Vec2,
  sprite: string,
  spriteWidth: number,
  spriteHeight: number,
  innerStyle?: React.CSSProperties,
  outerStyle?: React.CSSProperties,
};

export class RenderGameObject extends React.Component {
  props: RenderGameObjectProps;
  constructor(props) {
    super(props);
  }

  render() {
    const outerBaseStyle: React.CSSProperties = {
      position: "absolute",
      left: this.props.position.x - this.props.spriteWidth / 2.0 + "px",
      top: this.props.position.y - this.props.spriteHeight / 2.0 + "px",
      animationFillMode: "forwards",
      pointerEvents: "none"
    };
    const outerInheritedStyle = this.props.outerStyle;
    const innerBaseStyle: React.CSSProperties = {
      width: this.props.spriteWidth,
      height: this.props.spriteHeight,
      animationFillMode: "forwards"
    };
    const innerInheritedStyle = this.props.innerStyle;
    return (
      <div style={{ ...outerBaseStyle, ...outerInheritedStyle }}>
        <img
          src={this.props.sprite}
          style={{ ...innerBaseStyle, ...innerInheritedStyle }}
        />
      </div>
    );
  }
}

export class LogicFloatingNumber {
  id: number = generateUUID();
  lifetime: number = 1.0;
  renderObject: React.ReactElement<RenderFloatingNumber>;
  constructor(position: Vec2, text: string, textStyle: string, direction: string = "up") {
    this.renderObject =
      <RenderFloatingNumber
        key={this.id}
        position={vec2(Math.round(position.x), Math.round(position.y))}
        text={text}
        textStyle={textStyle}
        direction={direction}
      />
  }
  gameTick = (time: number) => {
    this.lifetime -= time;
  }
}

export class RenderFloatingNumber extends React.Component {
  props: {
    position: Vec2,
    text: string,
    textStyle: string,
    direction: string,
  };
  render() {
    return (
      <div className="floating-number-outer" style={{
        left: `${this.props.position.x - 100}px`,
        top: `${this.props.position.y - 10}px`,
        animation: `floating-number-${this.props.direction} 1s forwards`,
      }}>
        <p className={this.props.textStyle}><b>{this.props.text}</b></p>
      </div>
    )
  }
}