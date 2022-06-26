import React from "react";
import { awowiName, GAME_TICK_TIME } from "./const";
import { SimpleCurrencyPurchaseComponent } from "./currency";
import { GameState } from "./gamestate";
import { AoiMinigameArea } from "./minigames/aoi-minigame";
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
      } else if (time-this.previousFrameTime === 0) {
        // Do nothing
      } else {
        this.gameTick((time-this.previousFrameTime) / 1000);
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

    // Lockstep update
    currencies.forEach((currency) => {
      currency.swapFrameBuffer();
    });

    this.aoiMinigameCallbacks.gameTick(time);

    // Tell ReactJS to render
    this.setState(state => {
      return state;
    });
    //this.forceUpdate();
  }

  render() {
    const currencies = this.state.gameState.currencies;
    const nuggieNames = currencies.get("nuggie").i18n();
    return (
      <div>
        <h1>{awowiName}</h1>

        <p>Welcome to {awowiName}'s room! It is very messy, and {nuggieNames.namePlural} keep showing up in the most unexpected places. Use your mouse to guide {awowiName} to those delicious {nuggieNames.namePlural}! Unfortunately, {awowiName} is very :aoilazy: and moves frustratingly slow. We can probably find some way to motivate her... right...?</p>

        <AoiMinigameArea gameState={this.state.gameState} callbacks={this.aoiMinigameCallbacks} />

        <p><b>Nuggies</b>: {Number(currencies.get("nuggie").getCurrentAmount())}</p>

        <div style={{ display: "flex", flexWrap: "wrap" }}>
        <SimpleCurrencyPurchaseComponent currency={currencies.get("airFryer")} />
        <SimpleCurrencyPurchaseComponent currency={currencies.get("wcbonalds")} />
        <SimpleCurrencyPurchaseComponent currency={currencies.get("compressedNuggies1")} />
        <SimpleCurrencyPurchaseComponent currency={currencies.get("compressedNuggies2")} />
        <SimpleCurrencyPurchaseComponent currency={currencies.get("smellWafter")} />
        <SimpleCurrencyPurchaseComponent currency={currencies.get("motivationResearch")} />
        </div>
      </div>
    );
  }
}

export { App as default };
