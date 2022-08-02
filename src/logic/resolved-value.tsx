import { GameState } from "./game-state";

type ResolutionFunction = (currencies: Map<string, bigint>, values: Map<string, number>, explains?: Map<string, string>) => { amount: number, explanation: string };

export const GENERATION_TYPE = {
  BASE_AMOUNT: 0,
  PERCENTAGE_ADDITIVE: 1,
  MULTIPLICATIVE: 2
}

export class ResolvedValue {
  static touchesPerformed: number = 0;
  static numValuesRecalculated: number = 0;

  #id: string;

  #gameState: GameState;
  #dependencyCurrencies: string[] = [];
  #dependencyValues: string[] = [];
  #resolutionFunction: ResolutionFunction;

  #isDirty: boolean = true;
  #value: number = 0.0;
  #explanation: string = "";

  constructor(gameState: GameState, id: string, dependentCurrencies: string[], dependentValues: string[], resolutionFunction: ResolutionFunction) {
    this.#gameState = gameState;
    this.#id = id;
    this.#dependencyCurrencies = dependentCurrencies;
    this.#dependencyValues = dependentValues;
    this.#resolutionFunction = resolutionFunction;
  }

  getId = () => this.#id;
  getDependencyCurrencies = () => this.#dependencyCurrencies;
  getDependencyValues = () => this.#dependencyValues;
  touch = () => {
    ResolvedValue.touchesPerformed++;
    if (!this.#isDirty) {
      this.#isDirty = true;
      this.#gameState.valueDependents.get(this.getId()).forEach((value) => {
        this.#gameState.getResolvedValue(value).touch();
      });
    }
  }

  #recalculate = () => {
    ResolvedValue.numValuesRecalculated++;

    const currencies = new Map<string, bigint>();
    const values = new Map<string, number>();
    const explains = new Map<string, string>();
    this.#dependencyCurrencies.forEach((currency) => {
      currencies.set(currency, this.#gameState.getCurrency(currency).getCurrentAmount());
    });
    this.#dependencyValues.forEach((value) => {
      values.set(value, this.#gameState.getResolvedValue(value).resolve());
      explains.set(value, this.#gameState.getResolvedValue(value).explain());
    });
    const retval = this.#resolutionFunction(currencies, values, explains);

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
