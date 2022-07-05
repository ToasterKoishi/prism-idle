import { Currency } from "./currency";
import { GameState } from "./game-state";

type ResolutionFunction = (currencies: Map<string, bigint>, values: Map<string, number>) => { amount: number, explanation: string };

export const GENERATION_TYPE = {
  BASE_AMOUNT: 0,
  PERCENTAGE_ADDITIVE: 1,
  MULTIPLICATIVE: 2
}

export class ResolvedValue {
  #id: string;

  #gameState: GameState;
  #dependentCurrencies: string[] = [];
  #dependentValues: string[] = [];
  #resolutionFunction: ResolutionFunction;

  #isDirty: boolean = true;
  #value: number = 0.0;
  #explanation: string = "";

  constructor(gameState: GameState, id: string, dependentCurrencies: string[], dependentValues: string[], resolutionFunction: ResolutionFunction) {
    this.#gameState = gameState;
    this.#id = id;
    this.#dependentCurrencies = dependentCurrencies;
    this.#dependentValues = dependentValues;
    this.#resolutionFunction = resolutionFunction;
  }

  getId = () => this.#id;
  dirty = () => {
    this.#isDirty = true;
  }

  #recalculate = () => {
    const currencies = new Map<string, bigint>();
    const values = new Map<string, number>();
    this.#dependentCurrencies.forEach((currency) => {
      currencies.set(currency, this.#gameState.getCurrency(currency).getCurrentAmount());
    });
    this.#dependentValues.forEach((value) => {
      values.set(value, this.#gameState.getResolvedValue(value).resolve());
    });
    const retval = this.#resolutionFunction(currencies, values);

    this.#value = retval.amount;
    this.#explanation = retval.explanation;
    this.#isDirty = false;

    return retval;
  }

  resolve: () => number = () => {
    if (this.#isDirty) {
      return this.#recalculate().amount;
    } else {
      return this.#value;
    }
  };

  explain: () => string = () => {
    if (this.#isDirty) {
      return this.#recalculate().explanation;
    } else {
      return this.#explanation;
    }
  };
}
