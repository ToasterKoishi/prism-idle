import React from "react";

export class RenderGameObject extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sprite: props.sprite,
      spriteWidth: props.spriteWidth,
      spriteHeight: props.spriteHeight
    }
  }

  render() {
    const outerBaseStyle = {
      position: "absolute",
      left: this.props.position.x - this.state.spriteWidth / 2.0 + "px",
      top: this.props.position.y - this.state.spriteHeight / 2.0 + "px",
      animationFillMode: "forwards",
      pointerEvents: "none"
    };
    const outerInheritedStyle = this.props.outerStyle;
    const innerBaseStyle = {
      width: this.state.spriteWidth,
      height: this.state.spriteHeight,
      animationFillMode: "forwards"
    };
    const innerInheritedStyle = this.props.innerStyle;
    return (
      <div style={{ ...outerBaseStyle, ...outerInheritedStyle }}>
        <img
          src={this.state.sprite}
          style={{ ...innerBaseStyle, ...innerInheritedStyle }}
        />
      </div>
    );
  }
}