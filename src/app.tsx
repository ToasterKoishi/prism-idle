import i18next, { t } from 'i18next';
import React from "react";
import { initReactI18next } from "react-i18next";
import "./app.css";
import { ShopAreaComponent } from "./components/shop-area-component";
import { COLOR_SCHEMES, SORTED_CHARACTER_IDS } from './const';
import { default as i18nEN } from "./i18n/en.json";
import aoi from "./img/aoi.webp";
import iku from "./img/iku.webp";
import meno from "./img/meno.webp";
import { GameState } from "./logic/game-state";
import { AoiMinigameArea } from "./minigames/aoi-minigame";

// Debug stuff
const TOTER_DEBUG: boolean = false;
let secondsPassed: number = 0.0;
let timeStep: number = 1.0;

class App extends React.Component {
  state: {
    gameState: GameState
  }

  gameState: GameState = null;
  previousFrameTime: DOMHighResTimeStamp = -1;
  //gameTickId: NodeJS.Timer;
  selectedCharacter: string = "aoi";
  showUnlockArea: boolean = false;
  minigameCallbacks: { gameTick: (_: number) => void };

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

    // DEBUG STUFF
    if (TOTER_DEBUG) {
      const gameState = this.gameState;

      // Approximately 1 hr of playing
      gameState.getCurrency("nuggie").addAmount(200000n);
      for (let i = 0; i < 30; i++) gameState.getCurrency("airFryer").tryPurchaseOne();
      for (let i = 0; i < 8; i++) gameState.getCurrency("airFryer1").tryPurchaseOne();
      for (let i = 0; i < 4; i++) gameState.getCurrency("airFryer2").tryPurchaseOne();
      for (let i = 0; i < 8; i++) gameState.getCurrency("wcbonalds").tryPurchaseOne();
      for (let i = 0; i < 3; i++) gameState.getCurrency("wcbonalds1").tryPurchaseOne();
      for (let i = 0; i < 7; i++) gameState.getCurrency("compressedNuggies1").tryPurchaseOne();
      for (let i = 0; i < 5; i++) gameState.getCurrency("compressedNuggies2").tryPurchaseOne();
      gameState.getCurrency("motivationResearch").tryPurchaseOne();
      for (let i = 0; i < 4; i++) gameState.getCurrency("smellWafter").tryPurchaseOne();
      gameState.getCurrency("nuggieDog").tryPurchaseOne();
      for (let i = 0; i < 3; i++) gameState.getCurrency("nuggieDog1").tryPurchaseOne();
      for (let i = 0; i < 3; i++) gameState.getCurrency("nuggieDog2").tryPurchaseOne();
      for (let i = 0; i < 3; i++) gameState.getCurrency("nuggieFlavorTechnique").tryPurchaseOne();
      for (let i = 0; i < 3; i++) gameState.getCurrency("nuggieMagnet").tryPurchaseOne();

      // T2 testing
      gameState.getCurrency("nuggie").addAmount(100000000n);
      gameState.getCurrency("heckie").addAmount(100000000n);
      gameState.getCurrency("aoiT2Unlock").tryPurchaseOne();
      for (let i = 0; i < 20; i++) gameState.getCurrency("heckieGenerator1").tryPurchaseOne();
      for (let i = 0; i < 20; i++) gameState.getCurrency("heckieGenerator2").tryPurchaseOne();
      for (let i = 0; i < 20; i++) gameState.getCurrency("heckieGenerator3").tryPurchaseOne();
      gameState.getCurrency("aoiRhythmGames").tryPurchaseOne();

      // Current max rate, about 2 hrs of playing
      // Max rate: 12232.50/s → 48930.00/s
    }

    this.minigameCallbacks = {
      gameTick: (_: number) => { }
    };
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

    if (!this.showUnlockArea && this.gameState.getNumCharacterUnlocks() > 0) {
      this.showUnlockArea = true;
    }

