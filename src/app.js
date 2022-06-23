import React from "react";
import { Currency, Cost, SimpleCurrencyPurchaseComponent } from "./currency";

const GAME_TICK_TIME = 50;

class App extends React.Component {
  constructor(props) {
    super(props);

    // Declare all Currencies
    const nuggie = new Currency();
    const airFryer = new Currency();
    const wcbonaldsDelivery = new Currency();

    // Define all of them
    Object.assign(nuggie, {
      id: "nuggie",
      i18n: () => { return {
        nameSingular: "nuggie",
        namePlural: "nuggies",
        indefArticle: "a",
        shortEffectDescription: ""
      }},
      costToPurchaseOne: [],
      calculateAmountToGainPerSecond: (currencies) => {
        return currencies.airFryer.getCurrentAmount() + 20*currencies.wcbonaldsDelivery.getCurrentAmount();
      }
    });

    Object.assign(airFryer, {
      id: "airFryer",
      i18n: () => { return {
        nameSingular: "air fryer",
        namePlural: "air fryers",
        indefArticle: "an",
        shortEffectDescription: "1 " + nuggie.getNameSingular() + " per second"
      }},
      costToPurchaseOne: [
        new Cost(nuggie, (currencies) => { return ((amount) => amount*amount)(currencies.airFryer.getNextPurchasedAmount()+1); })
      ],
    });

    Object.assign(wcbonaldsDelivery, {
      id: "wcbonaldsDelivery",
      i18n: () => { return {
        nameSingular: "WcBonalds delivery",
        namePlural: "WcBonalds deliveries",
        indefArticle: "a",
        shortEffectDescription: "20 " + nuggie.getNamePlural() + " per second"
      }},
      costToPurchaseOne: [
        new Cost(nuggie, (currencies) => { return ((amount) => 100*amount*amount)(currencies.wcbonaldsDelivery.getNextPurchasedAmount()+1); })
      ],
    });

    this.state = {
      currencies: {
        nuggie,
        airFryer,
        wcbonaldsDelivery
      },
    };
  }

  componentDidMount() {
    this.gameTickId = setInterval(this.gameTick, GAME_TICK_TIME);
  }

  componentWillUnmount() {
    clearInterval(this.gameTickId);
  }

  gameTick = () => {
    const currencies = this.state.currencies;

    // Generate currencies
    for (const id in currencies) {
      const currency = currencies[id];
      currency.nextValues.amount += currency.calculateAmountToGainPerSecond(currencies) * GAME_TICK_TIME / 1000.0;
    }

    // Lockstep update
    for (const id in currencies) {
      const currency = currencies[id];
      currency.currentValues.amount = currency.nextValues.amount;
      currency.currentValues.amountPurchased = currency.nextValues.amountPurchased;
    }

    // Tell ReactJS to render
    this.setState(state => {
      return state;
    });
  }

  render() {
    const currencies = this.state.currencies;
    return (
      <div>
        <h1>Awowi</h1>

        <p>Nuggies: {Math.floor(currencies.nuggie.getCurrentAmount())}</p>
        <button onClick={() => currencies.nuggie.tryPurchaseOne(currencies)}>Cook {currencies.nuggie.getNameWithArticle()}</button>

        <SimpleCurrencyPurchaseComponent currency={currencies.airFryer} currencies={currencies} />
        <SimpleCurrencyPurchaseComponent currency={currencies.wcbonaldsDelivery} currencies={currencies} />

      </div>
    );
  }
}

export { App as default };