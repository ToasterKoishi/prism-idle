import React from "react";
import { GameState } from "./gamestate";
import "./app.css";

/**
 * Currency represents all obtainables in this game.
 */
export class Currency {
  // Display strings and stuff
  #id: string;
  i18n: () => any = () => {
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
    amount: 0n,
    amountPurchased: 0n,
    maximumAmount: -1n
  };
  #nextValues = {
    amount: 0n,
    amountPurchased: 0n,
    maximumAmount: -1n
  };
  // This is "how much the shop sells." Amount cannot go over stock, and once amount reaches stock, the item is considered "out of stock" for purchase.
  // Somewhat different semantically from maximumAmount, which is "how much can the player carry."
  maximumStock = -1n;

  constructor(gameState: GameState, id: string) {
    this.#gameState = gameState;
    this.#id = id;
  }

  // Factory
  registerI18N = (v: () => any) => { this.i18n = v; return this; }
  registerMaximumStock = (v: bigint) => { this.maximumStock = v; return this; }
  registerCostToPurchaseOne = (v: Cost[]) => { this.costToPurchaseOne = v; return this; }
  registerCanPurchaseOne = (f: () => boolean) => { this.canPurchaseOne = f; return this; }
  registerCalculateIsRevealed = (f: () => boolean) => { this.calculateIsRevealed = f; return this; }
  registerOnAmountPurchased = (f: () => void) => { this.onAmountPurchased = f; return this; }

  getId = () => this.#id;
  getGameState = () => this.#gameState;

  // i18n helpers
  getNameWithArticle = () => this.i18n().indefArticle + " " + this.i18n().nameSingular;
  getNameSingular = () => this.i18n().nameSingular;
  getNamePlural = () => this.i18n().namePlural;

  // Amount manipulation
  addAmount = (amount: bigint) => {
    this.#nextValues.amount += amount;
    if (this.#nextValues.maximumAmount >= 0n && this.#nextValues.amount > this.#nextValues.maximumAmount) {
      this.#nextValues.amount = this.#nextValues.maximumAmount;
    }
  };
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

  // Purchasing
  isInStock = () => {
    return this.maximumStock < 0 || this.#nextValues.amount < this.maximumStock;
  }
  canPurchaseOne = () => {
    for (const cost of this.costToPurchaseOne) {
      if (cost.currency.getNextAmount() < cost.calculateCost(this.#gameState)) {
        return false;
      }
    }
    if (this.maximumStock >= 0 && this.#nextValues.amount >= this.maximumStock) {
      return false;
    }
    return true;
  };
  tryPurchaseOne = () => {
    if (this.canPurchaseOne()) {
      // TODO: There's definitely some sort of bug here with costs that calculate based off other currencies that are also costs, but there likely won't be any costs like that
      for (const cost of this.costToPurchaseOne) {
        cost.currency.#nextValues.amount -= cost.calculateCost(this.#gameState);
      }

      this.#nextValues.amount += 1n;
      this.#nextValues.amountPurchased += 1n;
      this.onAmountPurchased(1);
    }
  };

  // Revealed / hidden stuff
  calculateIsRevealed = () => false; // For use by things that reveal themselves on a condition
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

  // Handlers
  onAmountPurchased = (amount: number) => { };
}

export class Cost {
  currency: Currency;
  calculateCost = (gameState: GameState) => 0n;

  constructor(currency: Currency, calculateCostFunc: (_: GameState) => bigint) {
    this.currency = currency;
    this.calculateCost = calculateCostFunc;
  }
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

    let ownAmountText = "";
    if (currency.maximumStock === 1n) {
      // Use one-shot unlock style
      ownAmountText = currency.isInStock() ? "" : " (BOUGHT)";
    } else {
      ownAmountText = ` (Owned: ${currency.getCurrentAmount()})`
    }

    if (currency.getIsRevealed()) {
      const costAmount = Number(currency.costToPurchaseOne[0].calculateCost(currency.getGameState()));
      const costCurrency = currency.costToPurchaseOne[0].currency;
      return (
        <div className={"shop-box " + (currency.isInStock() ? "" : "out-of-stock ")}>
          <p>{currency.getNamePlural().toUpperCase()}{ownAmountText}</p>
          <p>Cost: {costAmount} {costCurrency.getNamePlural()}</p>
          <p>{currency.i18n().flavorText}</p>
          <p>{currency.i18n().shortEffectDescription}</p>
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