    this.minigameCallbacks.gameTick(time);
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
      case "aoi":
        currentAgentArea = (<AoiArea
          gameState={this.gameState}
          aoiMinigameCallbacks={this.minigameCallbacks}
        />);
      default:
        break;
    }

    return (
      <div style={{ fontFamily: "Verdana, Geneva, Tahoma, sans-serif", position: "relative", minHeight: "100%" }}>
        {this.showUnlockArea ? (<AgentUnlockArea gameState={this.state.gameState} characterUnlockedCallback={(id) => { this.selectedCharacter = id; window.scrollTo(0, 0); setTimeout(() => { this.showUnlockArea = false; }, 500) }} />) : null}

        {this.gameState.getCharactersUnlocked().length > 1 ? (
          <div style={{ display: "flex" }}>
            {SORTED_CHARACTER_IDS.filter((id) => this.gameState.getCharactersUnlocked().includes(id)).map((id) => {
              return (
                <div key={id} className={`topbar-character-select-item ${this.selectedCharacter == id ? "selected" : ""}`} onMouseDown={() => { this.selectedCharacter = id; }}>
                  <img src={PORTRAIT_IMAGES[id]} className="topbar-character-select-img" />
                  <p className="topbar-character-select-text" style={{ color: COLOR_SCHEMES[id].backgroundColor }}>{t(`character.${id}.name`)}</p>
                  <p className="topbar-character-select-text" style={{ color: COLOR_SCHEMES[id].textColor }}>{t(`character.${id}.name`)}</p>
                </div>
              )
            })}
          </div>
        ) : null}

        {currentAgentArea ? (
          <div style={{ margin: "8px" }}>
            {currentAgentArea}
          </div>) : null}

        <p style={{ fontSize: "8pt", position: "absolute", bottom: "0", left: "0", margin: "8px 16px" }}>Version 2022-07-25</p>
        <div style={{ fontSize: "8pt", position: "absolute", bottom: "0", right: "0", margin: "8px 16px" }}><span className="tooltip-trigger">[?]<div className="tooltip-box" style={{ bottom: "6px", right: "6px", width: "400px" }}><b>Disclaimer:</b> We are not affiliated with PRISM Project. PRISM Idle is a non-commercial fan project made in accordance to PRISM Project's Creation Guidelines (<a target="_blank" rel="noopener noreferrer" href="https://www.prismproject.jp/terms">https://www.prismproject.jp/terms</a>). The depictions of PRISM Project's contents in this fan project are not intended to be accurate to their real-life counterparts.</div></span> PRISM Idle by <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/ToasterKoishi">Toaster</a></div>

        {TOTER_DEBUG ? (
          <div style={{ position: "fixed", top: "0", right: "0", margin: "0", color: "red", background: "black" }}>
            <b>DEBUG TIME PASSED: {(secondsPassed / 60).toFixed(0)}:{(secondsPassed % 60).toFixed(0).padStart(2, "0")}&nbsp;</b>
            <button onClick={() => { timeStep = 0.0; }}>Pause</button>
            <button onClick={() => { timeStep = 1.0; }}>1x</button>
            <button onClick={() => { timeStep = 10.0; }}>10x</button>
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

class AoiArea extends React.Component {
  props: {
    gameState: GameState,
    aoiMinigameCallbacks: { gameTick: (_: number) => void }
  };

  state: {
    t1Open: boolean,
    t2Open: boolean,
  } = {
      t1Open: true,
      t2Open: true,
    };

  render() {
    const aoiT1Currencies = [
      "airFryer",
      "airFryer1",
      "airFryer2",
      "wcbonalds",
      "wcbonalds1",
      "compressedNuggies1",
      "compressedNuggies2",
      "smellWafter",
      "nuggieDog",
      "nuggieDog1",
      "nuggieDog2",
      "nuggieFlavorTechnique",
      "nuggieMagnet",
      "motivationResearch",
      "aoiT2Unlock",
    ];

    const aoiT2Currencies = [
      "heckieGenerator1",
      "heckieGenerator2",
      "heckieGenerator3",
    ];

    const aoiT2Skills = [
      "hiGuys",
      "konkonmori",
      "aoiStreamDelay",
      "aoiStreamDelay2",
      //"aoiStreamDelay3",
      "aoiBackseating",
      "aoiKaraoke",
      "aoiBullying",
      "aoiRhythmGames",
      "aoiMunchies",
      "aoiMunchies2",
      "aoiMunchies3",
      "aoiT3Unlock",
    ];

    const heckieGeneratorEnabled = this.props.gameState.getGenerator("heckie").enabled;

    return (
      <div style={{ fontFamily: "Verdana, Geneva, Tahoma, sans-serif", position: "relative", padding: "16px 0 500px", margin: "auto", minHeight: "100%", backgroundColor: "aliceblue" }}>
        <AoiMinigameArea gameState={this.props.gameState} callbacks={this.props.aoiMinigameCallbacks} />

        <div style={{ textAlign: "center", margin: "16px auto" }}>
          <b>{t("character.aoi.nameFull")}</b> Tier I Upgrades <button onClick={() => { this.state.t1Open = !this.state.t1Open; this.setState(this.state); }}>{this.state.t1Open ? "Hide" : "Show"}</button>
        </div>

        <div style={{ textAlign: "center", margin: "16px auto" }}>
          <b>Nuggies</b>: {this.props.gameState.getCurrency("nuggie").getCurrentAmountShort()}
        </div>

        {this.state.t1Open ? (
          <div>
            <ShopAreaComponent gameState={this.props.gameState} currencyIdsToShow={aoiT1Currencies} />
          </div>
        ) : null}

        <div className="shop-divider" />

        {this.props.gameState.getCurrency("heckie").getIsRevealed() ? (
          <div>
            <div style={{ textAlign: "center", margin: "16px auto" }}>
              <b>{t("character.aoi.nameFull")}</b> Tier II Upgrades <button onClick={() => { this.state.t2Open = !this.state.t2Open; this.setState(this.state); }}>{this.state.t2Open ? "Hide" : "Show"}</button>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", margin: "16px auto 0px" }}>
                <p style={{ textAlign: "right", flexBasis: "0", flexGrow: "1" }}>{this.props.gameState.getCurrency("nuggie").getCurrentAmountShort()} | <b>NUGGIES</b></p>
                <div style={{ visibility: heckieGeneratorEnabled ? "visible" : "hidden" }}>
                  <span style={{ animation: "small-pulsate-0 1.5s infinite" }}>{">"}</span>
                  <span style={{ animation: "small-pulsate-1 1.5s infinite" }}>{">"}</span>
                  <span style={{ animation: "small-pulsate-2 1.5s infinite" }}>{">"}</span>
                </div>
                <button style={{ width: "45px" }} onClick={() => { this.props.gameState.getGenerator("heckie").enabled = !heckieGeneratorEnabled; this.setState(this.state); }}>
                  {heckieGeneratorEnabled ? "ON" : "OFF"}
                </button>
                <div style={{ visibility: heckieGeneratorEnabled ? "visible" : "hidden" }}>
                  <span style={{ animation: "small-pulsate-0 1.5s infinite" }}>{">"}</span>
                  <span style={{ animation: "small-pulsate-1 1.5s infinite" }}>{">"}</span>
                  <span style={{ animation: "small-pulsate-2 1.5s infinite" }}>{">"}</span>
                </div>
                <p style={{ textAlign: "left", flexBasis: "0", flexGrow: "1" }}><b>HECKIES</b> | {this.props.gameState.getCurrency("heckie").getCurrentAmountShort()}</p>
              </div>
              <div style={{ textAlign: "center", margin: "6px auto 0px" }}>
                (Max rate: {this.props.gameState.getResolvedValue("heckieGeneratorIn").resolve().toFixed(2)}/s → {this.props.gameState.getResolvedValue("heckieGeneratorOut").resolve().toFixed(2)}/s)
              </div>
            </div>
            {this.state.t2Open ? (
              <div>
                <ShopAreaComponent gameState={this.props.gameState} currencyIdsToShow={aoiT2Currencies} />
                <ShopAreaComponent gameState={this.props.gameState} currencyIdsToShow={aoiT2Skills} />
              </div>
            ) : null}

            <div className="shop-divider" />
          </div>
        ) : null}
      </div>);
  }
}

export { App as default };

