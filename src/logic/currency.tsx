import { t } from "i18next";
import React from "react";
import { FancyText } from "../components/basic-components";
import { PURCHASE_WORDING_TYPE } from "../components/currency-purchase-component";
import { GameState } from "./game-state";

interface CurrencyI18N {
  interpolations?: () => Object,
  shopBoxClass?: string,
}

/**
 * Currency represents all obtainables in this game.
 */
export class Currency {
  // Display strings and stuff
  #id: string;
  i18n: CurrencyI18N = {
    interpolations: () => { return {} }
  }
  purchaseWordingType: number = 0;

  // Technical info
  #gameState: GameState;
  costToPurchaseOne: () => Cost[] = () => [];
  #isUnlocked: boolean = true; // Things can be revealed but still locked, and show an unlock condiiton
  unlockRequirements: Cost[] = [];
  #isRevealed: boolean = false;
  #isHidden: boolean = false; // Overrides isRevealed - if this is set, then it will never be shown

  // Lockstep values - the values of the next game tick will always be calculated from the current tick's values
  #isDirty: boolean = true;
  #currentValues = {
    fractionalAmount: 0,
    amount: 0n,
    amountPurchased: 0n,
    maximumAmount: -1n
  };
  #nextValues = {
    fractionalAmount: 0,
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
  registerI18N = (v: CurrencyI18N) => { this.i18n = { ...this.i18n, ...v }; return this; }
  registerPurchaseWordingType = (v: number) => { this.purchaseWordingType = v; return this; }
  registerMaximumStock = (v: bigint) => { this.maximumStock = v; return this; }
  registerCostToPurchaseOne = (v: Cost[] | (() => Cost[])) => {
    if (typeof v == "function") {
      this.costToPurchaseOne = v;
    } else {
      this.costToPurchaseOne = () => v;
    }
    return this;
  }
  registerCanPurchaseOne = (f: () => boolean) => { this.canPurchaseOne = f; return this; }
  registerUnlockRequirements = (v: Cost[]) => { this.#isUnlocked = false; this.unlockRequirements = v; return this; }
  registerCalculateIsRevealed = (f: () => boolean) => { this.calculateIsRevealed = f; return this; }
  registerOnAmountPurchased = (f: () => void) => { this.onAmountPurchased = f; return this; }

  getId = () => this.#id;
  getGameState = () => this.#gameState;
  isDirty = () => this.#isDirty;
  clean = () => { this.#isDirty = false; }

  // i18n helpers
  getNameWithArticle = () => t("currency." + this.#id + ".indefArticle") + " " + t("currency." + this.#id + ".name", { count: 1 });
  getNameSingular = () => t("currency." + this.#id + ".name", { count: 1 });
  getNamePlural = () => t("currency." + this.#id + ".name", { count: 0 });
  getNameAmount = (amount: number | bigint, useArticle: boolean = true) => {
    if (this.purchaseWordingType == PURCHASE_WORDING_TYPE.BUY) {
      if (amount == 1) {
        return (useArticle ? (t("currency." + this.#id + ".indefArticle") ? t("currency." + this.#id + ".indefArticle") + " " : "") : "1 ") + t("currency." + this.#id + ".name", { count: 1 });
      } else {
        return amount + " " + t("currency." + this.#id + ".name", { count: 0 });
      }
    } else if (this.purchaseWordingType == PURCHASE_WORDING_TYPE.LEARN) {
      return t("currency." + this.#id + ".name", { count: 1 }) + " Lv." + amount;
    }
  }
  getFancyTextName = (amount: number | bigint | string | boolean = null, options: { withIcon?: boolean, textModifier?: (_: string) => string, raw?: boolean } = {}) => {
    if (options.withIcon === undefined) {
      options.withIcon = true;
    }
    if (options.textModifier === undefined) {
      options.textModifier = (_) => _;
    }
    if (options.raw === undefined) {
      options.raw = false;
    }
    if (typeof amount === "boolean") {
      amount = this.getCurrentAmount();
    }
    const hasAmount = amount !== undefined && amount !== null;
    const amountIsNumerical = hasAmount && typeof amount !== "string";
    const rawText = options.textModifier(t(`currency.${this.getId()}${options.withIcon ? ".withIcon" : ""}.name${hasAmount ? "Count" : ""}${hasAmount && !amountIsNumerical ? "_amount" : ""}`, { amount: hasAmount && !amountIsNumerical ? amount : undefined, count: amountIsNumerical ? Number(amount) : 0 }));
    return options.raw ? rawText : (<FancyText rawText={rawText} />);
  }

  // Amount manipulation
  addAmount = (amount: bigint) => {
    if (amount < 0) {
      throw new Error("Attempted to add negative bigint amount to currency");
    }
    this.#nextValues.amount += amount;
    if (this.#nextValues.maximumAmount >= 0n && this.#nextValues.amount > this.#nextValues.maximumAmount) {
      this.#nextValues.amount = this.#nextValues.maximumAmount;
    }
  };
  addFractionalAmount = (amount: number) => {
    if (amount >= 0.0) {
      this.#nextValues.fractionalAmount += amount;
      if (this.#nextValues.fractionalAmount >= 1.0) {
        const intAmount = BigInt(Math.floor(this.#nextValues.fractionalAmount));
        const floatAmount = this.#nextValues.fractionalAmount % 1.0;
        this.#nextValues.amount += intAmount;
        this.#nextValues.fractionalAmount = floatAmount;
      }
      if (this.#nextValues.maximumAmount >= 0n && this.#nextValues.amount >= this.#nextValues.maximumAmount) {
        this.#nextValues.amount = this.#nextValues.maximumAmount;
        this.#nextValues.fractionalAmount = 0.0;
      }
    } else {
      this.#nextValues.fractionalAmount += amount;
      if (this.#nextValues.fractionalAmount < 0.0) {
        const intAmount = BigInt(Math.ceil(this.#nextValues.fractionalAmount) - 1);
        const floatAmount = (this.#nextValues.fractionalAmount % 1.0) + 1;
        this.#nextValues.amount += intAmount;
        if (this.#nextValues.amount < 0) {
          this.#nextValues.amount = 0n;
          this.#nextValues.fractionalAmount = 0.0;
        } else {
          this.#nextValues.fractionalAmount = floatAmount;
        }
      }
    }
  };
  getCurrentAmount = () => this.#currentValues.amount;
  getCurrentAmountShort = () => Number(this.#currentValues.amount);
  getCurrentPurchasedAmount = () => this.#currentValues.amountPurchased;
  getNextAmount = () => this.#nextValues.amount;
  getNextPurchasedAmount = () => this.#nextValues.amountPurchased;
  getNextPurchasedAmountShort = () => Number(this.#nextValues.amountPurchased);
  swapFrameBuffer = () => {
    if (
      this.#currentValues.fractionalAmount != this.#nextValues.fractionalAmount ||
      this.#currentValues.amount != this.#nextValues.amount ||
      this.#currentValues.amountPurchased != this.#nextValues.amountPurchased ||
      this.#currentValues.maximumAmount != this.#nextValues.maximumAmount) {
      this.#isDirty = true;
      this.getGameState().currencyDependents.get(this.getId()).forEach((value) => {
        this.getGameState().getResolvedValue(value).touch();
      });
    }

    this.#currentValues.fractionalAmount = this.#nextValues.fractionalAmount;
    this.#currentValues.amount = this.#nextValues.amount;
    this.#currentValues.amountPurchased = this.#nextValues.amountPurchased;
    this.#currentValues.maximumAmount = this.#nextValues.maximumAmount;
  }

  // Purchasing
  getMaximumStock = () => this.maximumStock;
  isInStock = () => {
    return this.maximumStock < 0 || this.#nextValues.amount < this.maximumStock;
  }
  canPurchaseOne = () => {
    if (!this.calculateIsUnlocked()) {
      return false;
    }
    for (const cost of this.costToPurchaseOne()) {
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
      for (const cost of this.costToPurchaseOne()) {
        cost.currency.#nextValues.amount -= cost.calculateCost(this.#gameState);
      }

      this.#nextValues.amount += 1n;
      this.#nextValues.amountPurchased += 1n;
      this.onAmountPurchased(1);
    }
  };

  // Revealed / hidden stuff
  calculateIsUnlocked = () => {
    for (const cost of this.unlockRequirements) {
      if (cost.currency.getNextAmount() < cost.calculateCost(this.#gameState)) {
        return false;
      }
    }
    return true;
  };
  getIsUnlocked = () => {
    if (this.#isUnlocked) {
      return true;
    } else {
      if (this.calculateIsUnlocked()) {
        this.#isUnlocked = true;
        return true;
      } else {
        return false;
      }
    }
  }
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