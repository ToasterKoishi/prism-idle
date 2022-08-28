import React from "react";
import { T1Area, T2Area } from "../components/basic-components";
import { GameState } from "../logic/game-state";
import { MenoMinigameArea } from "../minigames/meno-minigame";

export class MenoScene extends React.Component {
  props: {
    gameState: GameState,
    hooks: { gameTick: ((_: number) => void)[] }
  };

  componentDidMount(): void {
    this.props.hooks.gameTick.push(this.gameTick);
  }

  componentWillUnmount(): void {
    this.props.hooks.gameTick.splice(this.props.hooks.gameTick.indexOf(this.gameTick), 1);
  }

  gameTick = (_: number) => {
    this.forceUpdate();
  }

  render() {
    const t1Currencies = [
      "meno.t2Unlock",
    ];

    const t2Currencies = [
    ];

    const t2Skills = [
    ];

    return (
      <div className="character-area-full-container">
        <MenoMinigameArea gameState={this.props.gameState} hooks={this.props.hooks} />

        <div className="shop-area">
          <T1Area
            gameState={this.props.gameState}
            characterId="meno"
            currencyId="meno.shiny"
            upgradesToShow={t1Currencies} />

          <div className="shop-divider" />

          <T2Area
            gameState={this.props.gameState}
            characterId="meno"
            currencyId="meno.ippui"
            generatorId="meno.ippui"
            upgradesToShowTop={t2Currencies}
            upgradesToShowBottom={t2Skills} />
        </div>
      </div>
    );
  }
}