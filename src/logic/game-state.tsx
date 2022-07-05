import { AOI_DOG_AREA_EACH, BASE_NUGGIE_TIMER, BASE_WCBONALDS_TIMER, VIRTUAL_BASE_AMOUNT } from "../const";
import { Cost, Currency } from "./currency";
import { ResolvedValue } from "./resolved-value";
import { registerAoiT1, registerAoiT2 } from "./currency-registry";

export class GameState {
  currencies: Map<string, Currency> = new Map<string, Currency>();
  resolvedValues: Map<string, ResolvedValue> = new Map<string, ResolvedValue>();
  generators: Map<string, CurrencyGenerator> = new Map<string, CurrencyGenerator>();

  constructor() {
    // Declare all Currencies
    this.registerCurrency(new Currency(this, VIRTUAL_BASE_AMOUNT)
      .registerI18N(() => {
        return {
          nameSingular: "base amount",
          namePlural: "base amount",
          indefArticle: "",
        }
      })
    );
    this.getCurrency(VIRTUAL_BASE_AMOUNT).addAmount(1n);

    registerAoiT1(this);
    registerAoiT2(this);
  }

  registerCurrency = (currency: Currency) => { this.currencies.set(currency.getId(), currency); }
  registerResolvedValue = (resolvedValue: ResolvedValue) => { this.resolvedValues.set(resolvedValue.getId(), resolvedValue); }
  registerGenerator = (generator: CurrencyGenerator) => { this.generators.set(generator.getId(), generator) };

  getCurrency = (id: string) => this.currencies.get(id);
  getResolvedValue = (id: string) => this.resolvedValues.get(id);
  getGenerator = (id: string) => this.generators.get(id);
  generateCurrencies = (time: number) => {
    this.generators.forEach((generator) => {
      if (generator.enabled) {
        // Check that there are enough input amounts
        for (const input of generator.inputs) {
          if (this.getResolvedValue(input.resolvedValue).resolve() * time > this.getCurrency(input.currency).getCurrentAmount()) {
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

  gameTick = (time: number) => {
    this.resolvedValues.forEach((resolvedValue) => {
      resolvedValue.dirty();
    })

    this.generateCurrencies(time);

    // Lockstep update
    this.currencies.forEach((currency) => {
      currency.swapFrameBuffer();
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
  calculateNuggiesPerCycle = () => {
    return 1 + this.getCurrency("airFryer").getCurrentAmountShort() * (this.getCurrency("airFryer2").getCurrentAmountShort() + 1);
  }
  calculateNuggieCycleTime = () => {
    return BASE_NUGGIE_TIMER - this.getCurrency("airFryer1").getCurrentAmountShort() * 0.1;
  }
  calculateNuggieDeliveryTime = () => {
    return BASE_WCBONALDS_TIMER - this.getCurrency("wcbonalds1").getCurrentAmountShort() * 5.0;
  }
  calculateNumNuggiesPerCompressedNuggie = () => {
    return this.getCurrency("compressedNuggies2").getNextPurchasedAmount() + 5n;
  }
  calculateNuggieDogCycleTime = () => {
    return 8.0 - 0.5 * this.getCurrency("nuggieDog1").getCurrentAmountShort();
  }
  calculateNuggieDogHitRadius = () => {
    return Math.sqrt(AOI_DOG_AREA_EACH * (this.getCurrency("nuggieDog2").getCurrentAmountShort() + 1));
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