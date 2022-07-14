import React from "react";
import { awowiFullName, awowiName } from "./const";
import { GameState } from "./logic/game-state";
import { AoiMinigameArea } from "./minigames/aoi-minigame";
import { ShopAreaComponent } from "./components/shop-area-component";
import "./app.css";

// Debug stuff
const TOTER_DEBUG: boolean = false;
let secondsPassed: number = 0.0;
let timeStep: number = 1.0;

class App extends React.Component {
  state: {
    gameState: GameState,
    t1Open: boolean,
    t2Open: boolean,
  }

  gameState: GameState = new GameState();
  previousFrameTime: DOMHighResTimeStamp = -1;
  //gameTickId: NodeJS.Timer;
  aoiMinigameCallbacks: { gameTick: (_: number) => void };

  constructor(props) {
    super(props);

    this.state = {
      gameState: this.gameState,
      t1Open: true,
      t2Open: true,
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

    this.aoiMinigameCallbacks = {
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
      console.log(this.gameState.getResolvedValue("nuggieGenerator").explain());
    }


    this.aoiMinigameCallbacks.gameTick(time);
    this.gameState.gameTick(time);

    // Tell ReactJS to render
    this.setState(state => {
      return state;
    });
    //this.forceUpdate();
  }

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

    const heckieGeneratorEnabled = this.gameState.getGenerator("heckie").enabled;

    return (
      <div style={{ fontFamily: "Verdana, Geneva, Tahoma, sans-serif", position: "relative", padding: "16px 0 500px", margin: "auto", backgroundColor: "aliceblue" }}>
        <AoiMinigameArea gameState={this.state.gameState} callbacks={this.aoiMinigameCallbacks} />

        <div style={{ textAlign: "center", margin: "16px auto" }}>
          <b>{awowiFullName}</b> Tier I Upgrades <button onClick={() => { this.state.t1Open = !this.state.t1Open; this.setState(this.state); }}>{this.state.t1Open ? "Hide" : "Show"}</button>
        </div>

        <div style={{ textAlign: "center", margin: "16px auto" }}>
          <b>Nuggies</b>: {this.state.gameState.getCurrency("nuggie").getCurrentAmountShort()}
        </div>

        {this.state.t1Open ? (
          <div>
            <ShopAreaComponent gameState={this.state.gameState} currencyIdsToShow={aoiT1Currencies} />
          </div>
        ) : null}

        <div className="shop-divider" />

        {this.state.gameState.getCurrency("heckie").getIsRevealed() ? (
          <div>
            <div style={{ textAlign: "center", margin: "16px auto" }}>
              <b>{awowiFullName}</b> Tier II Upgrades <button onClick={() => { this.state.t2Open = !this.state.t2Open; this.setState(this.state); }}>{this.state.t2Open ? "Close" : "Open"}</button>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", margin: "16px auto 0px" }}>
                <p style={{ textAlign: "right", flexBasis: "0", flexGrow: "1" }}>{this.state.gameState.getCurrency("nuggie").getCurrentAmountShort()} | <b>NUGGIES</b></p>
                <div style={{ visibility: heckieGeneratorEnabled ? "visible" : "hidden"}}>
                  <span style={{ animation: "small-pulsate-0 1.5s infinite" }}>{">"}</span>
                  <span style={{ animation: "small-pulsate-1 1.5s infinite" }}>{">"}</span>
                  <span style={{ animation: "small-pulsate-2 1.5s infinite" }}>{">"}</span>
                </div>
                <button style={{ width: "45px" }} onClick={() => { this.gameState.getGenerator("heckie").enabled = !heckieGeneratorEnabled; this.setState(this.state); }}>
                  {heckieGeneratorEnabled ? "ON" : "OFF"}
                </button>
                <div style={{ visibility: heckieGeneratorEnabled ? "visible" : "hidden"}}>
                  <span style={{ animation: "small-pulsate-0 1.5s infinite" }}>{">"}</span>
                  <span style={{ animation: "small-pulsate-1 1.5s infinite" }}>{">"}</span>
                  <span style={{ animation: "small-pulsate-2 1.5s infinite" }}>{">"}</span>
                </div>
                <p style={{ textAlign: "left", flexBasis: "0", flexGrow: "1" }}><b>HECKIES</b> | {this.state.gameState.getCurrency("heckie").getCurrentAmountShort()}</p>
              </div>
              <div style={{ textAlign: "center", margin: "6px auto 0px" }}>
                (Max rate: {this.state.gameState.getResolvedValue("heckieGeneratorIn").resolve().toFixed(2)}/s → {this.state.gameState.getResolvedValue("heckieGeneratorOut").resolve().toFixed(2)}/s)
              </div>
            </div>
            {this.state.t2Open ? (
              <div>
                <ShopAreaComponent gameState={this.state.gameState} currencyIdsToShow={aoiT2Currencies} />
                <ShopAreaComponent gameState={this.state.gameState} currencyIdsToShow={aoiT2Skills} />
              </div>
            ) : null}

            <div className="shop-divider" />
          </div>
        ) : null}

        <p style={{ fontSize: "8pt", position: "absolute", bottom: "0", left: "0", margin: "8px" }}>Version 2022-07-13</p>
        <p style={{ fontSize: "8pt", position: "absolute", bottom: "0", right: "0", margin: "8px" }}>PRISM Idle by <a href="https://twitter.com/ToasterKoishi">Toaster</a></p>

        {TOTER_DEBUG ? (
          <div style={{ position: "fixed", top: "0", right: "0", margin: "8px", color: "red", background: "black" }}>
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

export { App as default };
