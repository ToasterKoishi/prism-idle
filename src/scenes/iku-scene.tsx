import { t } from "i18next";
import React from "react";
import { ConverterToggle, HideableArea } from "../components/basic-components";
import { ShopAreaComponent } from "../components/shop-area-component";
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
          <HideableArea
            openRef={this.props.gameState.liveState.ikuScene.t1Open}
            beforeButtonElement={(
              <span><b>{t("character.iku.nameFull")}</b> Tier I Upgrades&nbsp;</span>
            )}
            alwaysShownElement={(
              <div style={{ textAlign: "center", margin: "16px auto" }}>
                <b>Ikumin</b>: {this.props.gameState.getCurrency("iku.ikumin").getCurrentAmountShort()}
              </div>
            )}
            openOnlyElement={(
              <ShopAreaComponent gameState={this.props.gameState} currencyIdsToShow={ikuT1Currencies} />
            )}
          />

          <div className="shop-divider" />

          {this.props.gameState.getCurrency("iku.furifuri").getIsRevealed() ? (
            <div>
              <HideableArea
                openRef={this.props.gameState.liveState.ikuScene.t2Open}
                beforeButtonElement={(
                  <span><b>{t("character.iku.nameFull")}</b> Tier II Upgrades&nbsp;</span>
                )}
                alwaysShownElement={(
                  <ConverterToggle gameState={this.props.gameState} generatorId="iku.furifuri" />
                )}
                openOnlyElement={(
                  <div>
                    <ShopAreaComponent gameState={this.props.gameState} currencyIdsToShow={ikuT2Currencies} />
                    <ShopAreaComponent gameState={this.props.gameState} currencyIdsToShow={ikuT2Skills} />
                  </div>
                )}
              />

              <div className="shop-divider" />
            </div>
          ) : null}

        </div>
      </div>
    );
  }
}