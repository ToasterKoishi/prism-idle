import { t } from "i18next";
import React from "react";
import { ConverterToggle, HideableArea } from "../components/basic-components";
import { ShopAreaComponent } from "../components/shop-area-component";
import { COLOR_SCHEMES } from "../const";
import { GameState } from "../logic/game-state";
import { AoiMinigameArea } from "../minigames/aoi-minigame";

interface AoiSceneProps {
  gameState: GameState,
  hooks: { gameTick: ((_: number) => void)[] }
};

export class AoiScene extends React.Component {
  props: AoiSceneProps;

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
      "aoi.smellWafter",
      "aoi.nuggieFlavorTechnique",
      "aoi.nuggieMagnet",
      "aoi.nuggieDog1",
      "aoi.nuggieDog2",
      "aoi.nuggieDog",
      "aoi.motivationResearch",
      "aoi.aoiT2Unlock",
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
      <div style={{ fontFamily: "Verdana, Geneva, Tahoma, sans-serif", position: "relative", padding: "16px 0 500px", margin: "auto", minHeight: "100%", backgroundColor: COLOR_SCHEMES.aoi.backgroundColor }}>
        <AoiMinigameArea gameState={this.props.gameState} hooks={this.props.hooks} />

        <HideableArea
          beforeButtonElement={(
            <span><b>{t("character.aoi.nameFull")}</b> Tier I Upgrades&nbsp;</span>
          )}
          alwaysShownElement={(
            <div style={{ textAlign: "center", margin: "16px auto" }}>
              <b>Nuggies</b>: {this.props.gameState.getCurrency("aoi.nuggie").getCurrentAmountShort()}
            </div>
          )}
          openOnlyElement={(
            <ShopAreaComponent gameState={this.props.gameState} currencyIdsToShow={aoiT1Currencies} />
          )}
        />

        <div className="shop-divider" />

        {this.props.gameState.getCurrency("aoi.heckie").getIsRevealed() ? (
          <HideableArea
            beforeButtonElement={(
              <span><b>{t("character.aoi.nameFull")}</b> Tier II Upgrades&nbsp;</span>
            )}
            alwaysShownElement={(
              <ConverterToggle gameState={this.props.gameState} generatorId="aoi.heckie" />
            )}
            openOnlyElement={(
              <div>
                <ShopAreaComponent gameState={this.props.gameState} currencyIdsToShow={aoiT2Currencies} />
                <ShopAreaComponent gameState={this.props.gameState} currencyIdsToShow={aoiT2Skills} />
              </div>
            )}
          />
        ) : null}

        <div className="shop-divider" />
      </div>
    );
  }
}