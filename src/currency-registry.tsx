import { awowiName, awowiFullName, SMELL_WAFTER_MOVE_SPEED_BONUS_PERCENT, COMPRESSED_NUGGIE_1_RATE } from "./const";
import { Cost, Currency } from "./currency";
import { GameState } from "./gamestate";

export const registerAoi = (gameState: GameState) => {
  // Basic stuff

  gameState.registerCurrency(new Currency(gameState, "nuggie")
    .registerI18N(() => {
      return {
        nameSingular: "nuggie",
        namePlural: "nuggies",
        indefArticle: "a",
        shortEffectDescription: "",
        flavorText: ""
      }
    })
  );

  gameState.registerCurrency(new Currency(gameState, "compressedNuggies1")
    .registerI18N(() => {
      return {
        nameSingular: "Compressed Nuggies",
        namePlural: "Compressed Nuggies",
        indefArticle: "",
        shortEffectDescription: `Each nuggie has an additional ${COMPRESSED_NUGGIE_1_RATE}% chance of being compressed (counts as ${gameState.calculateNumNuggiesPerCompressedNuggie()} nuggies)`,
        flavorText: `If you try hard enough, you could argue that a nuggie is actually just multiple nuggies that are superglued together.`
      }
    })
    .registerMaximumStock(20n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return BigInt(Math.floor(100 * Math.pow(10, Number(gameState.getCurrency("compressedNuggies1").getNextPurchasedAmount()) / 4)));
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("nuggie").getCurrentAmount() >= 50)
  );

  gameState.registerCurrency(new Currency(gameState, "compressedNuggies2")
    .registerI18N(() => {
      return {
        nameSingular: "Compressed Nuggie Topology",
        namePlural: "Compressed Nuggie Topology",
        indefArticle: "",
        shortEffectDescription: `Each compressed nuggie counts as 1 additional nuggie`,
        flavorText: `Studies in advanced topology allow us to argue that compressed nuggies, are in fact, an increasingly large number of nuggies superglued together.`
      }
    })
    .registerMaximumStock(15n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return BigInt(Math.floor(100 * Math.pow(10, Number(gameState.getCurrency("compressedNuggies2").getNextPurchasedAmount()) / 3)));
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("compressedNuggies1").getCurrentAmount() >= 1)
  );

  // Minigame generators

  gameState.registerCurrency(new Currency(gameState, "airFryer")
    .registerI18N(() => {
      return {
        nameSingular: "air fryer",
        namePlural: "air fryers",
        indefArticle: "an",
        shortEffectDescription: `Every 5 seconds, spawn 1 additional ${gameState.getCurrency("nuggie").getNameSingular()}`,
        flavorText: `Install an additional air fryer in ${awowiName}'s apartment. It periodically drops a cooked nuggie on the floor.`
      }
    })
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return BigInt(Math.floor(5 * Math.pow(10, Number(gameState.getCurrency("airFryer").getNextPurchasedAmount()) / 10)));
      })
    ])
    .registerCalculateIsRevealed(() => true)
  );

  gameState.registerCurrency(new Currency(gameState, "wcbonalds")
    .registerI18N(() => {
      return {
        nameSingular: "WcBonalds Delivery",
        namePlural: "WcBonalds Deliveries",
        indefArticle: "a",
        shortEffectDescription: `Each minute, if ${awowiName} is at the door, yeets 50 ${gameState.getCurrency("nuggie").getNamePlural()}`,
        flavorText: `Constantly call for BooberYeets of 50-piece WcNuggies Combos to ${awowiName}'s apartment. However, ${awowiName} needs to be at the door when they arrive or else they won't deliver!`
      }
    })
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return BigInt(Math.floor(100 * Math.pow(10, Number(gameState.getCurrency("wcbonalds").getNextPurchasedAmount()) / 5)));
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("nuggie").getCurrentAmount() >= 50)
  );

  // "Motivation" stuff

  gameState.registerCurrency(new Currency(gameState, "motivationResearch")
    .registerI18N(() => {
      return {
        nameSingular: "motivation research",
        namePlural: "motivation research",
        indefArticle: "",
        shortEffectDescription: "Unlock motivation-boosting unlockables",
        flavorText: `The mind of ${awowiFullName} is a mystery. By consuming ${gameState.getCurrency("nuggie").getNamePlural()}, we are able to get closer to her mindset, and gain insight into what we might to do motivate her to move faster.`
      }
    })
    .registerMaximumStock(1n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => 10n)
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("nuggie").getCurrentAmount() >= 10)
    .registerOnAmountPurchased(() => {
      gameState.getCurrency("smellWafter").setRevealed();
    })
  );

  gameState.registerCurrency(new Currency(gameState, "smellWafter")
    .registerI18N(() => {
      return {
        nameSingular: "smell wafter",
        namePlural: "smell wafters",
        indefArticle: "a",
        shortEffectDescription: `Increase move speed by ${SMELL_WAFTER_MOVE_SPEED_BONUS_PERCENT}% (additive)`,
        flavorText: `Strategic placement of fans wafts the smell of nuggies towards ${awowiName}, increasing her motivation to move towards them.`
      }
    })
    .registerMaximumStock(4n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return BigInt(Math.floor(20 * Math.pow(2, Number(gameState.currencies.get("smellWafter").getNextPurchasedAmount()))));
      })
    ])
  );

  // DEBUG STUFF
  /*
  gameState.currencies.get("nuggie").addAmount(10000n);
  gameState.currencies.get("wcbonalds").tryPurchaseOne();
  gameState.currencies.get("compressedNuggies1").tryPurchaseOne();
  gameState.currencies.get("compressedNuggies1").tryPurchaseOne();
  gameState.currencies.get("compressedNuggies1").tryPurchaseOne();
  gameState.currencies.get("compressedNuggies1").tryPurchaseOne();
  gameState.currencies.get("motivationResearch").tryPurchaseOne();
  gameState.currencies.get("smellWafter").tryPurchaseOne();
  gameState.currencies.get("smellWafter").tryPurchaseOne();
  gameState.currencies.get("smellWafter").tryPurchaseOne();
  gameState.currencies.get("smellWafter").tryPurchaseOne();
  gameState.currencies.get("smellWafter").tryPurchaseOne();
  gameState.currencies.get("smellWafter").tryPurchaseOne();
  */
}