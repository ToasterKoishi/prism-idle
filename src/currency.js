import React from "react";

const IMPOSSIBLE_COST = [{
  currency: { getNextAmount: () => 0.0 },
  calculateCost: (currencies) => 1.0
}];

class Cost {
  currency;
  calculateCost = (currencies) => 0.0;

  constructor(currency, calculateCostFunc) {
    this.currency = currency;
    this.calculateCost = calculateCostFunc;
  }
}

class Currency {
  // Display strings and stuff
  id;
  i18n = () => { return {
    nameSingular: "",
    namePlural: "",
    indefArticle: "",
    shortEffectDescription: ""
  }}

  // Lockstep values - the values of the next game tick will always be calculated from the current tick's values
  currentValues = {
    amount: 0.0,
    amountPurchased: 0.0,
  };
  nextValues = {
    amount: 0.0,
    amountPurchased: 0.0,
  };

  costToPurchaseOne = IMPOSSIBLE_COST;

  canPurchaseOne = (currencies) => {
    for (const cost of this.costToPurchaseOne) {
      if (cost.currency.getNextAmount() < cost.calculateCost(currencies)) {
        return false;
      }
    }
    return true;
  };
  tryPurchaseOne = (currencies) => {
    if (this.canPurchaseOne(currencies)) {
      // TODO: There's definitely some sort of bug here with costs that calculate based off other currencies that are also costs, but there likely won't be any costs like that
      for (const cost of this.costToPurchaseOne) {
        cost.currency.nextValues.amount -= cost.calculateCost(currencies);
      }

      this.nextValues.amount += 1.0;
      this.nextValues.amountPurchased += 1.0;
    }
  };
  calculateAmountToGainPerSecond = (currencies) => 0;

  getNameWithArticle = () => this.i18n().indefArticle + " " + this.i18n().nameSingular;
  getNameSingular = () => this.i18n().nameSingular;
  getNamePlural = () => this.i18n().namePlural;
  getCurrentAmount = () => this.currentValues.amount;
  getCurrentPurchasedAmount = () => this.currentValues.amountPurchased;
  getNextAmount = () => this.nextValues.amount;
  getNextPurchasedAmount = () => this.nextValues.amountPurchased;

  renderSimplePurchaseNode = (currencies) => {
    return(
      <div>
        <button onClick={() => this.tryPurchaseOne(currencies)}>Buy {this.getNameWithArticle()} ({this.i18n.shortEffectDescription})</button>
        &nbsp;Owned: {Math.floor(this.getCurrentAmount())} | Cost: {this.costToPurchaseOne[0].calculateCost(currencies)}
      </div>
    );
  }
}

class SimpleCurrencyPurchaseComponent extends React.Component {
  constructor(props) {
    super(props);
    this.currency = props.currency;
    this.currencies = props.currencies;
  }

  render() {
    return(
      <div>
        <button onClick={() => this.currency.tryPurchaseOne(this.currencies)}>Buy {this.currency.getNameWithArticle()} ({this.currency.i18n().shortEffectDescription})</button>
        &nbsp;Owned: {Math.floor(this.currency.getCurrentAmount())} | Cost: {this.currency.costToPurchaseOne[0].calculateCost(this.currencies)}
      </div>
    );
  }
}

export { Currency, Cost, SimpleCurrencyPurchaseComponent };