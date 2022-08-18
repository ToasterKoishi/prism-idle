import i18next, { t } from 'i18next';
import React from "react";
import { initReactI18next } from "react-i18next";
import "./app.css";
import { COLOR_SCHEMES, SORTED_CHARACTER_IDS } from './const';
import { default as i18nEN } from "./i18n/en.json";
import aoi from "./img/aoi.webp";
import iku from "./img/iku.webp";
import luto from "./img/luto.webp";
import meno from "./img/meno.webp";
import nia from "./img/nia.webp";
import pina from "./img/pina.webp";
import rita from "./img/rita.webp";
import shiki from "./img/shiki.webp";
import yura from "./img/yura.webp";
import { GameState } from "./logic/game-state";
import { AoiScene } from './scenes/aoi-scene';
import { IkuScene } from './scenes/iku-scene';

// Debug stuff
export const TOTER_DEBUG: boolean = false;
let secondsPassed: number = 0.0;
let timeStep: number = 1.0;

class App extends React.Component {
  state: {
    gameState: GameState
  }

  gameState: GameState = null;
  previousFrameTime: DOMHighResTimeStamp = -1;
  //gameTickId: NodeJS.Timer;
  selectedCharacter: string = TOTER_DEBUG ? "aoi" : "";
  showUnlockArea: boolean = false;
  hooks: { gameTick: ((_: number) => void)[] };

  ikuScene: React.ReactElement<IkuScene>;
  aoiScene: React.ReactElement<AoiScene>;

