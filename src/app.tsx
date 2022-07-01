import React from "react";
import { awowiName, GAME_TICK_TIME } from "./const";
import { Currency, SimpleCurrencyPurchaseComponent } from "./currency";
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

    const currencyIdsToShow = [
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
    ];
    const currenciesToShow = currencyIdsToShow.map((currency) => currencies.get(currency));
    const soldOutCurrencies:Currency[] = [];
    const inStockCurrencies:Currency[] = [];
    currenciesToShow.forEach((currency) => {
      currency.isInStock() ? inStockCurrencies.push(currency) : soldOutCurrencies.push(currency);
    });
    //const finalOrderedCurrenciesToShow = [...inStockCurrencies, ...soldOutCurrencies];
    const finalOrderedCurrenciesToShow = currenciesToShow;
    const componentsToShow = finalOrderedCurrenciesToShow.map((currency) => <SimpleCurrencyPurchaseComponent key={currency.getId()} currency={currency} />);

    return (
      <div style={{ fontFamily: "Verdana, Geneva, Tahoma, sans-serif", padding: "16px 0 500px", margin: "auto", backgroundColor: "aliceblue" }}>
        <div style={{ margin: "auto", textAlign: "center" }}>
          <h1 style={{}}>{awowiName}</h1>

          <p style={{ maxWidth: "960px", margin: "16pt auto 16pt", textAlign: "left" }}>Welcome to {awowiName}'s room! It is very messy, and {nuggieNames.namePlural} keep showing up in the most unexpected places. Use your mouse to guide {awowiName} to those delicious {nuggieNames.namePlural}! Unfortunately, {awowiName} is very :aoilazy: and moves frustratingly slow. We can probably find some way to motivate her... right...?</p>

          <AoiMinigameArea gameState={this.state.gameState} callbacks={this.aoiMinigameCallbacks} />

          <p style={{ margin: "16pt auto 16pt" }}><b>Nuggies</b>: {Number(currencies.get("nuggie").getCurrentAmount())}</p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start", gap: "20px" }}>
          {componentsToShow}
        </div>
      </div>
    );
  }
}

export { App as default };
