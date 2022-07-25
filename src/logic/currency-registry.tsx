import { PURCHASE_WORDING_TYPE } from "../components/currency-purchase-component";
import { BASE_NUGGIE_TIMER, BASE_WCBONALDS_TIMER, COMPRESSED_NUGGIE_1_RATE, SMELL_WAFTER_MOVE_SPEED_BONUS_PERCENT } from "../const";
import { costFuncEx } from "../util";
import { Cost, Currency } from "./currency";
import { CurrencyGenerator, GameState } from "./game-state";
import { ResolvedValue } from "./resolved-value";

export const registerAoiT1 = (gameState: GameState) => {
  gameState.registerCurrency(new Currency(gameState, "nuggie"));

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
    .registerI18N({
      interpolations: () => {
        return {
          rate: COMPRESSED_NUGGIE_1_RATE,
          amount: gameState.getResolvedValue("compressedNuggiesAmount").resolve()
        }
      },
      shopBoxClass: "minigame-generator"
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
    .registerI18N({
      shopBoxClass: "minigame-generator"
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
    .registerI18N({
      interpolations: () => {
        return {
          rate: gameState.getResolvedValue("airFryerRate").resolve().toFixed(1),
          amount: gameState.getCurrency("airFryer2").getCurrentAmount() + 1n
        }
      },
      shopBoxClass: "minigame-generator"
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
    .registerI18N({
      shopBoxClass: "minigame-generator"
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
    .registerI18N({
      shopBoxClass: "minigame-generator"
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
    .registerI18N({
      interpolations: () => {
        return {
          rate: gameState.getResolvedValue("wcbonaldsRate").resolve()
        }
      },
      shopBoxClass: "minigame-generator"
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
    .registerI18N({
      shopBoxClass: "minigame-generator"
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
    .registerI18N({
      shopBoxClass: "minigame-buff"
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
    .registerI18N({
      interpolations: () => {
        return {
          amount: SMELL_WAFTER_MOVE_SPEED_BONUS_PERCENT
        }
      },
      shopBoxClass: "minigame-buff"
    })
    .registerMaximumStock(4n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return costFuncEx(20, 2, gameState.getCurrency("smellWafter").getNextPurchasedAmountShort(), 1);
      })
    ])
  );

  gameState.registerCurrency(new Currency(gameState, "nuggieDog")
    .registerI18N({
      shopBoxClass: "minigame-buff"
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
    .registerI18N({
      interpolations: () => {
        return {
          amount: gameState.calculateNuggieDogCycleTime().toFixed(1)
        }
      },
      shopBoxClass: "minigame-buff"
    })
    .registerMaximumStock(6n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return costFuncEx(100, 1000, gameState.getCurrency("nuggieDog1").getNextPurchasedAmountShort(), 5.9);
      })
    ])
  );

  gameState.registerCurrency(new Currency(gameState, "nuggieDog2")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerMaximumStock(5n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return costFuncEx(100, 1000, gameState.getCurrency("nuggieDog2").getNextPurchasedAmountShort(), 4.9);
      })
    ])
  );

  gameState.registerCurrency(new Currency(gameState, "nuggieFlavorTechnique")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerMaximumStock(8n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return costFuncEx(250, 2, gameState.getCurrency("nuggieFlavorTechnique").getNextPurchasedAmountShort(), 1);
      })
    ])
  );

  gameState.registerCurrency(new Currency(gameState, "nuggieMagnet")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("nuggie"), (gameState) => {
        return costFuncEx(1000, 2, gameState.getCurrency("nuggieMagnet").getNextPurchasedAmountShort(), 1);
      })
    ])
  );

  gameState.registerCurrency(new Currency(gameState, "aoiT2Unlock")
    .registerI18N({
      shopBoxClass: "tier-two-unlock"
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

  gameState.registerCurrency(new Currency(gameState, "heckie"));

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
    .registerI18N({
      interpolations: () => {
        return {
          amount: gameState.getResolvedValue("heckieGenerator1Each").resolve()
        }
      },
      shopBoxClass: "minigame-generator"
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
    .registerI18N({
      interpolations: () => {
        return {
          amount: gameState.getResolvedValue("heckieGenerator2Each").resolve()
        }
      },
      shopBoxClass: "minigame-generator"
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
    .registerI18N({
      interpolations: () => {
        return {
          amount: gameState.getResolvedValue("heckieGenerator3Each").resolve()
        }
      },
      shopBoxClass: "minigame-generator"
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
    .registerI18N({
      interpolations: () => {
        return {
          amount: gameState.getCurrency("konkonmori").getCurrentAmountShort() + 1
        }
      },
      shopBoxClass: "minigame-buff"
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
    .registerI18N({
      shopBoxClass: "minigame-buff"
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
    .registerI18N({
      shopBoxClass: "minigame-buff"
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
    .registerI18N({
      shopBoxClass: "minigame-buff"
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
    .registerI18N({
      shopBoxClass: "minigame-buff"
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
    .registerI18N({
      shopBoxClass: "minigame-buff"
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
    .registerI18N({
      shopBoxClass: "minigame-buff"
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
    .registerI18N({
      shopBoxClass: "minigame-buff"
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
    .registerI18N({
      shopBoxClass: "minigame-buff"
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
    .registerI18N({
      shopBoxClass: "minigame-buff"
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
    .registerI18N({
      shopBoxClass: "minigame-buff"
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
    .registerI18N({
      interpolations: () => {
        return {
          amount: (1.0 - gameState.getCurrency("aoiMunchies3").getCurrentAmountShort() * 0.05).toFixed(2)
        }
      },
      shopBoxClass: "minigame-buff"
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
    .registerI18N({
      shopBoxClass: "tier-two-unlock"
    })
    .registerMaximumStock(1n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("heckie"), (_) => 1000000n)
    ])
    .registerCalculateIsRevealed(() => true)
  );
}