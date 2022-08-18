import { TOTER_DEBUG } from "../app";
import { AOI_DOG_AREA_EACH } from "../const";
import { AoiMinigameAreaState } from "../minigames/aoi-minigame";
import { IkuMinigameAreaState } from "../minigames/iku-minigame";
import { Cost, Currency } from "./currency";
import { registerAoiT1, registerAoiT2, registerIkuT1, registerIkuT2 } from "./currency-registry";
import { ResolvedValue } from "./resolved-value";

export class GameState {
  numCharacterUnlocks: number = TOTER_DEBUG ? 0 : 1;
  #charactersUnlocked: string[] = TOTER_DEBUG ? ["iku", "aoi"/*, "meno", "rita", "luto", "shiki", "nia", "yura", "pina"*/] : [];
  #currencies: Map<string, Currency> = new Map<string, Currency>();
  currencyDependents: Map<string, string[]> = new Map<string, string[]>();
  #resolvedValues: Map<string, ResolvedValue> = new Map<string, ResolvedValue>();
  valueDependents: Map<string, string[]> = new Map<string, string[]>();
  generators: Map<string, CurrencyGenerator> = new Map<string, CurrencyGenerator>();

  #undefinedCurrency = new Currency(this, "undefined");
  #undefinedResolvedValue = new ResolvedValue(this, "undefined", [], [], () => { return { amount: 0.0, explanation: "" } });

  // Stuff that explicitly does NOT get saved, used for persisting state of scenes across a session
  liveState: {
    ikuMinigame: IkuMinigameAreaState,
    aoiMinigame: AoiMinigameAreaState,
  } = {
      ikuMinigame: null,
      aoiMinigame: null,
    };

  constructor() {
    // Declare all Currencies and ResolvedValues
    this.registerCurrency(this.#undefinedCurrency);
    this.registerResolvedValue(this.#undefinedResolvedValue);

    registerAoiT1(this);
    registerAoiT2(this);
    registerIkuT1(this);
    registerIkuT2(this);

    // Calculate everything once! (Theoretically, everything is initialized dirty, but this is here just in case...)
    this.#resolvedValues.forEach((resolvedValue) => {
      resolvedValue.touch();
    });

    if (TOTER_DEBUG) {
      console.log(new Array(...this.#currencies.keys()));
      console.log(new Array(...this.#resolvedValues.keys()));
    }
  }

  registerCurrency = (currency: Currency) => {
    this.#currencies.set(currency.getId(), currency);
    if (!this.currencyDependents.has(currency.getId())) {
      this.currencyDependents.set(currency.getId(), []);
    }
  }
  #addCurrencyDependent = (dependencyCurrency: string, dependentValue: string) => {
    if (this.currencyDependents.has(dependencyCurrency)) {
      this.currencyDependents.get(dependencyCurrency).push(dependentValue);
    } else {
      this.currencyDependents.set(dependencyCurrency, [dependentValue]);
    }
  }
  registerResolvedValue = (resolvedValue: ResolvedValue) => {
    this.#resolvedValues.set(resolvedValue.getId(), resolvedValue);
    if (!this.valueDependents.has(resolvedValue.getId())) {
      this.valueDependents.set(resolvedValue.getId(), []);
    }
    resolvedValue.getDependencyCurrencies().forEach((dependency) => {
      this.#addCurrencyDependent(dependency, resolvedValue.getId())
    });
    resolvedValue.getDependencyValues().forEach((dependency) => {
      this.#addValueDependent(dependency, resolvedValue.getId())
    });
  }
  #addValueDependent = (dependencyValue: string, dependentValue: string) => {
    if (this.valueDependents.has(dependencyValue)) {
      this.valueDependents.get(dependencyValue).push(dependentValue);
    } else {
      this.valueDependents.set(dependencyValue, [dependentValue]);
    }
  }
  registerGenerator = (generator: CurrencyGenerator) => { this.generators.set(generator.getId(), generator) };

  getNumCharacterUnlocks = () => this.numCharacterUnlocks;
  doCharacterUnlock = (id: string) => {
    if (this.numCharacterUnlocks > 0) {
      this.numCharacterUnlocks -= 1;
      this.#charactersUnlocked.push(id);
    }
  }
  getCharactersUnlocked = () => this.#charactersUnlocked;
  getCurrency: (id: string) => Currency = (id: string) => {
    if (!this.#currencies.has(id)) {
      console.error(`GameState: Attempted to get unknown Currency with id \`${id}\``);
      return this.#undefinedCurrency;
    }
    return this.#currencies.get(id);
  }
  //getCurCur = (id: string) => this.getCurrency(id).getCurrentAmount();
  //getCurCurSh = (id: string) => this.getCurrency(id).getCurrentAmountShort();
  getResolvedValue: (id: string) => ResolvedValue = (id: string) => {
    if (!this.#resolvedValues.has(id)) {
      console.error(`GameState: Attempted to get unknown ResolvedValue with id \`${id}\``);
      return this.#undefinedResolvedValue;
    }
    return this.#resolvedValues.get(id);
  }
  //getRVRes = (id: string) => this.getResolvedValue(id).resolve();
  getGenerator = (id: string) => this.generators.get(id);

  gameTick = (time: number) => {
    ResolvedValue.numValuesRecalculated = 0;
    ResolvedValue.touchesPerformed = 0;

    this.generateCurrencies(time);

    // Lockstep update
    this.#currencies.forEach((currency) => {
      currency.clean();
      currency.swapFrameBuffer();
    });

    // console.log(ResolvedValue.numValuesRecalculated);
    // console.log(ResolvedValue.touchesPerformed);
  }

  generateCurrencies = (time: number) => {
    this.generators.forEach((generator) => {
      if (generator.enabled) {
        // Check that there are enough input amounts
        for (const input of generator.inputs) {
          if (this.getResolvedValue(input.resolvedValue).resolve() * time > this.getCurrency(input.currency).getNextAmount()) {
            return;
          }
        }

        // If there are, then subtract all the inputs and increment all the outputs
        generator.inputs.forEach((input) => {
          this.getCurrency(input.currency).addFractionalAmount(-1 * this.getResolvedValue(input.resolvedValue).resolve() * time);
        });
        generator.outputs.forEach((output) => {
          this.getCurrency(output.currency).addFractionalAmount(this.getResolvedValue(output.resolvedValue).resolve() * time);
        });
      }
    });
  }

  renderCosts = (costs: Cost[]) => {
    let retval = "";
    costs.forEach((cost) => {
      retval += cost.currency.getNameAmount(cost.calculateCost(this));
      retval += ", ";
    });
    return retval.slice(0, retval.length - 2);
  }

  // Aoi related stuff
  calculateNuggieDogCycleTime = () => {
    return 8.0 - 0.5 * this.getCurrency("aoi.nuggieDog1").getCurrentAmountShort();
  }
  calculateNuggieDogHitRadius = () => {
    return Math.sqrt(AOI_DOG_AREA_EACH * (this.getCurrency("aoi.nuggieDog2").getCurrentAmountShort() + 1));
  }
}

interface CurrencyValuePair {
  currency: string,
  resolvedValue: string,
}

export class CurrencyGenerator {
  #id: string;

  #gameState: GameState;
  enabled: boolean = true;
  inputs: CurrencyValuePair[] = [];
  outputs: CurrencyValuePair[] = [];

  constructor(gameState: GameState, id: string, inputs: CurrencyValuePair[], outputs: CurrencyValuePair[]) {
    this.#gameState = gameState;
    this.#id = id;
    this.inputs = inputs;
    this.outputs = outputs;
  }

  getId = () => this.#id;
}