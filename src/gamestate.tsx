import { AOI_DOG_AREA_EACH, AOI_DOG_SPEED, BASE_NUGGIE_TIMER, BASE_WCBONALDS_TIMER } from "./const";
import { Currency } from "./currency";
import { registerAoi } from "./currency-registry";

export class GameState {
  currencies: Map<string, Currency> = new Map<string, Currency>();

  constructor() {
    // Declare all Currencies
    registerAoi(this);
  }

  registerCurrency = (currency: Currency) => { this.currencies.set(currency.getId(), currency); }
  getCurrency = (id: string) => this.currencies.get(id);

  // Aoi related stuff
  calculateNuggiesPerCycle = () => {
    return 1 + this.getCurrency("airFryer").getCurrentAmountShort() * (this.getCurrency("airFryer2").getCurrentAmountShort() + 1);
  }
  calculateNuggieCycleTime = () => {
    return BASE_NUGGIE_TIMER - this.getCurrency("airFryer1").getCurrentAmountShort()*0.1;
  }
  calculateNuggieDeliveryTime = () => {
    return BASE_WCBONALDS_TIMER - this.getCurrency("wcbonalds1").getCurrentAmountShort()*5.0;
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