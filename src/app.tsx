import React from "react";
import { awowiName } from "./const";
import { GameState } from "./logic/game-state";
import { AoiMinigameArea } from "./minigames/aoi-minigame";
import { ShopAreaComponent } from "./components/shop-area-component";
import "./app.css";

class App extends React.Component {
  state: { gameState: GameState }

  gameState: GameState = new GameState();
  previousFrameTime: DOMHighResTimeStamp = -1;
  //gameTickId: NodeJS.Timer;
  aoiMinigameCallbacks: { gameTick: (_: number) => void };

  constructor(props) {
    super(props);

    this.state = {
      gameState: this.gameState
    };

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
    const currencies = this.state.gameState.currencies;

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
    ];

    const heckieGeneratorEnabled = this.gameState.getGenerator("heckie").enabled;

    const maybeT2Area = (
      <div>
        <div style={{ width: "600px", height: "1px", backgroundColor: "gray", margin: "50px auto 40px" }} />

        <div style={{ display: "flex", justifyContent: "center", gap: "8px", margin: "16px auto 16px" }}>
          <p style={{ textAlign: "right", flexBasis: "0", flexGrow: "1" }}>{this.state.gameState.getCurrency("nuggie").getCurrentAmountShort()} | <b>NUGGIES</b></p>
          <div>
            <span style={{ animation: heckieGeneratorEnabled ? "small-pulsate-0 1.5s infinite" : "" }}>{">"}</span>
            <span style={{ animation: heckieGeneratorEnabled ? "small-pulsate-1 1.5s infinite" : "" }}>{">"}</span>
            <span style={{ animation: heckieGeneratorEnabled ? "small-pulsate-2 1.5s infinite" : "" }}>{">"}</span>
          </div>
          <button style={{ width: "45px" }} onClick={() => this.gameState.getGenerator("heckie").enabled = !heckieGeneratorEnabled}>
            {heckieGeneratorEnabled ? "ON" : "OFF"}
          </button>
          <div>
            <span style={{ animation: heckieGeneratorEnabled ? "small-pulsate-0 1.5s infinite" : "" }}>{">"}</span>
            <span style={{ animation: heckieGeneratorEnabled ? "small-pulsate-1 1.5s infinite" : "" }}>{">"}</span>
            <span style={{ animation: heckieGeneratorEnabled ? "small-pulsate-2 1.5s infinite" : "" }}>{">"}</span>
          </div>
          <p style={{ textAlign: "left", flexBasis: "0", flexGrow: "1" }}><b>HECKIES</b> | {this.state.gameState.getCurrency("heckie").getCurrentAmountShort()}</p>
        </div>
        <ShopAreaComponent gameState={this.state.gameState} currencyIdsToShow={aoiT2Currencies} />
        <ShopAreaComponent gameState={this.state.gameState} currencyIdsToShow={aoiT2Skills} />
      </div>
    );

    return (
      <div style={{ fontFamily: "Verdana, Geneva, Tahoma, sans-serif", padding: "16px 0 500px", margin: "auto", backgroundColor: "aliceblue" }}>
        <div style={{ margin: "auto", textAlign: "center" }}>
          <h1 style={{}}>{awowiName}</h1>
        </div>

        <AoiMinigameArea gameState={this.state.gameState} callbacks={this.aoiMinigameCallbacks} />

        <p style={{ margin: "16pt auto 16pt", textAlign: "center" }}>
          <b>Nuggies</b>: {this.state.gameState.getCurrency("nuggie").getCurrentAmountShort()}
        </p>

        <ShopAreaComponent gameState={this.state.gameState} currencyIdsToShow={aoiT1Currencies} />

        {this.state.gameState.getCurrency("heckie").getIsRevealed() ? maybeT2Area : false}
      </div>
    );
  }
}

export { App as default };
