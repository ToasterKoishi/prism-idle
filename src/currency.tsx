import React from "react";
import { GameState } from "./gamestate";

export class Cost {
  currency: Currency;
  calculateCost = (gameState: GameState) => 0.0;

  constructor(currency: Currency, calculateCostFunc: (_: GameState) => number) {
    this.currency = currency;
    this.calculateCost = calculateCostFunc;
  }
}

export class Currency {
  // Display strings and stuff
  id: string;
  i18n = () => {
    return {
      nameSingular: "",
      namePlural: "",
      indefArticle: "",
      shortEffectDescription: "",
      flavorText: ""
    }
  }

  // Technical info
  #gameState: GameState;
  costToPurchaseOne: Cost[] = [];
  #isRevealed: boolean = false;
  #isHidden: boolean = false; // Overrides isRevealed - if this is set, then it will never be shown

  // Lockstep values - the values of the next game tick will always be calculated from the current tick's values
  #currentValues = {
    amount: 0.0,
    amountPurchased: 0.0,
    maximumAmount: -1.0
  };
  #nextValues = {
    amount: 0.0,
    amountPurchased: 0.0,
    maximumAmount: -1.0
  };

  constructor(gameState: GameState) {
    this.#gameState = gameState;
  }

  canPurchaseOne = () => {
    for (const cost of this.costToPurchaseOne) {
      if (cost.currency.getNextAmount() < cost.calculateCost(this.#gameState)) {
        return false;
      }
    }
    return true;
  };
  tryPurchaseOne = () => {
    if (this.canPurchaseOne()) {
      // TODO: There's definitely some sort of bug here with costs that calculate based off other currencies that are also costs, but there likely won't be any costs like that
      for (const cost of this.costToPurchaseOne) {
        cost.currency.#nextValues.amount -= cost.calculateCost(this.#gameState);
      }

      this.#nextValues.amount += 1.0;
      this.#nextValues.amountPurchased += 1.0;
      this.onAmountPurchased(1);
    }
  };

  getNameWithArticle = () => this.i18n().indefArticle + " " + this.i18n().nameSingular;
  getNameSingular = () => this.i18n().nameSingular;
  getNamePlural = () => this.i18n().namePlural;

  getGameState = () => this.#gameState;

  addAmount = (amount: number) => { this.#nextValues.amount = this.#nextValues.maximumAmount >= 0.0 ? Math.min(this.#nextValues.amount + amount, this.#nextValues.maximumAmount) : this.#nextValues.amount + amount; };
  getCurrentAmount = () => this.#currentValues.amount;
  getCurrentPurchasedAmount = () => this.#currentValues.amountPurchased;
  getNextAmount = () => this.#nextValues.amount;
  getNextPurchasedAmount = () => this.#nextValues.amountPurchased;
  getNextMaximumAmount = () => this.#nextValues.maximumAmount;
  swapFrameBuffer = () => {
    this.#currentValues.amount = this.#nextValues.amount;
    this.#currentValues.amountPurchased = this.#nextValues.amountPurchased;
    this.#currentValues.maximumAmount = this.#nextValues.maximumAmount;
  }

  setRevealed = () => { this.#isRevealed = true; }
  setHidden = () => { this.#isHidden = true; }
  getIsRevealed = () => {
    if (this.#isHidden) {
      return false;
    } else if (this.#isRevealed) {
      return true;
    } else {
      if (this.calculateIsRevealed()) {
        this.#isRevealed = true;
        return true;
      } else {
        return false;
      }
    }
  }

  // Virtuals
  calculateAmountToGainPerSecond = () => 0;
  calculateIsRevealed = () => false; // For use by things that reveal themselves on a condition
  onAmountPurchased = (amount: number) => {};
}

interface SimpleCurrencyPurchaseComponentProps {
  currency: Currency;
}

interface SimpleCurrencyPurchaseComponentState {
}

export class SimpleCurrencyPurchaseComponent extends React.Component {
  props: SimpleCurrencyPurchaseComponentProps;
  state: SimpleCurrencyPurchaseComponentState;

  constructor(props: SimpleCurrencyPurchaseComponentProps) {
    super(props);
  }

  render() {
    const currency = this.props.currency;
    if (currency.getIsRevealed()) {
      const costAmount = currency.costToPurchaseOne[0].calculateCost(currency.getGameState());
      const costCurrency = currency.costToPurchaseOne[0].currency;
      return (
        <div style={{ maxWidth: "285px", padding: "10px", border: "1px solid black", margin: "10px" }}>
          <p>{currency.getNamePlural().toUpperCase()}</p>
          <p>{currency.i18n().flavorText}</p>
          <p>{currency.i18n().shortEffectDescription}</p>
          <p>Owned: {Math.floor(currency.getCurrentAmount())} | Cost: {costAmount} {costCurrency.getNamePlural()}</p>
          <p><button disabled={!currency.canPurchaseOne()} onClick={() => currency.tryPurchaseOne()}>
            Buy 1
          </button></p>
        </div>
      );
    } else {
      return <div />
    }
  }
}