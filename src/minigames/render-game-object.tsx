import React from "react";
import { Vec2 } from "./util";

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