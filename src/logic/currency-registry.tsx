import { awowiName, awowiFullName, SMELL_WAFTER_MOVE_SPEED_BONUS_PERCENT, COMPRESSED_NUGGIE_1_RATE, VIRTUAL_BASE_AMOUNT, BASE_NUGGIE_TIMER, BASE_WCBONALDS_TIMER } from "../const";
import { Cost, Currency } from "./currency";
import { ResolvedValue, GENERATION_TYPE } from "./resolved-value";
import { CurrencyGenerator, GameState } from "./game-state";
import { costFuncEx } from "../util";
import { PURCHASE_WORDING_TYPE } from "../components/currency-purchase-component";

export const registerAoiT1 = (gameState: GameState) => {
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

  // Values, etc

  gameState.registerResolvedValue(new ResolvedValue(gameState, "nuggieGeneratorBase",
    ["aoiRhythmGames"],
    ["airFryerAmount", "airFryerRate", "wcbonaldsAmount", "wcbonaldsRate", "compressedNuggiesAmount", "compressedNuggiesRate", "nuggieGlobalPercent"],
    (currencies, values) => {
      const numberOfFloorNuggies =
        values.get("airFryerAmount") / values.get("airFryerRate") +
        values.get("wcbonaldsAmount") / values.get("wcbonaldsRate");
      const actualNuggieCurrencyAmount = numberOfFloorNuggies *
        values.get("nuggieGlobalPercent") *
        (values.get("compressedNuggiesAmount") * values.get("compressedNuggiesRate") + (1.0 - values.get("compressedNuggiesRate"))) *
        (1.0 + 5 * Number(currencies.get("aoiRhythmGames")) * 0.01);
      return { amount: Number(actualNuggieCurrencyAmount), explanation: `${gameState.getCurrency("nuggie").getNamePlural()}: ${actualNuggieCurrencyAmount}/s` };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "nuggieGeneratorMulti",
    ["smellWafter", "nuggieDog", "nuggieDog1", "nuggieDog2", "nuggieFlavorTechnique", "nuggieMagnet", "aoiBackseating"],
    [],
    (currencies, values) => {
      const amount =
        0.5 / 33.0 * Number(
          currencies.get("smellWafter") +
          (BigInt(!!currencies.get("nuggieDog")) * (currencies.get("nuggieDog1") + currencies.get("nuggieDog2"))) +
          currencies.get("nuggieFlavorTechnique") +
          currencies.get("nuggieMagnet")) +
        Number(currencies.get("aoiBackseating")) * 0.2 / 10.0;
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "nuggieGlobalPercent",
    ["aoiMunchies", "aoiMunchies2"],
    [],
    (currencies, values) => {
      const amount = 1.0 +
        Number(currencies.get("aoiMunchies")) * 0.25 +
        Number(currencies.get("aoiMunchies2")) * 0.1;
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "nuggieGenerator",
    [],
    ["nuggieGeneratorBase", "nuggieGeneratorMulti"],
    (currencies, values) => {
      const amount = values.get("nuggieGeneratorBase") * values.get("nuggieGeneratorMulti");
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "airFryerAmount",
    ["airFryer", "airFryer2"],
    [],
    (currencies, values) => {
      const amount = 1n +
        currencies.get("airFryer") * (currencies.get("airFryer2") + 1n);
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "airFryerRate",
    ["airFryer1"],
    [],
    (currencies, values) => {
      const amount =
        BASE_NUGGIE_TIMER - Number(currencies.get("airFryer1")) * 0.1;
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "wcbonaldsAmount",
    ["wcbonalds"],
    [],
    (currencies, values) => {
      const amount =
        currencies.get("wcbonalds") * 50n;
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "wcbonaldsRate",
    ["wcbonalds1", "aoiMunchies2"],
    [],
    (currencies, values) => {
      const amount =
        BASE_WCBONALDS_TIMER - Number(currencies.get("wcbonalds1")) * 5.0 - Number(currencies.get("aoiMunchies2")) * 2.5;
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "compressedNuggiesAmount",
    ["compressedNuggies2"],
    [],
    (currencies, values) => {
      const amount =
        5n + currencies.get("compressedNuggies2");
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "compressedNuggiesRate",
    ["compressedNuggies1"],
    [],
    (currencies, values) => {
      const amount =
        COMPRESSED_NUGGIE_1_RATE * Number(currencies.get("compressedNuggies1")) / 100.0;
      return { amount: Number(amount), explanation: "" };
    }
  ));

  gameState.registerGenerator(new CurrencyGenerator(gameState, "nuggie",
    [],
    [{ currency: "nuggie", resolvedValue: "nuggieGenerator" }]
  ));
  gameState.getGenerator("nuggie").enabled = false;

  // Basic stuff

  gameState.registerCurrency(new Currency(gameState, "compressedNuggies1")
    .registerI18N(() => {
      return {
        nameSingular: "Compressed Nuggies",
        namePlural: "Compressed Nuggies",
        indefArticle: "",
        shortEffectDescription: `Each nuggie has an additional ${COMPRESSED_NUGGIE_1_RATE}% chance of being compressed (counts as ${gameState.getResolvedValue("compressedNuggiesAmount").resolve()} nuggies)`,
        flavorText: `If you try hard enough, you could argue that a nuggie is actually just multiple nuggies that are superglued together.`,
        shopBoxClass: "minigame-generator"
      }
    })
    .registerMaximumStock(20n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return costFuncEx(100, 10, gameState.getCurrency("compressedNuggies1").getNextPurchasedAmountShort(), 3.9);
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
    //.registerMaximumStock(15n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return costFuncEx(100, 10, gameState.getCurrency("compressedNuggies2").getNextPurchasedAmountShort(), 2.9);
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
        shortEffectDescription: `Every ${gameState.getResolvedValue("airFryerRate").resolve().toFixed(1)} seconds, spawn an additional ${gameState.getCurrency("nuggie").getNameAmount(gameState.getCurrency("airFryer2").getCurrentAmount() + 1n, false)}`,
        flavorText: `Install an additional air fryer in ${awowiName}'s apartment. It periodically drops a cooked nuggie on the floor.`,
        shopBoxClass: "minigame-generator"

      }
    })
    .registerMaximumStock(30n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return costFuncEx(5, 10, gameState.getCurrency("airFryer").getNextPurchasedAmountShort(), 9.9);
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
        shortEffectDescription: `Decrease air fryer time to spawn nuggies by 0.1 seconds`,
        flavorText: `Better air fryer brands require less maintenance between cooking cycles.`,
        shopBoxClass: "minigame-generator"
      }
    })
    .registerMaximumStock(25n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return costFuncEx(500, 10, gameState.getCurrency("airFryer1").getNextPurchasedAmountShort(), 9.9);
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
        return costFuncEx(2500, 100, gameState.getCurrency("airFryer2").getNextPurchasedAmountShort(), 10.9);
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
        shortEffectDescription: `Every ${gameState.getResolvedValue("wcbonaldsRate").resolve()} seconds, if ${awowiName} is at the door, delivers 50 ${gameState.getCurrency("nuggie").getNamePlural()}`,
        flavorText: `Constantly call for BooberYeets of 50-piece WcNuggies Combos to ${awowiName}'s apartment. However, ${awowiName} needs to be at the door when they arrive or else they won't deliver!`,
        shopBoxClass: "minigame-generator"
      }
    })
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return costFuncEx(100, 10, gameState.getCurrency("wcbonalds").getNextPurchasedAmountShort(), 4.9);
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
        return costFuncEx(1000, 10, gameState.getCurrency("wcbonalds1").getNextPurchasedAmountShort(), 2.9);
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
        shortEffectDescription: `Decrease NSD work cycle time by 0.5 seconds (Current: ${gameState.calculateNuggieDogCycleTime().toFixed(1)}s)`,
        flavorText: `Advanced training courses for NSD increase her overall endurance.`,
        shopBoxClass: "minigame-buff"
      }
    })
    .registerMaximumStock(6n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return costFuncEx(100, 1000, gameState.getCurrency("nuggieDog1").getNextPurchasedAmountShort(), 5.9);
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
        return costFuncEx(100, 1000, gameState.getCurrency("nuggieDog2").getNextPurchasedAmountShort(), 4.9);
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

  gameState.registerCurrency(new Currency(gameState, "aoiT2Unlock")
    .registerI18N(() => {
      return {
        nameSingular: "Unlock Tier II",
        namePlural: "Unlock Tier II",
        indefArticle: "",
        shortEffectDescription: `Allows collection of ${awowiName}'s Tier II currency, Heckies. Also allows toggling passive mode for ${awowiName}'s Room.`,
        flavorText: ``,
        shopBoxClass: "tier-two-unlock"
      }
    })
    .registerMaximumStock(1n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (_) => 50000n)
    ])
    .registerCalculateIsRevealed(() => true)
    .registerOnAmountPurchased(() => {
      gameState.getCurrency("heckie").setRevealed();
      gameState.getCurrency("heckieGenerator1").setRevealed();
      gameState.getCurrency("heckieGenerator2").setRevealed();
      gameState.getCurrency("heckieGenerator3").setRevealed();
    })
  );
}