  constructor(props) {
    super(props);

    i18next
      .use(initReactI18next)
      .init({
        lng: 'en',
        debug: TOTER_DEBUG,
        resources: {
          en: {
            translation: i18nEN
          },
          jp: {
            translation: {}
          }
        }
      });
    this.gameState = new GameState();

    this.state = {
      gameState: this.gameState
    };

    this.hooks = {
      gameTick: []
    };

    this.ikuScene = (<IkuScene
      gameState={this.gameState}
      hooks={this.hooks}
    />);
    this.aoiScene = (<AoiScene
      gameState={this.gameState}
      hooks={this.hooks}
    />);

    // DEBUG STUFF
    if (TOTER_DEBUG) {
      const gameState = this.gameState;

      // Approximately 1:45 hr of playing
      gameState.getCurrency("aoi.nuggie").addAmount(6600000n);
      gameState.getCurrency("aoi.heckie").addAmount(1700000n);
      for (let i = 0; i < 30; i++) gameState.getCurrency("aoi.airFryer").tryPurchaseOne();
      for (let i = 0; i < 25; i++) gameState.getCurrency("aoi.airFryer1").tryPurchaseOne();
      for (let i = 0; i < 11; i++) gameState.getCurrency("aoi.airFryer2").tryPurchaseOne();
      for (let i = 0; i < 10; i++) gameState.getCurrency("aoi.wcbonalds").tryPurchaseOne();
      for (let i = 0; i < 6; i++) gameState.getCurrency("aoi.wcbonalds1").tryPurchaseOne();
      for (let i = 0; i < 14; i++) gameState.getCurrency("aoi.compressedNuggies1").tryPurchaseOne();
      for (let i = 0; i < 10; i++) gameState.getCurrency("aoi.compressedNuggies2").tryPurchaseOne();
      gameState.getCurrency("aoi.motivationResearch").tryPurchaseOne();
      for (let i = 0; i < 4; i++) gameState.getCurrency("aoi.smellWafter").tryPurchaseOne();
      gameState.getCurrency("aoi.nuggieDog").tryPurchaseOne();
      for (let i = 0; i < 6; i++) gameState.getCurrency("aoi.nuggieDog1").tryPurchaseOne();
      for (let i = 0; i < 6; i++) gameState.getCurrency("aoi.nuggieDog2").tryPurchaseOne();
      for (let i = 0; i < 8; i++) gameState.getCurrency("aoi.nuggieFlavorTechnique").tryPurchaseOne();
      for (let i = 0; i < 6; i++) gameState.getCurrency("aoi.nuggieMagnet").tryPurchaseOne();

      gameState.getCurrency("aoi.aoiT2Unlock").tryPurchaseOne();

      for (let i = 0; i < 20; i++) gameState.getCurrency("aoi.heckieGenerator1").tryPurchaseOne();
      for (let i = 0; i < 20; i++) gameState.getCurrency("aoi.heckieGenerator2").tryPurchaseOne();
      for (let i = 0; i < 20; i++) gameState.getCurrency("aoi.heckieGenerator3").tryPurchaseOne();
      for (let i = 0; i < 10; i++) gameState.getCurrency("aoi.hiGuys").tryPurchaseOne();
      for (let i = 0; i < 6; i++) gameState.getCurrency("aoi.konkonmori").tryPurchaseOne();
      for (let i = 0; i < 1; i++) gameState.getCurrency("aoi.aoiStreamDelay").tryPurchaseOne();
      for (let i = 0; i < 0; i++) gameState.getCurrency("aoi.aoiStreamDelay2").tryPurchaseOne();
      for (let i = 0; i < 10; i++) gameState.getCurrency("aoi.aoiBackseating").tryPurchaseOne();
      for (let i = 0; i < 4; i++) gameState.getCurrency("aoi.aoiKaraoke").tryPurchaseOne();
      for (let i = 0; i < 0; i++) gameState.getCurrency("aoi.aoiBullying").tryPurchaseOne();
      for (let i = 0; i < 0; i++) gameState.getCurrency("aoi.aoiRhythmGames").tryPurchaseOne();
      for (let i = 0; i < 8; i++) gameState.getCurrency("aoi.aoiMunchies").tryPurchaseOne();
      for (let i = 0; i < 2; i++) gameState.getCurrency("aoi.aoiMunchies2").tryPurchaseOne();
      for (let i = 0; i < 0; i++) gameState.getCurrency("aoi.aoiMunchies3").tryPurchaseOne();

      // Current max rate, about 2 hrs of playing
      // Max rate: 12232.50/s → 48930.00/s

      // Iku stuff

      // ~2 hours of play
      gameState.getCurrency("iku.ikumin").addAmount(750000n);
      gameState.getCurrency("iku.furifuri").addAmount(350000n);
      for (let i = 0; i < 1; i++) gameState.getCurrency("iku.gardeningRD").tryPurchaseOne();
      for (let i = 0; i < 9; i++) gameState.getCurrency("iku.fertileSoil").tryPurchaseOne();
      for (let i = 0; i < 6; i++) gameState.getCurrency("iku.fertileSoil1").tryPurchaseOne();
      for (let i = 0; i < 10; i++) gameState.getCurrency("iku.fertileSoil2").tryPurchaseOne();
      for (let i = 0; i < 15; i++) gameState.getCurrency("iku.himeJuice").tryPurchaseOne();
      for (let i = 0; i < 10; i++) gameState.getCurrency("iku.himeJuice2").tryPurchaseOne();
      for (let i = 0; i < 6; i++) gameState.getCurrency("iku.wateringArea").tryPurchaseOne();
      for (let i = 0; i < 6; i++) gameState.getCurrency("iku.wateringSprinkler").tryPurchaseOne();
      for (let i = 0; i < 1; i++) gameState.getCurrency("iku.yeetingGroupHug").tryPurchaseOne();
      for (let i = 0; i < 5; i++) gameState.getCurrency("iku.yeetingArea").tryPurchaseOne();
      for (let i = 0; i < 5; i++) gameState.getCurrency("iku.ikuminVariety").tryPurchaseOne();
      for (let i = 0; i < 10; i++) gameState.getCurrency("iku.ikuminBlue").tryPurchaseOne();
      for (let i = 0; i < 10; i++) gameState.getCurrency("iku.ikuminVaporwave").tryPurchaseOne();
      for (let i = 0; i < 10; i++) gameState.getCurrency("iku.ikuminSky").tryPurchaseOne();
      for (let i = 0; i < 10; i++) gameState.getCurrency("iku.ikuminNeapolitan").tryPurchaseOne();
      for (let i = 0; i < 10; i++) gameState.getCurrency("iku.ikuminRainbow").tryPurchaseOne();

      for (let i = 0; i < 5; i++) gameState.getCurrency("iku.ikuminBlueBuff").tryPurchaseOne();
      for (let i = 0; i < 1; i++) gameState.getCurrency("iku.ikuminVaporwaveBuff").tryPurchaseOne();
      for (let i = 0; i < 10; i++) gameState.getCurrency("iku.sunscaper",).tryPurchaseOne();
      for (let i = 0; i < 1; i++) gameState.getCurrency("iku.ikuminNeapolitanBuff").tryPurchaseOne();
      for (let i = 0; i < 1; i++) gameState.getCurrency("iku.t2Unlock").tryPurchaseOne();
      gameState.getCurrency("iku.t2Unlock").tryPurchaseOne();

      for (let i = 0; i < 20; i++) gameState.getCurrency("iku.furifuriGenerator1").tryPurchaseOne();
      for (let i = 0; i < 20; i++) gameState.getCurrency("iku.furifuriGenerator2").tryPurchaseOne();
      for (let i = 0; i < 20; i++) gameState.getCurrency("iku.furifuriGenerator3").tryPurchaseOne();
      for (let i = 0; i < 0; i++) gameState.getCurrency("iku.educationMulti1").tryPurchaseOne();
      for (let i = 0; i < 0; i++) gameState.getCurrency("iku.furifuriBuff2").tryPurchaseOne();
      for (let i = 0; i < 1; i++) gameState.getCurrency("iku.decree1").tryPurchaseOne();
      for (let i = 0; i < 1; i++) gameState.getCurrency("iku.decree2").tryPurchaseOne();
      for (let i = 0; i < 7; i++) gameState.getCurrency("iku.himeLove").tryPurchaseOne();
      for (let i = 0; i < 0; i++) gameState.getCurrency("iku.ikuminEatWell").tryPurchaseOne();
      for (let i = 0; i < 10; i++) gameState.getCurrency("iku.furifuriBuff1").tryPurchaseOne();
      for (let i = 0; i < 1; i++) gameState.getCurrency("iku.himeLove1").tryPurchaseOne();

      // Debug stuff
      gameState.getCurrency("aoi.heckie").addAmount(1000000n);
      gameState.getCurrency("iku.furifuri").addAmount(1000000n);
    }
  }

