import { awowiFullName, awowiName, SMELL_WAFTER_MOVE_SPEED_BONUS_PERCENT } from "./const";
import { Cost, Currency } from "./currency";
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
    return 1 + Number(this.currencies.get("airFryer").getCurrentAmount());
  }
  calculateNumNuggiesPerCompressedNuggie = () => {
    return this.getCurrency("compressedNuggies2").getNextPurchasedAmount() + 2n;
  }
}