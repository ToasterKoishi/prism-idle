import { awowiFullName, awowiName, SMELL_WAFTER_MOVE_SPEED_BONUS_PERCENT } from "./const";
import { Cost, Currency } from "./currency";

export class GameState {
  currencies: Map<string, Currency> = new Map<string, Currency>();

  constructor() {
    // Declare all Currencies
    const nuggie = new Currency(this);
    const airFryer = new Currency(this);
    const wcbonaldsDelivery = new Currency(this);
    const motivationResearch = new Currency(this);
    const smellWafter = new Currency(this);

    // Define all of them
    Object.assign(nuggie, {
      id: "nuggie",
      i18n: () => {
        return {
          nameSingular: "nuggie",
          namePlural: "nuggies",
          indefArticle: "a",
          shortEffectDescription: ""
        }
      }
    });

    Object.assign(airFryer, {
      id: "airFryer",
      i18n: () => {
        return {
          nameSingular: "air fryer",
          namePlural: "air fryers",
          indefArticle: "an",
          shortEffectDescription: `Spawn 1 additional ${nuggie.getNameSingular()} per 5 seconds`,
          flavorText: `Install an additional air fryer in ${awowiName}'s apartment. It periodically drops a cooked nuggie on the floor.`
        }
      },
      costToPurchaseOne: [
        new Cost(nuggie, (gameState) => {
          return Math.floor(5 * Math.pow(10, (gameState.currencies.get("airFryer").getNextPurchasedAmount()) / 10));
        })
      ],
      calculateIsRevealed: () => true
    });

    Object.assign(motivationResearch, {
      id: "motivationResearch",
      i18n: () => {
        return {
          nameSingular: "motivation research",
          namePlural: "motivation research",
          indefArticle: "",
          shortEffectDescription: "Unlock motivation-boosting unlockables",
          flavorText: `The mind of ${awowiFullName} is a mystery. By consuming ${nuggie.getNamePlural()}, we are able to get closer to her mindset, and gain insight into what we might to do motivate her to move faster.`
        }
      },
      costToPurchaseOne: [
        new Cost(nuggie, (gameState) => 50)
      ],
      calculateIsRevealed: () => nuggie.getCurrentAmount() >= 50,
      onAmountPurchased: () => {
        motivationResearch.setHidden();
        smellWafter.setRevealed();
      }
    });

    Object.assign(smellWafter, {
      id: "smellWafter",
      i18n: () => {
        return {
          nameSingular: "smell wafter",
          namePlural: "smell wafters",
          indefArticle: "a",
          shortEffectDescription: `Increase move speed by ${SMELL_WAFTER_MOVE_SPEED_BONUS_PERCENT}% (additive)`,
          flavorText: `Strategic placement of fans wafts the smell of nuggies towards ${awowiName}, increasing her motivation to move towards them.`
        }
      },
      costToPurchaseOne: [
        new Cost(nuggie, (gameState) => {
          return Math.floor(20 * Math.pow(10, (gameState.currencies.get("smellWafter").getNextPurchasedAmount()) / 10));
        })
      ]
    });

    // Register currencies
    this.currencies.set("nuggie", nuggie);
    this.currencies.set("airFryer", airFryer);
    this.currencies.set("motivationResearch", motivationResearch);
    this.currencies.set("smellWafter", smellWafter);

    //this.currencies.get("nuggie").addAmount(1000);
  }

  // Aoi related stuff
  calculateNuggiesPerCycle = () => {
    return 1 + this.currencies.get("airFryer").getCurrentAmount();
  }
  calculateMaxNuggiesOnScreen = () => {
    return 10 * this.calculateNuggiesPerCycle();
  }
}