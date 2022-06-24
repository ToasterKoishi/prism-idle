import React from "react";
import { awowiName, GAME_TICK_TIME } from "./const";
import { SimpleCurrencyPurchaseComponent } from "./currency";
import { GameState } from "./gamestate";
import { AoiMinigameArea } from "./minigames/aoi-minigame";

class App extends React.Component {
  state: { gameState: GameState }

  gameState: GameState = new GameState();
  gameTickId: NodeJS.Timer;
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
    this.gameTickId = setInterval(() => this.gameTick(GAME_TICK_TIME / 1000.0), GAME_TICK_TIME);
  }

  componentWillUnmount() {
    clearInterval(this.gameTickId);
  }

  gameTick = (time: number) => {
    const currencies = this.state.gameState.currencies;

    // Generate currencies
    currencies.forEach((currency) => {
      currency.addAmount(currency.calculateAmountToGainPerSecond() * time);
    });

    // Lockstep update
    currencies.forEach((currency) => {
      currency.swapFrameBuffer();
    });

    this.aoiMinigameCallbacks.gameTick(time);

    // Tell ReactJS to render
    this.setState(state => {
      return state;
    });
    this.forceUpdate();
  }

  render() {
    const currencies = this.state.gameState.currencies;
    const nuggieNames = currencies.get("nuggie").i18n();
    return (
      <div>
        <h1>{awowiName}</h1>

        <p>Welcome to {awowiName}'s room! It is very messy, and {nuggieNames.namePlural} keep showing up in the most unexpected places. Use your mouse to guide {awowiName} to those delicious {nuggieNames.namePlural}! Unfortunately, {awowiName} is very :aoilazy: and moves frustratingly slow. We can probably find some way to motivate her... right...?</p>

        <AoiMinigameArea gameState={this.state.gameState} callbacks={this.aoiMinigameCallbacks} />

        <p><b>Nuggies</b>: {Math.floor(currencies.get("nuggie").getCurrentAmount())}</p>

        <div style={{ display: "flex", flexWrap: "wrap" }}>
        <SimpleCurrencyPurchaseComponent currency={currencies.get("airFryer")} />
        <SimpleCurrencyPurchaseComponent currency={currencies.get("motivationResearch")} />
        <SimpleCurrencyPurchaseComponent currency={currencies.get("smellWafter")} />
        </div>
      </div>
    );
  }
}

export { App as default };
