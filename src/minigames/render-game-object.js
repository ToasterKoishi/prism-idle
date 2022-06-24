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
    return (
      <img
        src={this.state.sprite}
        style={{
          position: "absolute",
          left: this.props.position.x - this.state.spriteWidth / 2.0 + "px",
          top: this.props.position.y - this.state.spriteHeight / 2.0 + "px",
          width: this.state.spriteWidth,
          height: this.state.spriteHeight
        }} />
    );
  }
}