  componentDidMount() {
    //this.gameTickId = setInterval(() => this.gameTick(GAME_TICK_TIME / 1000.0), GAME_TICK_TIME);
    const f = (time: DOMHighResTimeStamp) => {
      if (this.previousFrameTime < 0) {
        this.previousFrameTime = time;
      } else if (time - this.previousFrameTime === 0) {
        // Do nothing
      } else {
        this.gameTick((time - this.previousFrameTime) / 1000);
        this.previousFrameTime = time;
      }
      requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  }

  componentWillUnmount() {
    //clearInterval(this.gameTickId);
  }

  gameTick = (time: number) => {
    if (TOTER_DEBUG) {
      time *= timeStep;
      secondsPassed += time;
    }

    if (!this.showUnlockArea && this.gameState.getNumCharacterUnlocks() > 0 && SORTED_CHARACTER_IDS.length - this.gameState.getCharactersUnlocked().length > 0) {
      this.showUnlockArea = true;
    }

    this.hooks.gameTick.forEach((gameTick) => gameTick(time));
    this.gameState.gameTick(time);

    // Tell ReactJS to render
    this.setState(state => {
      return state;
    });
    //this.forceUpdate();
  }

  render() {
    let currentAgentArea = null;
    switch (this.selectedCharacter) {
      case "iku":
        currentAgentArea = this.ikuScene;
        break;

      case "aoi":
        currentAgentArea = this.aoiScene;
        break;

      default:
        break;
    }

    const unlockedCharacters = SORTED_CHARACTER_IDS.filter((id) => this.gameState.getCharactersUnlocked().includes(id));
    const numRows = Math.ceil(unlockedCharacters.length / 4.0);
    const characterRows: string[][] = [];
    for (let i = 0; i < numRows; i++) {
      characterRows.push(unlockedCharacters.slice(i * unlockedCharacters.length / numRows, (i + 1) * unlockedCharacters.length / numRows));
    }

    return (
      <div style={{ fontFamily: "Verdana, Geneva, Tahoma, sans-serif", position: "relative", minHeight: "100%" }}>
        {this.showUnlockArea ? (<AgentUnlockArea gameState={this.state.gameState} characterUnlockedCallback={(id) => { this.selectedCharacter = id; window.scrollTo(0, 0); setTimeout(() => { this.showUnlockArea = false; }, 500) }} />) : null}

        {this.gameState.getCharactersUnlocked().length > 1 ? (
          <div>
            {characterRows.map((row) => {
              return (
                <div key={row[0]} style={{ display: "flex", marginBottom: "2px" }}>
                  {row.map((id) => {
                    return (
                      <div key={id} className={`topbar-character-select-item ${this.selectedCharacter == id ? "selected" : ""}`} onMouseDown={() => { this.selectedCharacter = id; }}>
                        <img className="topbar-character-select-img" src={PORTRAIT_IMAGES[id]} />
                        <p className="topbar-character-select-text" style={{ color: COLOR_SCHEMES[id].backgroundColor }}>{t(`character.${id}.name`)}</p>
                        <p className="topbar-character-select-text" style={{ color: COLOR_SCHEMES[id].textColor }}>{t(`character.${id}.name`)}</p>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ) : null}

        {currentAgentArea ? (
          <div style={{ margin: "8px" }}>
            {currentAgentArea}
          </div>) : null}

        <p style={{ fontSize: "8pt", position: "absolute", bottom: "0", left: "0", margin: "8px 16px" }}>Version 2022-08-18.0</p>
        <div style={{ fontSize: "8pt", position: "absolute", bottom: "0", right: "0", margin: "8px 16px" }}><span className="tooltip-trigger">[?]<div className="tooltip-box" style={{ bottom: "6px", right: "6px", width: "400px" }}><b>Disclaimer:</b> We are not affiliated with PRISM Project. PRISM Idle is a non-commercial fan project made in accordance to PRISM Project's Creation Guidelines (<a target="_blank" rel="noopener noreferrer" href="https://www.prismproject.jp/terms">https://www.prismproject.jp/terms</a>). The depictions of PRISM Project's contents in this fan project are not intended to be accurate to their real-life counterparts.</div></span> PRISM Idle by <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/ToasterKoishi">Toaster</a></div>

        {TOTER_DEBUG ? (
          <div style={{ position: "fixed", top: "0", right: "0", margin: "0", color: "red", background: "black" }}>
            <b>DEBUG TIME PASSED: {Math.floor(Math.floor(secondsPassed) / 60).toFixed(0)}:{(Math.floor(secondsPassed) % 60).toFixed(0).padStart(2, "0")}&nbsp;</b>
            <button onClick={() => { timeStep = 0.0; }}>Pause</button>
            <button onClick={() => { timeStep = 1.0; }}>1x</button>
            <button onClick={() => { timeStep = 5.0; }}>5x</button>
          </div>
        ) : null}
      </div>
    );
  }
}

interface AgentUnlockAreaState {
  hasSelectedItem: boolean;
  selectedItem: number;
}

const PORTRAIT_IMAGES = {
  iku: iku,
  aoi: aoi,
  meno: meno,
  luto: luto,
  rita: rita,
  shiki: shiki,
  nia: nia,
  yura: yura,
  pina: pina,
}

class AgentUnlockArea extends React.Component {
  props: {
    gameState: GameState,
    characterUnlockedCallback: (string) => void,
  };

  state: AgentUnlockAreaState = {
    hasSelectedItem: false,
    selectedItem: 0
  };

  shownCharacters: string[];
  fadingOut: boolean = false;

  componentWillMount() {
    const unlockedCharacters = this.props.gameState.getCharactersUnlocked();
    this.shownCharacters = SORTED_CHARACTER_IDS.filter((id) => !unlockedCharacters.includes(id));
  }

  onItemClicked(itemId: number) {
    if (!this.fadingOut) {
      this.setState((state: AgentUnlockAreaState) => {
        return {
          hasSelectedItem: !(state.hasSelectedItem && state.selectedItem == itemId),
          selectedItem: itemId
        }
      });
    }
  }

  render() {
    const selectedCharacterId = this.shownCharacters[this.state.selectedItem];

    return (
      <div className={`${this.fadingOut ? "outwards-fade-out" : ""}`} style={{ position: "fixed", top: "0", "left": "0", zIndex: "1", width: "100%", height: "100%", overflow: "auto" }}>
        <div className="simple-fade-in" style={{ position: "absolute", width: "100%", height: "100%", backgroundColor: "rgb(0,0,0,0.2)" }} />
        <div className="upwards-fade-in" style={{ position: "relative", margin: "100px auto", width: "80%", height: "calc(100% - 236px)", border: "solid lightblue 2px", padding: "16px", boxShadow: "0 0 10px #00000080", backgroundColor: this.state.hasSelectedItem ? COLOR_SCHEMES[selectedCharacterId].backgroundColor : "white", transition: "background-color 0.3s" }}>

          <h1 style={{ textAlign: "center" }}>Select Agent</h1>

          <div style={{ display: "flex", margin: "16px" }}>
            {this.shownCharacters.map((id, idx) => {
              return (
                <div key={id} className={`character-select-item ${this.state.hasSelectedItem && this.state.selectedItem == idx ? "selected" : ""}`} onMouseDown={() => this.onItemClicked(idx)}>
                  <img src={PORTRAIT_IMAGES[id]} className="character-select-img" />
                </div>
              )
            })}
          </div>

          {this.state.hasSelectedItem ? (
            <div style={{ textAlign: "center" }}>
              <p><b>{t(`character.${selectedCharacterId}.nameFull`)}</b></p>
              <p>{t(`character.${selectedCharacterId}.generation`)}</p>
              <div style={{ width: "80%", height: "1px", margin: "24px auto", backgroundColor: "gray" }} />
              <p><b>{t(`minigame.${selectedCharacterId}.name`)}</b></p>
              <p style={{ maxWidth: "80%", margin: "0 auto" }}>{t(`minigame.${selectedCharacterId}.blurb`)}</p>
              <div style={{ position: "absolute", bottom: "16px", left: "0", width: "100%" }}><button style={{ padding: "11px" }} onClick={() => { if (!this.fadingOut) { this.props.gameState.doCharacterUnlock(selectedCharacterId); this.props.characterUnlockedCallback(selectedCharacterId); this.fadingOut = true; } }}>Unlock</button></div>
            </div>
          ) : null}

        </div>
      </div>
    );
  }
}

export { App as default };

