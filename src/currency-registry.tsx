import { awowiName, awowiFullName, SMELL_WAFTER_MOVE_SPEED_BONUS_PERCENT, COMPRESSED_NUGGIE_1_RATE } from "./const";
import { Cost, Currency } from "./currency";
import { GameState } from "./gamestate";
import { costFuncEx } from "./minigames/util";

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
        flavorText: `If you try hard enough, you could argue that a nuggie is actually just multiple nuggies that are superglued together.`,
        shopBoxClass: "minigame-generator"
      }
    })
    .registerMaximumStock(20n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return costFuncEx(100, 10, gameState.getCurrency("compressedNuggies1").getNextPurchasedAmountShort(), 4);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("nuggie").getCurrentAmount() >= 50)
  );

  gameState.registerCurrency(new Currency(gameState, "compressedNuggies2")
    .registerI18N(() => {
      return {
        nameSingular: "Nuggie Topology",
        namePlural: "Nuggie Topology",
        indefArticle: "",
        shortEffectDescription: `Each compressed nuggie counts as 1 additional nuggie`,
        flavorText: `Studies in advanced topology allow us to argue that compressed nuggies are, in fact, an increasingly large number of nuggies superglued together.`,
        shopBoxClass: "minigame-generator"
      }
    })
    .registerMaximumStock(15n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return costFuncEx(100, 10, gameState.getCurrency("compressedNuggies2").getNextPurchasedAmountShort(), 3);
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
        shortEffectDescription: `Every ${gameState.calculateNuggieCycleTime()} seconds, spawn ${gameState.getCurrency("airFryer2").getCurrentAmount() + 1n} additional ${gameState.getCurrency("nuggie").getNameSingular()}`,
        flavorText: `Install an additional air fryer in ${awowiName}'s apartment. It periodically drops a cooked nuggie on the floor.`,
        shopBoxClass: "minigame-generator"
      }
    })
    .registerMaximumStock(30n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return costFuncEx(5, 10, gameState.getCurrency("airFryer").getNextPurchasedAmountShort(), 10);
      })
    ])
    .registerCalculateIsRevealed(() => true)
  );

  gameState.registerCurrency(new Currency(gameState, "airFryer1")
    .registerI18N(() => {
      return {
        nameSingular: "air fryer efficiency",
        namePlural: "air fryer efficiency",
        indefArticle: "",
        shortEffectDescription: `Reduce air fryer time to spawn nuggies by 0.1 seconds`,
        flavorText: `Better air fryer brands require less maintenance between cooking cycles.`,
        shopBoxClass: "minigame-generator"
      }
    })
    .registerMaximumStock(25n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return costFuncEx(500, 10, gameState.getCurrency("airFryer1").getNextPurchasedAmountShort(), 10);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("airFryer").getCurrentAmount() >= 20)
  );

  gameState.registerCurrency(new Currency(gameState, "airFryer2")
    .registerI18N(() => {
      return {
        nameSingular: "batch cooking",
        namePlural: "batch cooking",
        indefArticle: "",
        shortEffectDescription: `Increase nuggies spawned by air fryers by 1`,
        flavorText: `In the middle of the night, you were awoken by an eldritch thought. What if... instead of cooking one nuggie at a time in an air fryer... we cooked multiple? Each air fryer, could, in fact, hold up to 12 nuggies. Intense training will be required for each additional nuggie we put in.`,
        shopBoxClass: "minigame-generator"
      }
    })
    .registerMaximumStock(11n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return costFuncEx(2500, 100, gameState.getCurrency("airFryer2").getNextPurchasedAmountShort(), 11);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("airFryer").getCurrentAmount() >= 20)
  );

  gameState.registerCurrency(new Currency(gameState, "wcbonalds")
    .registerI18N(() => {
      return {
        nameSingular: "WcBonalds delivery",
        namePlural: "WcBonalds deliveries",
        indefArticle: "a",
        shortEffectDescription: `Every ${gameState.calculateNuggieDeliveryTime()} seconds, if ${awowiName} is at the door, delivers 50 ${gameState.getCurrency("nuggie").getNamePlural()}`,
        flavorText: `Constantly call for BooberYeets of 50-piece WcNuggies Combos to ${awowiName}'s apartment. However, ${awowiName} needs to be at the door when they arrive or else they won't deliver!`,
        shopBoxClass: "minigame-generator"
      }
    })
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return costFuncEx(100, 10, gameState.getCurrency("wcbonalds").getNextPurchasedAmountShort(), 5);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("nuggie").getCurrentAmount() >= 50)
  );

  gameState.registerCurrency(new Currency(gameState, "wcbonalds1")
    .registerI18N(() => {
      return {
        nameSingular: "delivery speed",
        namePlural: "delivery speed",
        indefArticle: "",
        shortEffectDescription: `Decrease time between deliveries by 5 seconds`,
        flavorText: `Make backdoor deals with BooberYeets and convince them to break the speed limit. Just slightly.`,
        shopBoxClass: "minigame-generator"
      }
    })
    .registerMaximumStock(6n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return costFuncEx(1000, 10, gameState.getCurrency("wcbonalds1").getNextPurchasedAmountShort(), 3);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("wcbonalds").getCurrentAmount() >= 5)
  );

  // "Motivation" stuff

  gameState.registerCurrency(new Currency(gameState, "motivationResearch")
    .registerI18N(() => {
      return {
        nameSingular: "motivation research",
        namePlural: "motivation research",
        indefArticle: "",
        shortEffectDescription: "Unlock motivation-boosting items",
        flavorText: `The mind of ${awowiFullName} is a mystery. By consuming ${gameState.getCurrency("nuggie").getNamePlural()}, we are able to get closer to her mindset, and gain insight into what we might to do motivate her to move faster.`,
        shopBoxClass: "minigame-buff"
      }
    })
    .registerMaximumStock(1n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (_) => 10n)
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("nuggie").getCurrentAmount() >= 10)
    .registerOnAmountPurchased(() => {
      gameState.getCurrency("smellWafter").setRevealed();
      gameState.getCurrency("nuggieFlavorTechnique").setRevealed();
      gameState.getCurrency("nuggieMagnet").setRevealed();
      gameState.getCurrency("nuggieDog").setRevealed();
    })
  );

  gameState.registerCurrency(new Currency(gameState, "smellWafter")
    .registerI18N(() => {
      return {
        nameSingular: "smell wafter",
        namePlural: "smell wafters",
        indefArticle: "a",
        shortEffectDescription: `Increase move speed by ${SMELL_WAFTER_MOVE_SPEED_BONUS_PERCENT}%`,
        flavorText: `Strategic placement of fans wafts the smell of nuggies towards ${awowiName}, increasing her motivation to move towards them.`,
        shopBoxClass: "minigame-buff"
      }
    })
    .registerMaximumStock(4n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return costFuncEx(20, 2, gameState.getCurrency("smellWafter").getNextPurchasedAmountShort(), 1);
      })
    ])
  );

  gameState.registerCurrency(new Currency(gameState, "nuggieDog")
    .registerI18N(() => {
      return {
        nameSingular: "Nuggie Support Dog",
        namePlural: "Nuggie Support Dog",
        indefArticle: "a",
        shortEffectDescription: `Hire a Nuggie Support Dog (NSD)`,
        flavorText: `We've trained a dog to pick up nuggies and bring them back to ${awowiName}. Her name is NSD (Nuggie Support Dog), and she's fast, smart, and works completely automatically!`,
        shopBoxClass: "minigame-buff"
      }
    })
    .registerMaximumStock(1n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => 100n)
    ])
    .registerOnAmountPurchased(() => {
      gameState.getCurrency("nuggieDog1").setRevealed();
      gameState.getCurrency("nuggieDog2").setRevealed();
    })
  );

  gameState.registerCurrency(new Currency(gameState, "nuggieDog1")
    .registerI18N(() => {
      return {
        nameSingular: "NSD speed training",
        namePlural: "NSD speed training",
        indefArticle: "a",
        shortEffectDescription: `Reduce NSD work cycle time by 0.5s (current: ${gameState.calculateNuggieDogCycleTime()}s)`,
        flavorText: `Advanced training courses for NSD increase her overall endurance.`,
        shopBoxClass: "minigame-buff"
      }
    })
    .registerMaximumStock(6n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return costFuncEx(100, 1000, gameState.getCurrency("nuggieDog1").getNextPurchasedAmountShort(), 6);
      })
    ])
  );

  gameState.registerCurrency(new Currency(gameState, "nuggieDog2")
    .registerI18N(() => {
      return {
        nameSingular: "NSD area training",
        namePlural: "NSD area training",
        indefArticle: "a",
        shortEffectDescription: `Increase area of NSD collection`,
        flavorText: `Advanced training courses for NSD increases the length of her legs. Yeah, don't ask how that works, we don't know and neither does NSD.`,
        shopBoxClass: "minigame-buff"
      }
    })
    .registerMaximumStock(5n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return costFuncEx(100, 1000, gameState.getCurrency("nuggieDog2").getNextPurchasedAmountShort(), 5);
      })
    ])
  );

  gameState.registerCurrency(new Currency(gameState, "nuggieFlavorTechnique")
    .registerI18N(() => {
      return {
        nameSingular: "Nuggie Flavorization Techniques",
        namePlural: "Nuggie Flavorization Techniques",
        indefArticle: "",
        shortEffectDescription: `Eating a nuggie provides a small burst of speed`,
        flavorText: `Research into NFTs (Nuggie Flavorization Techniques) has proven lucrative, and we have found ways to pack so much flavor into nuggies that it motivates ${awowiName} to move faster for a split second.`,
        shopBoxClass: "minigame-buff"
      }
    })
    .registerMaximumStock(8n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return costFuncEx(250, 2, gameState.getCurrency("nuggieFlavorTechnique").getNextPurchasedAmountShort(), 1);
      })
    ])
  );

  gameState.registerCurrency(new Currency(gameState, "nuggieMagnet")
    .registerI18N(() => {
      return {
        nameSingular: "nuggie magnetization",
        namePlural: "nuggie magnetization",
        indefArticle: "",
        shortEffectDescription: `Increase area of nuggie magnetization`,
        flavorText: `${awowiName} is notoriously difficult to motivate. So difficult, in fact, that it's been determined that it would be cheaper and more effective to find ways to bring the nuggies to her, than to bring her to the nuggies. To this end, a special suit tuned to the magnetic frequency of nuggies has been developed and stealthily strapped to ${awowiName}.`,
        shopBoxClass: "minigame-buff"
      }
    })
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return costFuncEx(1000, 2, gameState.getCurrency("nuggieMagnet").getNextPurchasedAmountShort(), 1);
      })
    ])
  );

  // DEBUG STUFF
  gameState.getCurrency("nuggie").addAmount(10000000000n);
  for (let i = 0; i < 10; i++) gameState.getCurrency("airFryer").tryPurchaseOne();
  gameState.getCurrency("wcbonalds").tryPurchaseOne();
  for (let i = 0; i < 4; i++) gameState.getCurrency("compressedNuggies1").tryPurchaseOne();
  gameState.getCurrency("motivationResearch").tryPurchaseOne();
  for (let i = 0; i < 4; i++) gameState.getCurrency("smellWafter").tryPurchaseOne();
  gameState.getCurrency("nuggieFlavorTechnique").tryPurchaseOne();
  gameState.getCurrency("nuggieDog").tryPurchaseOne();

}