export const registerAoiT2 = (gameState: GameState) => {
  const SCALING_RATE = 10.0;
  const SCALING_OVER = 7.4;

  gameState.registerCurrency(new Currency(gameState, "heckie")
    .registerI18N(() => {
      return {
        nameSingular: "heckie",
        namePlural: "heckies",
        indefArticle: "a",
        shortEffectDescription: "",
        flavorText: ""
      }
    })
  );
  gameState.registerResolvedValue(new ResolvedValue(gameState, "heckieGeneratorIn",
    ["aoiMunchies3"],
    ["heckieGenerator"],
    (currencies, values) => {
      const amount = values.get("heckieGenerator") *
        (1.0 - 0.05 * Number(currencies.get("aoiMunchies3")));
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "heckieGeneratorOut",
    ["aoiKaraoke"],
    ["heckieGenerator"],
    (currencies, values) => {
      const amount = values.get("heckieGenerator") * (1.0 +
        Number(currencies.get("aoiKaraoke")) * 0.1);
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "heckieGenerator",
    ["heckieGenerator1", "heckieGenerator2", "heckieGenerator3", "aoiBullying"],
    ["heckieGenerator1Each", "heckieGenerator2Each", "heckieGenerator3Each"],
    (currencies, values) => {
      const baseAmount =
        Number(currencies.get("heckieGenerator1")) * values.get("heckieGenerator1Each") +
        Number(currencies.get("heckieGenerator2")) * values.get("heckieGenerator2Each") +
        Number(currencies.get("heckieGenerator3")) * values.get("heckieGenerator3Each");
      const amount = baseAmount * (1.0 +
        Number(currencies.get("aoiBullying")) * 0.25
      );
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "heckieGenerator1Each",
    ["hiGuys", "konkonmori"],
    [],
    (currencies, values) => {
      const amount = 1n +
        (currencies.get("hiGuys") * (1n + currencies.get("konkonmori")));
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "heckieGenerator2Each",
    ["heckieGenerator1", "heckieGenerator2", "heckieGenerator3", "aoiStreamDelay", "aoiStreamDelay2", "aoiStreamDelay3"],
    ["heckieGenerator1Each", "heckieGenerator3Each"],
    (currencies, values) => {
      const amount = 1n +
        currencies.get("heckieGenerator2") * currencies.get("aoiStreamDelay") +
        (currencies.get("heckieGenerator1") + currencies.get("heckieGenerator2") + currencies.get("heckieGenerator3")) * currencies.get("aoiStreamDelay2") +
        (currencies.get("heckieGenerator1") * BigInt(values.get("heckieGenerator1Each")) + currencies.get("heckieGenerator3") * BigInt(values.get("heckieGenerator3Each"))) * currencies.get("aoiStreamDelay3");
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "heckieGenerator3Each",
    [],
    [],
    (currencies, values) => {
      const amount = 1n;
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerGenerator(new CurrencyGenerator(gameState, "heckie",
    [{ currency: "nuggie", resolvedValue: "heckieGeneratorIn" }],
    [{ currency: "heckie", resolvedValue: "heckieGeneratorOut" }]
  ));

  gameState.registerCurrency(new Currency(gameState, "heckieGenerator1")
    .registerI18N(() => {
      return {
        nameSingular: "Endless Zatsudan",
        namePlural: "Endless Zatsudan",
        indefArticle: "",
        shortEffectDescription: `Per level: Increase Heckie conversion rate by ${gameState.getResolvedValue("heckieGenerator1Each").resolve()} per second`,
        flavorText: `${awowiName}'s ability to talk forever (usually about food) despite all circumstances surely brings a heckie to her Timekeepers' lips.`,
        shopBoxClass: "minigame-generator"
      }
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    //.registerMaximumStock(30n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return costFuncEx(1000, SCALING_RATE, gameState.getCurrency("heckieGenerator1").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
  );

  gameState.registerCurrency(new Currency(gameState, "heckieGenerator2")
    .registerI18N(() => {
      return {
        nameSingular: "Timekeeping",
        namePlural: "Timekeeping",
        indefArticle: "",
        shortEffectDescription: `Per level: Increase Heckie conversion rate by ${gameState.getResolvedValue("heckieGenerator2Each").resolve()} per second`,
        flavorText: `The art of keeping time is one of the arts of all time. Fortunately for Timekeepers, ${awowiName} is extremely good at it.`,
        shopBoxClass: "minigame-generator"
      }
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    //.registerMaximumStock(30n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return costFuncEx(1000, SCALING_RATE, gameState.getCurrency("heckieGenerator2").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
  );

  gameState.registerCurrency(new Currency(gameState, "heckieGenerator3")
    .registerI18N(() => {
      return {
        nameSingular: "Negative Gaming Skill",
        namePlural: "Negative Gaming Skill",
        indefArticle: "",
        shortEffectDescription: `Per level: Increase Heckie conversion rate by ${gameState.getResolvedValue("heckieGenerator3Each").resolve()} per second`,
        flavorText: `If one is good at being bad at something, does that mean that you are simply bad at something, or does the fact that you are good at being bad mean that you are actually good at something? Semanticists continue to argue about this, and a billion other useless things, every day.`,
        shopBoxClass: "minigame-generator"
      }
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    //.registerMaximumStock(30n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return costFuncEx(1000, SCALING_RATE, gameState.getCurrency("heckieGenerator3").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
  );

  gameState.registerCurrency(new Currency(gameState, "hiGuys")
    .registerI18N(() => {
      return {
        nameSingular: "Hi guys!",
        namePlural: "Hi guys!",
        indefArticle: "",
        shortEffectDescription: `Per level: Increase conversion rate of each level of ${gameState.getCurrency("heckieGenerator1").getNameSingular()} by ${gameState.getCurrency("konkonmori").getCurrentAmountShort() + 1}/s`,
        flavorText: `Who is Guys and why are they Hi?`,
        shopBoxClass: "minigame-buff"
      }
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("heckie"), (gameState) => {
        return costFuncEx(500, SCALING_RATE, gameState.getCurrency("hiGuys").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("heckieGenerator1"), (_) => 10n)
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("heckieGenerator1").getCurrentAmount() >= 5)
  );

  gameState.registerCurrency(new Currency(gameState, "konkonmori")
    .registerI18N(() => {
      return {
        nameSingular: "Konkonmori",
        namePlural: "Konkonmori",
        indefArticle: "",
        shortEffectDescription: `Per level: Increase conversion rate granted by each level of ${gameState.getCurrency("hiGuys").getNameSingular()} by 1/s`,
        flavorText: ``,
        shopBoxClass: "minigame-buff"
      }
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("heckie"), (gameState) => {
        return costFuncEx(50000, SCALING_RATE, gameState.getCurrency("konkonmori").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("hiGuys"), (_) => 5n),
      new Cost(gameState.getCurrency("heckieGenerator1"), (_) => 20n),
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("hiGuys").getCurrentAmount() >= 1)
  );

  gameState.registerCurrency(new Currency(gameState, "aoiStreamDelay")
    .registerI18N(() => {
      return {
        nameSingular: "Stream Delaying",
        namePlural: "Stream Delaying",
        indefArticle: "",
        shortEffectDescription: `Increase conversion rate of each level of ${gameState.getCurrency("heckieGenerator2").getNameSingular()} by the level of ${gameState.getCurrency("heckieGenerator2").getNameSingular()}`,
        flavorText: `Delaying the start of a stream really sells it to Timekeepers just how good ${awowiName} is at keeping (the amount of) time (that is being delayed a high number).`,
        shopBoxClass: "minigame-buff"
      }
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerMaximumStock(1n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("heckie"), (gameState) => {
        return costFuncEx(2000, SCALING_RATE, gameState.getCurrency("aoiStreamDelay").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("heckieGenerator2"), (_) => 10n)
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("heckieGenerator2").getCurrentAmount() >= 5)
  );

  gameState.registerCurrency(new Currency(gameState, "aoiStreamDelay2")
    .registerI18N(() => {
      return {
        nameSingular: "Schedule Delaying",
        namePlural: "Schedule Delaying",
        indefArticle: "",
        shortEffectDescription: `Increase conversion rate of each level of ${gameState.getCurrency("heckieGenerator2").getNameSingular()} by the sum of levels of ${gameState.getCurrency("heckieGenerator1").getNameSingular()}, ${gameState.getCurrency("heckieGenerator2").getNameSingular()}, and ${gameState.getCurrency("heckieGenerator3").getNameSingular()}`,
        flavorText: `Further confuse and confound Timekeepers by delaying schedule posts so much that they come out after some of this week's streams have already been streamed. Even better, put up a schedule after every stream already happened!`,
        shopBoxClass: "minigame-buff"
      }
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerMaximumStock(1n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("heckie"), (gameState) => {
        return costFuncEx(1000000, SCALING_RATE, gameState.getCurrency("aoiStreamDelay2").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("aoiStreamDelay"), (_) => 1n),
      new Cost(gameState.getCurrency("heckieGenerator2"), (_) => 30n)
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("aoiStreamDelay").getCurrentAmount() >= 1)
  );

  // UNUSED
  gameState.registerCurrency(new Currency(gameState, "aoiStreamDelay3")
    .registerI18N(() => {
      return {
        nameSingular: "Life-Saving Medication Delaying",
        namePlural: "Life-Saving Medication Delaying",
        indefArticle: "",
        shortEffectDescription: `Increase conversion rate of each level of ${gameState.getCurrency("heckieGenerator2").getNameSingular()} by the sum of the total conversion rate of all levels of ${gameState.getCurrency("heckieGenerator1").getNameSingular()} and ${gameState.getCurrency("heckieGenerator3").getNameSingular()}`,
        flavorText: `In a display of ultimate dominance over her ability to keep time, ${awowiName} simply refuses to obtain medication for an allergy that could end her life. After all, one who keeps the time can simply keep it so still as to infinitely delay any inevitability.`,
        shopBoxClass: "minigame-buff"
      }
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    //.registerMaximumStock(1n)
    .registerMaximumStock(0n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("heckie"), (gameState) => {
        return costFuncEx(2500000, SCALING_RATE, gameState.getCurrency("aoiStreamDelay3").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("aoiStreamDelay2"), (_) => 1n),
      new Cost(gameState.getCurrency("heckieGenerator2"), (_) => 50n)
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("aoiStreamDelay2").getCurrentAmount() >= 5)
  );

  gameState.registerCurrency(new Currency(gameState, "aoiBackseating")
    .registerI18N(() => {
      return {
        nameSingular: "Backseating",
        namePlural: "Backseating",
        indefArticle: "",
        shortEffectDescription: `Per level: Increase ${awowiName}'s Room passive motivation multiplier by 0.02`,
        flavorText: `While ${awowiName}'s success (or lack thereof) still largely depends on her own gaming skill, having a dedicated team of backseating Timekeepers definitely helps her get things done slightly more efficiently.`,
        shopBoxClass: "minigame-buff"
      }
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("heckie"), (gameState) => {
        return costFuncEx(500, SCALING_RATE, gameState.getCurrency("aoiBackseating").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("heckieGenerator3"), (_) => 10n),
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("heckieGenerator3").getCurrentAmount() >= 5)
  );

  gameState.registerCurrency(new Currency(gameState, "aoiKaraoke")
    .registerI18N(() => {
      return {
        nameSingular: "Queen of Song",
        namePlural: "Queen of Song",
        indefArticle: "",
        shortEffectDescription: `Per level: Increase Heckie output rate by 10%`,
        flavorText: ``,
        shopBoxClass: "minigame-buff"
      }
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("heckie"), (gameState) => {
        return costFuncEx(50000, SCALING_RATE, gameState.getCurrency("aoiKaraoke").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("heckieGenerator1"), (_) => 20n),
      new Cost(gameState.getCurrency("heckieGenerator2"), (_) => 20n),
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("heckieGenerator1").getCurrentAmount() >= 20 || gameState.getCurrency("heckieGenerator2").getCurrentAmount() >= 20)
  );

  gameState.registerCurrency(new Currency(gameState, "aoiBullying")
    .registerI18N(() => {
      return {
        nameSingular: "Chat Bullies",
        namePlural: "Chat Bullies",
        indefArticle: "",
        shortEffectDescription: `Per level: Increase Heckie conversion rate by 25%`,
        flavorText: ``,
        shopBoxClass: "minigame-buff"
      }
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("heckie"), (gameState) => {
        return costFuncEx(50000, SCALING_RATE, gameState.getCurrency("aoiKaraoke").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("heckieGenerator1"), (_) => 20n),
      new Cost(gameState.getCurrency("heckieGenerator3"), (_) => 20n),
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("heckieGenerator1").getCurrentAmount() >= 20 || gameState.getCurrency("heckieGenerator3").getCurrentAmount() >= 20)
  );

  gameState.registerCurrency(new Currency(gameState, "aoiRhythmGames")
    .registerI18N(() => {
      return {
        nameSingular: "Pro Rhythm Gamer",
        namePlural: "Pro Rhythm Gamer",
        indefArticle: "",
        shortEffectDescription: `Enables combo system in ${awowiName}'s Room; Per level: Per combo, each floor nuggie is worth +0.01x nuggies. Passive mode treats combo as always being 5`,
        flavorText: ``,
        shopBoxClass: "minigame-buff"
      }
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("heckie"), (gameState) => {
        return costFuncEx(50000, SCALING_RATE, gameState.getCurrency("aoiRhythmGames").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("heckieGenerator2"), (_) => 20n),
      new Cost(gameState.getCurrency("heckieGenerator3"), (_) => 20n),
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("heckieGenerator2").getCurrentAmount() >= 20 || gameState.getCurrency("heckieGenerator3").getCurrentAmount() >= 20)
  );

  gameState.registerCurrency(new Currency(gameState, "aoiMunchies")
    .registerI18N(() => {
      return {
        nameSingular: "Post-Stream Munchies",
        namePlural: "Post-Stream Munchies",
        indefArticle: "",
        shortEffectDescription: `Per level: Increase nuggies gained from all sources by 25%`,
        flavorText: ``,
        shopBoxClass: "minigame-buff"
      }
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("heckie"), (gameState) => {
        return costFuncEx(1000, SCALING_RATE, gameState.getCurrency("aoiMunchies").getNextPurchasedAmountShort(), SCALING_OVER / 2);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("heckieGenerator1"), (_) => 5n),
      new Cost(gameState.getCurrency("heckieGenerator2"), (_) => 5n),
      new Cost(gameState.getCurrency("heckieGenerator3"), (_) => 5n),
    ])
    .registerCalculateIsRevealed(() => true)
  );

  gameState.registerCurrency(new Currency(gameState, "aoiMunchies2")
    .registerI18N(() => {
      return {
        nameSingular: "Mid-Stream Munchies",
        namePlural: "Mid-Stream Munchies",
        indefArticle: "",
        shortEffectDescription: `Per level: Decrease time between ${gameState.getCurrency("wcbonalds").getNamePlural()} by 2.5s, and increase nuggies gained from all sources by 10%`,
        flavorText: ``,
        shopBoxClass: "minigame-buff"
      }
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("heckie"), (gameState) => {
        return costFuncEx(100000, SCALING_RATE, gameState.getCurrency("aoiMunchies2").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("aoiMunchies"), (_) => 5n),
      new Cost(gameState.getCurrency("heckieGenerator1"), (_) => 15n),
      new Cost(gameState.getCurrency("heckieGenerator2"), (_) => 15n),
      new Cost(gameState.getCurrency("heckieGenerator3"), (_) => 15n),
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("aoiMunchies").getCurrentAmount() >= 1)
  );

  gameState.registerCurrency(new Currency(gameState, "aoiMunchies3")
    .registerI18N(() => {
      return {
        nameSingular: "Pre-Stream Munchies",
        namePlural: "Pre-Stream Munchies",
        indefArticle: "",
        shortEffectDescription: `Per level: Decrease Nuggie input rate by 5% (Current: x${(1.0 - gameState.getCurrency("aoiMunchies3").getCurrentAmountShort() * 0.05).toFixed(2)})`,
        flavorText: ``,
        shopBoxClass: "minigame-buff"
      }
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("heckie"), (gameState) => {
        return costFuncEx(100000, SCALING_RATE, gameState.getCurrency("aoiMunchies3").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("aoiMunchies2"), (_) => 5n),
      new Cost(gameState.getCurrency("heckieGenerator1"), (_) => 25n),
      new Cost(gameState.getCurrency("heckieGenerator2"), (_) => 25n),
      new Cost(gameState.getCurrency("heckieGenerator3"), (_) => 25n),
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("aoiMunchies2").getCurrentAmount() >= 1)
  );

  gameState.registerCurrency(new Currency(gameState, "aoiT3Unlock")
    .registerI18N(() => {
      return {
        nameSingular: "Unlock Tier III",
        namePlural: "Unlock Tier III",
        indefArticle: "",
        shortEffectDescription: ``,
        flavorText: ``,
        shopBoxClass: "tier-two-unlock"
      }
    })
    .registerMaximumStock(1n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("heckie"), (_) => 1000000n)
    ])
    .registerCalculateIsRevealed(() => true)
  );
}