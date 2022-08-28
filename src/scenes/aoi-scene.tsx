import React from "react";
import { T1Area, T2Area } from "../components/basic-components";
import { GameState } from "../logic/game-state";
import { AoiMinigameArea } from "../minigames/aoi-minigame";

export class AoiScene extends React.Component {
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
    const aoiT1Currencies = [
      "aoi.airFryer",
      "aoi.airFryer1",
      "aoi.airFryer2",
      "aoi.wcbonalds",
      "aoi.wcbonalds1",
      "aoi.compressedNuggies1",
      "aoi.compressedNuggies2",
      "aoi.compressedNuggies3",
      "aoi.smellWafter",
      "aoi.nuggieFlavorTechnique",
      "aoi.nuggieMagnet",
      "aoi.nuggieDog1",
      "aoi.nuggieDog2",
      "aoi.nuggieDog",
      "aoi.motivationResearch",
      "aoi.t2Unlock",
    ];

    const aoiT2Currencies = [
      "aoi.heckieGenerator1",
      "aoi.heckieGenerator2",
      "aoi.heckieGenerator3",
    ];

    const aoiT2Skills = [
      "aoi.hiGuys",
      "aoi.konkonmori",
      "aoi.aoiStreamDelay",
      "aoi.aoiStreamDelay2",
      //"aoi.aoiStreamDelay3",
      "aoi.aoiBackseating",
      "aoi.aoiKaraoke",
      "aoi.aoiBullying",
      "aoi.aoiRhythmGames",
      "aoi.aoiMunchies",
      "aoi.aoiMunchies2",
      "aoi.aoiMunchies3",
      "aoi.aoiT3Unlock",
    ];

    return (
      <div className="character-area-full-container">
        <AoiMinigameArea gameState={this.props.gameState} hooks={this.props.hooks} />

        <div className="shop-area">
          <T1Area
            gameState={this.props.gameState}
            characterId="aoi"
            currencyId="aoi.nuggie"
            upgradesToShow={aoiT1Currencies} />

          <div className="shop-divider" />

          <T2Area
            gameState={this.props.gameState}
            characterId="aoi"
            currencyId="aoi.heckie"
            generatorId="aoi.heckie"
            upgradesToShowTop={aoiT2Currencies}
            upgradesToShowBottom={aoiT2Skills} />
        </div>
      </div>
    );
  }
}