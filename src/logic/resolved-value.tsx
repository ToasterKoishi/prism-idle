
import { TOTER_DEBUG } from "../const";
import { GameState } from "./game-state";

type ResolutionFunction = (currencies: MapWrapper<string, bigint>, values: MapWrapper<string, number>, explains?: Map<string, string>) => { amount: number, explanation: string };

export const GENERATION_TYPE = {
  BASE_AMOUNT: 0,
  PERCENTAGE_ADDITIVE: 1,
  MULTIPLICATIVE: 2
}

class MapWrapper<K, V> extends Map<K, V> {
  usedKeys: Set<K> = new Set<K>();
  get = (key: K) => {
    this.usedKeys.add(key);
    return super.get(key);
  }
  getLong = (key: K) => BigInt(Math.floor(Number(this.get(key))));
  getShort = (key: K) => Number(this.get(key));
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
    try {
      ResolvedValue.numValuesRecalculated++;

      const currencies = new MapWrapper<string, bigint>();
      const values = new MapWrapper<string, number>();
      const explains = new Map<string, string>();
      this.#dependencyCurrencies.forEach((currency) => {
        currencies.set(currency, this.#gameState.getCurrency(currency).getCurrentAmount());
      });
      this.#dependencyValues.forEach((value) => {
        values.set(value, this.#gameState.getResolvedValue(value).resolve());
        explains.set(value, this.#gameState.getResolvedValue(value).explain());
      });
      const retval = this.#resolutionFunction(currencies, values, explains);
      if (TOTER_DEBUG) {
        {
          const allKeys = new Set<string>(currencies.keys());
          currencies.usedKeys.forEach((key) => allKeys.delete(key));
          if (allKeys.size > 0) {
            console.log(`ResolvedValue \`${this.#id}\`: Unused currency keys: ${[...allKeys.values()]}`);
          }
        }
        {
          const allKeys = new Set<string>(values.keys());
          values.usedKeys.forEach((key) => allKeys.delete(key));
          if (allKeys.size > 0) {
            console.log(`ResolvedValue \`${this.#id}\`: Unused value keys: ${[...allKeys.values()]}`);
          }
        }
      }

      this.#value = retval.amount;
      this.#explanation = retval.explanation;
      this.#isDirty = false;

      return retval;
    } catch (e) {
      console.error(`ResolvedValue \`${this.#id}\`: Error occurred in resoluton function`)
      this.#value = 0.0;
      this.#explanation = "";
      this.#isDirty = false;
      return { amount: 0.0, explanation: "" };
    }
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
