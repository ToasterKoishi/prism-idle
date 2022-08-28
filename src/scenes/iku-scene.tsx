import React from "react";
import { T1Area, T2Area } from "../components/basic-components";
import { GameState } from "../logic/game-state";
import { IkuMinigameArea } from "../minigames/iku-minigame";

export class IkuScene extends React.Component {
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

  gameTick = () => {
    this.forceUpdate();
  }

  render() {
    const ikuT1Currencies = [
      "iku.fertileSoil",
      "iku.fertileSoil1",
      "iku.fertileSoil2",
      "iku.himeJuice",
      "iku.himeJuice2",
      "iku.wateringArea",
      "iku.wateringSprinkler",
      "iku.yeetingGroupHug",
      "iku.yeetingArea",
      "iku.ikuminVariety",
      "iku.ikuminBlue",
      "iku.ikuminVaporwave",
      "iku.ikuminSky",
      "iku.ikuminNeapolitan",
      "iku.ikuminRainbow",
      "iku.ikuminBlueBuff",
      "iku.ikuminVaporwaveBuff",
      "iku.sunscaper",
      "iku.ikuminNeapolitanBuff",
      "iku.ikuminRainbowBuff",
      "iku.gardeningRD",
      "iku.t2Unlock",
    ];

    const ikuT2Currencies = [
      "iku.furifuriGenerator1",
      "iku.furifuriGenerator2",
      "iku.furifuriGenerator3",
    ];

    const ikuT2Skills = [
      "iku.educationMulti1",
      "iku.furifuriBuff2",
      "iku.decree1",
      "iku.decree2",
      "iku.himeLove",
      "iku.ikuminEatWell",
      "iku.furifuriBuff1",
      "iku.himeLove1",
      "iku.t3Unlock",
    ];

    return (
      <div className="character-area-full-container">
        <IkuMinigameArea gameState={this.props.gameState} hooks={this.props.hooks} />

        <div className="shop-area">
          <T1Area
            gameState={this.props.gameState}
            characterId="iku"
            currencyId="iku.ikumin"
            upgradesToShow={ikuT1Currencies} />

          <div className="shop-divider" />

          <T2Area
            gameState={this.props.gameState}
            characterId="iku"
            currencyId="iku.furifuri"
            generatorId="iku.furifuri"
            upgradesToShowTop={ikuT2Currencies}
            upgradesToShowBottom={ikuT2Skills} />
        </div>
      </div>
    );
  }
}