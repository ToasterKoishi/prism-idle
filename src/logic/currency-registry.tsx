import { t } from "i18next";
import { PURCHASE_WORDING_TYPE } from "../components/currency-purchase-component";
import { BASE_NUGGIE_TIMER, BASE_WCBONALDS_TIMER, COMPRESSED_NUGGIE_1_RATE, SCENE_SIZE, SMELL_WAFTER_MOVE_SPEED_BONUS_PERCENT } from "../const";
import { costFuncEx } from "../util";
import { Cost, Currency } from "./currency";
import { CurrencyGenerator, GameState } from "./game-state";
import { ResolvedValue } from "./resolved-value";

export const registerAoiT1 = (gameState: GameState) => {
  gameState.registerCurrency(new Currency(gameState, "aoi.nuggie"));

  // Values, etc

  gameState.registerResolvedValue(new ResolvedValue(gameState, "aoi.nuggieGeneratorBase",
    ["aoi.aoiRhythmGames"],
    ["aoi.airFryerAmount", "aoi.airFryerRate", "aoi.wcbonaldsAmount", "aoi.wcbonaldsRate", "aoi.compressedNuggiesAmount", "aoi.compressedNuggiesRate", "aoi.nuggieGlobalPercent"],
    (currencies, values) => {
      const numberOfFloorNuggies =
        values.get("aoi.airFryerAmount") / values.get("aoi.airFryerRate") +
        values.get("aoi.wcbonaldsAmount") / values.get("aoi.wcbonaldsRate");
      const actualNuggieCurrencyAmount = numberOfFloorNuggies *
        values.get("aoi.nuggieGlobalPercent") *
        (values.get("aoi.compressedNuggiesAmount") * values.get("aoi.compressedNuggiesRate") + (1.0 - values.get("aoi.compressedNuggiesRate"))) *
        (1.0 + 5 * currencies.getShort("aoi.aoiRhythmGames") * 0.01);
      return { amount: Number(actualNuggieCurrencyAmount), explanation: `${gameState.getCurrency("aoi.nuggie").getNamePlural()}: ${actualNuggieCurrencyAmount}/s` };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "aoi.nuggieGeneratorMulti",
    ["aoi.smellWafter", "aoi.nuggieDog", "aoi.nuggieDog1", "aoi.nuggieDog2", "aoi.nuggieFlavorTechnique", "aoi.nuggieMagnet", "aoi.aoiBackseating"],
    [],
    (currencies, values) => {
      const maxAmount =
        gameState.getCurrency("aoi.smellWafter").getMaximumStock() +
        gameState.getCurrency("aoi.nuggieDog").getMaximumStock() +
        gameState.getCurrency("aoi.nuggieDog1").getMaximumStock() +
        gameState.getCurrency("aoi.nuggieDog2").getMaximumStock() +
        gameState.getCurrency("aoi.nuggieFlavorTechnique").getMaximumStock() +
        gameState.getCurrency("aoi.nuggieMagnet").getMaximumStock();
      const amount =
        0.5 / Number(maxAmount) * Number(
          currencies.get("aoi.smellWafter") +
          (BigInt(!!currencies.get("aoi.nuggieDog")) * (1n + currencies.get("aoi.nuggieDog1") + currencies.get("aoi.nuggieDog2"))) +
          currencies.get("aoi.nuggieFlavorTechnique") +
          currencies.get("aoi.nuggieMagnet")) +
        currencies.getShort("aoi.aoiBackseating") * 0.2 / 10.0;
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "aoi.nuggieGlobalPercent",
    ["aoi.aoiMunchies", "aoi.aoiMunchies2"],
    [],
    (currencies, values) => {
      const amount = 1.0 +
        currencies.getShort("aoi.aoiMunchies") * 0.25 +
        currencies.getShort("aoi.aoiMunchies2") * 0.1;
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "aoi.nuggieGenerator",
    [],
    ["aoi.nuggieGeneratorBase", "aoi.nuggieGeneratorMulti"],
    (currencies, values) => {
      const amount = values.get("aoi.nuggieGeneratorBase") * values.get("aoi.nuggieGeneratorMulti");
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "aoi.airFryerAmount",
    ["aoi.airFryer", "aoi.airFryer2"],
    [],
    (currencies, values) => {
      const amount = 1n +
        currencies.get("aoi.airFryer") * (currencies.get("aoi.airFryer2") + 1n);
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "aoi.airFryerRate",
    ["aoi.airFryer1"],
    [],
    (currencies, values) => {
      const amount =
        BASE_NUGGIE_TIMER - currencies.getShort("aoi.airFryer1") * 0.1;
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "aoi.wcbonaldsAmount",
    ["aoi.wcbonalds"],
    [],
    (currencies, values) => {
      const amount =
        currencies.get("aoi.wcbonalds") * 50n;
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "aoi.wcbonaldsRate",
    ["aoi.wcbonalds1", "aoi.aoiMunchies2"],
    [],
    (currencies, values) => {
      const amount =
        BASE_WCBONALDS_TIMER - currencies.getShort("aoi.wcbonalds1") * 5.0 - currencies.getShort("aoi.aoiMunchies2") * 2.5;
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "aoi.compressedNuggiesAmount",
    ["aoi.compressedNuggies2", "aoi.compressedNuggies3"],
    [],
    (currencies, values) => {
      const amount =
        (5n + currencies.get("aoi.compressedNuggies2")) * (1n + currencies.get("aoi.compressedNuggies3"));
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "aoi.compressedNuggiesRate",
    ["aoi.compressedNuggies1"],
    [],
    (currencies, values) => {
      const amount =
        COMPRESSED_NUGGIE_1_RATE * currencies.getShort("aoi.compressedNuggies1") / 100.0;
      return { amount: Number(amount), explanation: "" };
    }
  ));

  gameState.registerGenerator(new CurrencyGenerator(gameState, "aoi.passiveMode",
    [],
    [{ currency: "aoi.nuggie", resolvedValue: "aoi.nuggieGenerator" }]
  ));
  gameState.getGenerator("aoi.passiveMode").enabled = false;

  // Basic stuff

  gameState.registerCurrency(new Currency(gameState, "aoi.compressedNuggies1")
    .registerI18N({
      interpolations: () => {
        return {
          rate: COMPRESSED_NUGGIE_1_RATE,
          amount: gameState.getResolvedValue("aoi.compressedNuggiesAmount").resolve()
        }
      },
      shopBoxClass: "minigame-generator"
    })
    .registerMaximumStock(20n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.nuggie"), (gameState) => {
        return costFuncEx(100, 10, gameState.getCurrency("aoi.compressedNuggies1").getNextPurchasedAmountShort(), 3.9);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("aoi.nuggie").getCurrentAmount() >= 50)
  );

  gameState.registerCurrency(new Currency(gameState, "aoi.compressedNuggies2")
    .registerI18N({
      shopBoxClass: "minigame-generator"
    })
    //.registerMaximumStock(15n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.nuggie"), (gameState) => {
        return costFuncEx(100, 10, gameState.getCurrency("aoi.compressedNuggies2").getNextPurchasedAmountShort(), 2.9);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("aoi.compressedNuggies1").getCurrentAmount() >= 1)
  );

  gameState.registerCurrency(new Currency(gameState, "aoi.compressedNuggies3")
    .registerI18N({
      shopBoxClass: "minigame-generator"
    })
    //.registerMaximumStock(15n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.nuggie"), (gameState) => {
        return costFuncEx(1000000, 10, gameState.getCurrency("aoi.compressedNuggies3").getNextPurchasedAmountShort(), 1);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("aoi.compressedNuggies2").getCurrentAmount() >= 10)
  );

  // Minigame generators

  gameState.registerCurrency(new Currency(gameState, "aoi.airFryer")
    .registerI18N({
      interpolations: () => {
        return {
          rate: gameState.getResolvedValue("aoi.airFryerRate").resolve().toFixed(1),
          amount: gameState.getCurrency("aoi.airFryer2").getCurrentAmount() + 1n
        }
      },
      shopBoxClass: "minigame-generator"
    })
    .registerMaximumStock(30n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.nuggie"), (gameState) => {
        return costFuncEx(5, 10, gameState.getCurrency("aoi.airFryer").getNextPurchasedAmountShort(), 9.9);
      })
    ])
    .registerCalculateIsRevealed(() => true)
  );

  gameState.registerCurrency(new Currency(gameState, "aoi.airFryer1")
    .registerI18N({
      shopBoxClass: "minigame-generator"
    })
    .registerMaximumStock(25n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.nuggie"), (gameState) => {
        return costFuncEx(500, 10, gameState.getCurrency("aoi.airFryer1").getNextPurchasedAmountShort(), 9.9);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("aoi.airFryer").getCurrentAmount() >= 20)
  );

  gameState.registerCurrency(new Currency(gameState, "aoi.airFryer2")
    .registerI18N({
      shopBoxClass: "minigame-generator"
    })
    .registerMaximumStock(11n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.nuggie"), (gameState) => {
        return costFuncEx(2500, 100, gameState.getCurrency("aoi.airFryer2").getNextPurchasedAmountShort(), 10.9);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("aoi.airFryer").getCurrentAmount() >= 20)
  );

  gameState.registerCurrency(new Currency(gameState, "aoi.wcbonalds")
    .registerI18N({
      interpolations: () => {
        return {
          rate: gameState.getResolvedValue("aoi.wcbonaldsRate").resolve()
        }
      },
      shopBoxClass: "minigame-generator"
    })
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.nuggie"), (gameState) => {
        return costFuncEx(100, 10, gameState.getCurrency("aoi.wcbonalds").getNextPurchasedAmountShort(), 4.9);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("aoi.nuggie").getCurrentAmount() >= 50)
  );

  gameState.registerCurrency(new Currency(gameState, "aoi.wcbonalds1")
    .registerI18N({
      shopBoxClass: "minigame-generator"
    })
    .registerMaximumStock(6n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.nuggie"), (gameState) => {
        return costFuncEx(1000, 10, gameState.getCurrency("aoi.wcbonalds1").getNextPurchasedAmountShort(), 2.9);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("aoi.wcbonalds").getCurrentAmount() >= 5)
  );

  // "Motivation" stuff

  gameState.registerCurrency(new Currency(gameState, "aoi.motivationResearch")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerMaximumStock(1n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.nuggie"), (_) => 10n)
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("aoi.nuggie").getCurrentAmount() >= 10)
    .registerOnAmountPurchased(() => {
      gameState.getCurrency("aoi.smellWafter").setRevealed();
      gameState.getCurrency("aoi.nuggieFlavorTechnique").setRevealed();
      gameState.getCurrency("aoi.nuggieMagnet").setRevealed();
      gameState.getCurrency("aoi.nuggieDog").setRevealed();
    })
  );

  gameState.registerCurrency(new Currency(gameState, "aoi.smellWafter")
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
      new Cost(gameState.getCurrency("aoi.nuggie"), (gameState) => {
        return costFuncEx(20, 2, gameState.getCurrency("aoi.smellWafter").getNextPurchasedAmountShort(), 1);
      })
    ])
  );

  gameState.registerCurrency(new Currency(gameState, "aoi.nuggieDog")
    .registerI18N({
      shopBoxClass: "dog"
    })
    .registerMaximumStock(1n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.nuggie"), (gameState) => 100n)
    ])
    .registerOnAmountPurchased(() => {
      gameState.getCurrency("aoi.nuggieDog1").setRevealed();
      gameState.getCurrency("aoi.nuggieDog2").setRevealed();
    })
  );

  gameState.registerCurrency(new Currency(gameState, "aoi.nuggieDog1")
    .registerI18N({
      interpolations: () => {
        return {
          amount: gameState.calculateNuggieDogCycleTime().toFixed(1)
        }
      },
      shopBoxClass: "dog"
    })
    .registerMaximumStock(6n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.nuggie"), (gameState) => {
        return costFuncEx(100, 1000, gameState.getCurrency("aoi.nuggieDog1").getNextPurchasedAmountShort(), 5.9);
      })
    ])
  );

  gameState.registerCurrency(new Currency(gameState, "aoi.nuggieDog2")
    .registerI18N({
      shopBoxClass: "dog"
    })
    .registerMaximumStock(5n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.nuggie"), (gameState) => {
        return costFuncEx(100, 1000, gameState.getCurrency("aoi.nuggieDog2").getNextPurchasedAmountShort(), 4.9);
      })
    ])
  );

  gameState.registerCurrency(new Currency(gameState, "aoi.nuggieFlavorTechnique")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerMaximumStock(8n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.nuggie"), (gameState) => {
        return costFuncEx(250, 2, gameState.getCurrency("aoi.nuggieFlavorTechnique").getNextPurchasedAmountShort(), 1);
      })
    ])
  );

  gameState.registerCurrency(new Currency(gameState, "aoi.nuggieMagnet")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.nuggie"), (gameState) => {
        return costFuncEx(1000, 2, gameState.getCurrency("aoi.nuggieMagnet").getNextPurchasedAmountShort(), 1);
      })
    ])
  );

  gameState.registerCurrency(new Currency(gameState, "aoi.t2Unlock")
    .registerI18N({
      shopBoxClass: "tier-two-unlock"
    })
    .registerMaximumStock(1n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.nuggie"), (_) => 50000n)
    ])
    .registerCalculateIsRevealed(() => true)
    .registerOnAmountPurchased(() => {
      gameState.getCurrency("aoi.heckie").setRevealed();
      gameState.getCurrency("aoi.heckie").addAmount(1n);
    })
  );
}

export const registerAoiT2 = (gameState: GameState) => {
  const SCALING_RATE = 10.0;
  const SCALING_OVER = 7.4;

  gameState.registerCurrency(new Currency(gameState, "aoi.heckie"));

  gameState.registerGenerator(new CurrencyGenerator(gameState, "aoi.heckie",
    [{ currency: "aoi.nuggie", resolvedValue: "aoi.heckieGeneratorIn" }],
    [{ currency: "aoi.heckie", resolvedValue: "aoi.heckieGeneratorOut" }]
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "aoi.heckieGeneratorIn",
    ["aoi.aoiMunchies3"],
    ["aoi.heckieGenerator"],
    (currencies, values) => {
      const amount = values.get("aoi.heckieGenerator") *
        (1.0 - 0.05 * currencies.getShort("aoi.aoiMunchies3"));
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "aoi.heckieGeneratorOut",
    ["aoi.aoiKaraoke"],
    ["aoi.heckieGenerator"],
    (currencies, values) => {
      const amount = values.get("aoi.heckieGenerator") * (1.0 +
        currencies.getShort("aoi.aoiKaraoke") * 0.1);
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "aoi.heckieGenerator",
    ["aoi.heckieGenerator1", "aoi.heckieGenerator2", "aoi.heckieGenerator3", "aoi.aoiBullying"],
    ["aoi.heckieGenerator1Each", "aoi.heckieGenerator2Each", "aoi.heckieGenerator3Each"],
    (currencies, values) => {
      const baseAmount =
        currencies.getShort("aoi.heckieGenerator1") * values.get("aoi.heckieGenerator1Each") +
        currencies.getShort("aoi.heckieGenerator2") * values.get("aoi.heckieGenerator2Each") +
        currencies.getShort("aoi.heckieGenerator3") * values.get("aoi.heckieGenerator3Each");
      const amount = baseAmount * (1.0 +
        currencies.getShort("aoi.aoiBullying") * 0.25
      );
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "aoi.heckieGenerator1Each",
    ["aoi.hiGuys", "aoi.konkonmori"],
    [],
    (currencies, values) => {
      const amount = 1n +
        (currencies.get("aoi.hiGuys") * (1n + currencies.get("aoi.konkonmori")));
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "aoi.heckieGenerator2Each",
    ["aoi.heckieGenerator1", "aoi.heckieGenerator2", "aoi.heckieGenerator3", "aoi.aoiStreamDelay", "aoi.aoiStreamDelay2", "aoi.aoiStreamDelay3"],
    ["aoi.heckieGenerator1Each", "aoi.heckieGenerator3Each"],
    (currencies, values) => {
      const amount = 1n +
        currencies.get("aoi.heckieGenerator2") * currencies.get("aoi.aoiStreamDelay") +
        (currencies.get("aoi.heckieGenerator1") + currencies.get("aoi.heckieGenerator2") + currencies.get("aoi.heckieGenerator3")) * currencies.get("aoi.aoiStreamDelay2") +
        (currencies.get("aoi.heckieGenerator1") * BigInt(values.get("aoi.heckieGenerator1Each")) + currencies.get("aoi.heckieGenerator3") * BigInt(values.get("aoi.heckieGenerator3Each"))) * currencies.get("aoi.aoiStreamDelay3");
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "aoi.heckieGenerator3Each",
    [],
    [],
    (currencies, values) => {
      const amount = 1n;
      return { amount: Number(amount), explanation: "" };
    }
  ));

  gameState.registerCurrency(new Currency(gameState, "aoi.heckieGenerator1")
    .registerI18N({
      interpolations: () => {
        const rv = gameState.getResolvedValue("aoi.heckieGenerator1Each").resolve();
        return {
          amount: `(${t("currency.aoi.nuggie.withIcon.nameCount", { count: rv })} → ${t("currency.aoi.heckie.withIcon.nameCount", { count: rv })})`
        }
      },
      shopBoxClass: "minigame-generator"
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    //.registerMaximumStock(30n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.nuggie"), (gameState) => {
        return costFuncEx(1000, SCALING_RATE, gameState.getCurrency("aoi.heckieGenerator1").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("aoi.t2Unlock").getCurrentAmount() >= 1n)
  );

  gameState.registerCurrency(new Currency(gameState, "aoi.heckieGenerator2")
    .registerI18N({
      interpolations: () => {
        const rv = gameState.getResolvedValue("aoi.heckieGenerator2Each").resolve();
        return {
          amount: `(${t("currency.aoi.nuggie.withIcon.nameCount", { count: rv })} → ${t("currency.aoi.heckie.withIcon.nameCount", { count: rv })})`
        }
      },
      shopBoxClass: "minigame-generator"
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    //.registerMaximumStock(30n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.nuggie"), (gameState) => {
        return costFuncEx(1000, SCALING_RATE, gameState.getCurrency("aoi.heckieGenerator2").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("aoi.t2Unlock").getCurrentAmount() >= 1n)
  );

  gameState.registerCurrency(new Currency(gameState, "aoi.heckieGenerator3")
    .registerI18N({
      interpolations: () => {
        const rv = gameState.getResolvedValue("aoi.heckieGenerator3Each").resolve();
        return {
          amount: `(${t("currency.aoi.nuggie.withIcon.nameCount", { count: rv })} → ${t("currency.aoi.heckie.withIcon.nameCount", { count: rv })})`
        }
      },
      shopBoxClass: "minigame-generator"
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    //.registerMaximumStock(30n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.nuggie"), (gameState) => {
        return costFuncEx(1000, SCALING_RATE, gameState.getCurrency("aoi.heckieGenerator3").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("aoi.t2Unlock").getCurrentAmount() >= 1n)
  );

  gameState.registerCurrency(new Currency(gameState, "aoi.hiGuys")
    .registerI18N({
      interpolations: () => {
        return {
          amount: gameState.getCurrency("aoi.konkonmori").getCurrentAmountShort() + 1
        }
      },
      shopBoxClass: "minigame-buff"
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.heckie"), (gameState) => {
        return costFuncEx(500, SCALING_RATE, gameState.getCurrency("aoi.hiGuys").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("aoi.heckieGenerator1"), (_) => 10n)
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("aoi.heckieGenerator1").getCurrentAmount() >= 5)
  );

  gameState.registerCurrency(new Currency(gameState, "aoi.konkonmori")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.heckie"), (gameState) => {
        return costFuncEx(50000, SCALING_RATE, gameState.getCurrency("aoi.konkonmori").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("aoi.hiGuys"), (_) => 5n),
      new Cost(gameState.getCurrency("aoi.heckieGenerator1"), (_) => 20n),
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("aoi.hiGuys").getCurrentAmount() >= 1)
  );

  gameState.registerCurrency(new Currency(gameState, "aoi.aoiStreamDelay")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerMaximumStock(1n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.heckie"), (gameState) => {
        return costFuncEx(2000, SCALING_RATE, gameState.getCurrency("aoi.aoiStreamDelay").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("aoi.heckieGenerator2"), (_) => 10n)
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("aoi.heckieGenerator2").getCurrentAmount() >= 5)
  );

  gameState.registerCurrency(new Currency(gameState, "aoi.aoiStreamDelay2")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerMaximumStock(1n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.heckie"), (gameState) => {
        return costFuncEx(1000000, SCALING_RATE, gameState.getCurrency("aoi.aoiStreamDelay2").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("aoi.aoiStreamDelay"), (_) => 1n),
      new Cost(gameState.getCurrency("aoi.heckieGenerator2"), (_) => 30n)
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("aoi.aoiStreamDelay").getCurrentAmount() >= 1)
  );

  // UNUSED
  gameState.registerCurrency(new Currency(gameState, "aoi.aoiStreamDelay3")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    //.registerMaximumStock(1n)
    .registerMaximumStock(0n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.heckie"), (gameState) => {
        return costFuncEx(2500000, SCALING_RATE, gameState.getCurrency("aoi.aoiStreamDelay3").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("aoi.aoiStreamDelay2"), (_) => 1n),
      new Cost(gameState.getCurrency("aoi.heckieGenerator2"), (_) => 50n)
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("aoi.aoiStreamDelay2").getCurrentAmount() >= 5)
  );

  gameState.registerCurrency(new Currency(gameState, "aoi.aoiBackseating")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.heckie"), (gameState) => {
        return costFuncEx(500, SCALING_RATE, gameState.getCurrency("aoi.aoiBackseating").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("aoi.heckieGenerator3"), (_) => 10n),
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("aoi.heckieGenerator3").getCurrentAmount() >= 5)
  );

  gameState.registerCurrency(new Currency(gameState, "aoi.aoiKaraoke")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.heckie"), (gameState) => {
        return costFuncEx(50000, SCALING_RATE, gameState.getCurrency("aoi.aoiKaraoke").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("aoi.heckieGenerator1"), (_) => 20n),
      new Cost(gameState.getCurrency("aoi.heckieGenerator2"), (_) => 20n),
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("aoi.heckieGenerator1").getCurrentAmount() >= 20 || gameState.getCurrency("aoi.heckieGenerator2").getCurrentAmount() >= 20)
  );

  gameState.registerCurrency(new Currency(gameState, "aoi.aoiBullying")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.heckie"), (gameState) => {
        return costFuncEx(50000, SCALING_RATE, gameState.getCurrency("aoi.aoiBullying").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("aoi.heckieGenerator1"), (_) => 20n),
      new Cost(gameState.getCurrency("aoi.heckieGenerator3"), (_) => 20n),
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("aoi.heckieGenerator1").getCurrentAmount() >= 20 || gameState.getCurrency("aoi.heckieGenerator3").getCurrentAmount() >= 20)
  );

  gameState.registerCurrency(new Currency(gameState, "aoi.aoiRhythmGames")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.heckie"), (gameState) => {
        return costFuncEx(50000, SCALING_RATE, gameState.getCurrency("aoi.aoiRhythmGames").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("aoi.heckieGenerator2"), (_) => 20n),
      new Cost(gameState.getCurrency("aoi.heckieGenerator3"), (_) => 20n),
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("aoi.heckieGenerator2").getCurrentAmount() >= 20 || gameState.getCurrency("aoi.heckieGenerator3").getCurrentAmount() >= 20)
  );

  gameState.registerCurrency(new Currency(gameState, "aoi.aoiMunchies")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.heckie"), (gameState) => {
        return costFuncEx(1000, SCALING_RATE, gameState.getCurrency("aoi.aoiMunchies").getNextPurchasedAmountShort(), SCALING_OVER / 2);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("aoi.heckieGenerator1"), (_) => 5n),
      new Cost(gameState.getCurrency("aoi.heckieGenerator2"), (_) => 5n),
      new Cost(gameState.getCurrency("aoi.heckieGenerator3"), (_) => 5n),
    ])
    .registerCalculateIsRevealed(() => true)
  );

  gameState.registerCurrency(new Currency(gameState, "aoi.aoiMunchies2")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.heckie"), (gameState) => {
        return costFuncEx(100000, SCALING_RATE, gameState.getCurrency("aoi.aoiMunchies2").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("aoi.aoiMunchies"), (_) => 5n),
      new Cost(gameState.getCurrency("aoi.heckieGenerator1"), (_) => 15n),
      new Cost(gameState.getCurrency("aoi.heckieGenerator2"), (_) => 15n),
      new Cost(gameState.getCurrency("aoi.heckieGenerator3"), (_) => 15n),
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("aoi.aoiMunchies").getCurrentAmount() >= 1)
  );

  gameState.registerCurrency(new Currency(gameState, "aoi.aoiMunchies3")
    .registerI18N({
      interpolations: () => {
        return {
          amount: (1.0 - gameState.getCurrency("aoi.aoiMunchies3").getCurrentAmountShort() * 0.05).toFixed(2)
        }
      },
      shopBoxClass: "minigame-buff"
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.heckie"), (gameState) => {
        return costFuncEx(100000, SCALING_RATE, gameState.getCurrency("aoi.aoiMunchies3").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("aoi.aoiMunchies2"), (_) => 5n),
      new Cost(gameState.getCurrency("aoi.heckieGenerator1"), (_) => 25n),
      new Cost(gameState.getCurrency("aoi.heckieGenerator2"), (_) => 25n),
      new Cost(gameState.getCurrency("aoi.heckieGenerator3"), (_) => 25n),
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("aoi.aoiMunchies2").getCurrentAmount() >= 1)
  );

  gameState.registerCurrency(new Currency(gameState, "aoi.aoiT3Unlock")
    .registerI18N({
      shopBoxClass: "tier-two-unlock"
    })
    .registerMaximumStock(1n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("aoi.heckie"), (_) => 500000n)
    ])
    .registerCalculateIsRevealed(() => true)
    .registerOnAmountPurchased(() => {
      gameState.numCharacterUnlocks += 1;
    })
  );
}

export const registerIkuT1 = (gameState: GameState) => {
  gameState.registerCurrency(new Currency(gameState, "iku.ikumin"));

  gameState.registerResolvedValue(new ResolvedValue(gameState, "iku.ikuminGlobalPercent",
    ["iku.himeLove"],
    [],
    (currencies, values) => {
      const amount = 1.0 + 0.25 * currencies.getShort("iku.himeLove");
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "iku.minigameIkuminBonus",
    ["iku.ikuminBlueBuff"],
    [],
    (currencies, values) => {
      const amount = currencies.get("iku.ikuminBlueBuff");
      return { amount: Number(amount), explanation: "" };
    }
  ));
  // Actually the amount of time between spawns
  gameState.registerResolvedValue(new ResolvedValue(gameState, "iku.ikuminSeedSpawnRate",
    ["iku.fertileSoil"],
    [],
    (currencies, values) => {
      return { amount: 30.0 / (currencies.getShort("iku.fertileSoil") + 1.0), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "iku.ikuminSeedSpawnAmount",
    ["iku.fertileSoil1", "iku.fertileSoil2"],
    [],
    (currencies, values) => {
      return { amount: (1.0 + currencies.getShort("iku.fertileSoil1")) * (1.0 + currencies.getShort("iku.fertileSoil2")), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "iku.ikuminWateringRate",
    ["iku.himeJuice"],
    [],
    (currencies, values) => {
      return { amount: 1.0 * (1.0 + currencies.getShort("iku.himeJuice") * 0.2), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "iku.ikuminWaterRequired",
    ["iku.himeJuice2"],
    [],
    (currencies, values) => {
      return { amount: 20.0 * (1.0 - 0.05 * currencies.getShort("iku.himeJuice2")), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "iku.ikuminGrowthTime",
    ["iku.sunscaper"],
    [],
    (currencies, values) => {
      return { amount: 60.0 / (1.0 + 0.3 * currencies.getShort("iku.sunscaper")), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "iku.ikuminWateringRadius",
    ["iku.wateringArea"],
    [],
    (currencies, values) => {
      return { amount: 16.0 + 16.0 * currencies.getShort("iku.wateringArea"), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "iku.ikuminYeetingRadius",
    ["iku.yeetingArea"],
    [],
    (currencies, values) => {
      return { amount: 32.0 + 16.0 * currencies.getShort("iku.yeetingArea"), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "iku.farmEducation",
    ["iku.educationMulti1"],
    [],
    (currencies, values) => {
      const amount = 0.5 + currencies.getShort("iku.educationMulti1") * 0.02;
      return { amount: Number(amount), explanation: "" };
    }
  ));
  // This needs to be complex in order to ensure that passive mode is not unfairly imbalanced respective to acivce mode (trust)
  gameState.registerResolvedValue(new ResolvedValue(gameState, "iku.farmEfficiency",
    ["iku.ikuminVariety", "iku.ikuminSky", "iku.ikuminNeapolitan", "iku.ikuminRainbow", "iku.wateringSprinkler", "iku.wateringArea", "iku.yeetingGroupHug", "iku.yeetingArea", "iku.ikuminVaporwaveBuff", "iku.ikuminNeapolitanBuff"],
    ["iku.ikuminSeedSpawnRate", "iku.ikuminSeedSpawnAmount", "iku.ikuminWateringRadius", "iku.ikuminWateringRate", "iku.ikuminWaterRequired", "iku.ikuminGrowthTime"],
    (currencies, values) => {
      // This code should have the same logic as the code in IkuMinigame!

      // Calculation of farm efficiency
      // Farm efficiency is a complex value that approximates what percent of sprout spawns are actually spawning

      // Calculation of rate of sprout spawns
      const sproutsPerSecond = 1.0 / values.get("iku.ikuminSeedSpawnRate") * values.get("iku.ikuminSeedSpawnAmount");

      // Calculate an approximate maximum number of sprouts that can possibly be on-screen at once
      const usePattern: boolean = gameState.getCurrency("iku.decree2").getCurrentAmount() > 0n;
      const allowedCloseness = usePattern ? 24.0 : 32.0;
      const xGridSpacing = allowedCloseness;
      const xGridMax = Math.floor((SCENE_SIZE.x - 40.0) / xGridSpacing);
      const yGridSpacing = Math.sqrt(3) * 0.5 * allowedCloseness;
      const yGridMax = Math.floor((SCENE_SIZE.y - 40.0) / yGridSpacing);
      const maximumNumSprouts = xGridMax * yGridMax * (usePattern ? 1.0 : 5.0 / 6.0); // 5/6 is approximated from empirical evidence

      // Amount of time to go from sprout spawn to fully-grown
      // Note that this purposely is a little faster than the real amount in the game since it skips some animation locks

      // Neapolitan and rainbow Ikumin's effects are simulated by assuming they have no growth time. This is purposely likely much weaker than their real effect
      const percentNeapolitan = currencies.get("iku.ikuminVariety") >= 4n ? 10.0 + currencies.getShort("iku.ikuminNeapolitan") : 0.0;
      const percentRainbow = currencies.get("iku.ikuminVariety") >= 5n ? 10.0 + currencies.getShort("iku.ikuminRainbow") : 0.0;
      const percentWithGrowthTime = (100.0 - percentNeapolitan - percentRainbow) / 100.0;

      // Sprinklers are approximated as halving the time to grow within their area of influence
      const totalSprinklerArea = Math.PI * values.get("iku.ikuminWateringRadius") * values.get("iku.ikuminWateringRadius") * currencies.getShort("iku.wateringSprinkler");
      const sprinklerAreaFraction = totalSprinklerArea / (SCENE_SIZE.x * SCENE_SIZE.y);

      // Onus to not having maxed out certain upgrades
      const percentSky = currencies.get("iku.ikuminVariety") >= 3n ? 10.0 + currencies.getShort("iku.ikuminSky") : 0.0;
      const tendingMax = Number(
        gameState.getCurrency("iku.wateringArea").getMaximumStock() * gameState.getCurrency("iku.wateringArea").getMaximumStock() +
        gameState.getCurrency("iku.yeetingGroupHug").getMaximumStock() +
        gameState.getCurrency("iku.yeetingArea").getMaximumStock() * gameState.getCurrency("iku.yeetingArea").getMaximumStock()) +
        25.0;
      const tendingCurrent =
        currencies.getShort("iku.wateringArea") * currencies.getShort("iku.wateringArea") +
        currencies.getShort("iku.yeetingGroupHug") +
        currencies.getShort("iku.yeetingArea") * currencies.getShort("iku.yeetingArea") +
        (percentSky + percentRainbow) * 25.0 / 40.0;
      // Minimum value is 2.0
      const lackOfAutomationOnus = 4.0 -
        Number(tendingCurrent) / Number(tendingMax) -
        0.5 * currencies.getShort("iku.ikuminVaporwaveBuff") -
        0.5 * currencies.getShort("iku.ikuminNeapolitanBuff");

      const timeFromSpawnToGrowth =
        (values.get("iku.ikuminWaterRequired") / values.get("iku.ikuminWateringRate") + values.get("iku.ikuminGrowthTime")) *
        percentWithGrowthTime *
        (1.0 - 0.5 * sprinklerAreaFraction) *
        lackOfAutomationOnus;

      // f(t) is number of sprouts on screen at time t. df/dt is change in number of sprouts:
      // df/dt = sproutsPerSecond * ((maximumNumSprouts - f(t)) / maximumNumSprouts)
      // df/dt = S * (M - f(t)) / M
      // f(t) = C e^(-S/M t) + M where C = -M
      // Trust me, I plugged this into Wolfram
      // We use t = timeFromSpawnToGrowth to get:
      const numSproutsAtTFSTG = -maximumNumSprouts * Math.exp(-sproutsPerSecond / maximumNumSprouts * timeFromSpawnToGrowth) + maximumNumSprouts;
      const effectiveSproutsPerSecond = numSproutsAtTFSTG / timeFromSpawnToGrowth;

      const baseEfficiency = effectiveSproutsPerSecond / sproutsPerSecond;

      const amount = Math.max(0.01, baseEfficiency);
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "iku.ikuminGeneratorBase",
    ["iku.ikuminVariety", "iku.ikuminBlue", "iku.ikuminVaporwave", "iku.ikuminSky", "iku.ikuminNeapolitan", "iku.ikuminRainbow"],
    ["iku.ikuminSeedSpawnRate", "iku.ikuminSeedSpawnAmount", "iku.minigameIkuminBonus", "iku.ikuminGlobalPercent"],
    (currencies, values) => {
      // This code should have the same logic as the code in IkuMinigame!

      // Calculation of rate of sprout spawns
      const sproutsPerSecond = 1.0 / values.get("iku.ikuminSeedSpawnRate") * values.get("iku.ikuminSeedSpawnAmount");

      // Calculation of the eventual average value of a single sprout, including resulting splits from vaporwave/rainbow ikumin
      const percentBlue = currencies.get("iku.ikuminVariety") >= 1n ? 10.0 + currencies.getShort("iku.ikuminBlue") : 0.0;
      const percentVaporwave = currencies.get("iku.ikuminVariety") >= 2n ? 10.0 + currencies.getShort("iku.ikuminVaporwave") : 0.0;
      const percentSky = currencies.get("iku.ikuminVariety") >= 3n ? 10.0 + currencies.getShort("iku.ikuminSky") : 0.0;
      const percentNeapolitan = currencies.get("iku.ikuminVariety") >= 4n ? 10.0 + currencies.getShort("iku.ikuminNeapolitan") : 0.0;
      const percentRainbow = currencies.get("iku.ikuminVariety") >= 5n ? 10.0 + currencies.getShort("iku.ikuminRainbow") : 0.0;
      const percentPink = (100.0 - percentBlue - percentVaporwave - percentSky - percentNeapolitan - percentRainbow);
      const baseValue =
        (percentPink + percentSky + percentNeapolitan) / 100.0 * (1.0 + values.get("iku.minigameIkuminBonus")) +
        (percentBlue + percentRainbow) / 100.0 * (5.0 + values.get("iku.minigameIkuminBonus"));
      const numAdds = 2.0 * (percentVaporwave + percentRainbow) / 100.0;
      const infiniteGeometricSum = baseValue / (1.0 - numAdds);

      return { amount: sproutsPerSecond * infiniteGeometricSum * values.get("iku.ikuminGlobalPercent"), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "iku.ikuminGenerator",
    [],
    ["iku.ikuminGeneratorBase", "iku.farmEfficiency", "iku.farmEducation"],
    (currencies, values) => {
      return { amount: values.get("iku.ikuminGeneratorBase") * values.get("iku.farmEfficiency") * values.get("iku.farmEducation"), explanation: "" };
    }
  ));

  gameState.registerGenerator(new CurrencyGenerator(gameState, "iku.passiveMode",
    [],
    [{ currency: "iku.ikumin", resolvedValue: "iku.ikuminGenerator" }]
  ));
  gameState.getGenerator("iku.passiveMode").enabled = false;

  // Iku Tier I stuff

  gameState.registerCurrency(new Currency(gameState, "iku.fertileSoil")
    .registerI18N({
      interpolations: () => {
        return {
          rate: (60.0 / gameState.getResolvedValue("iku.ikuminSeedSpawnRate").resolve()).toFixed(0)
        }
      },
      shopBoxClass: "minigame-generator"
    })
    .registerMaximumStock(9n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.ikumin"), (gameState) => {
        return costFuncEx(2, 2000, gameState.getCurrency("iku.fertileSoil").getNextPurchasedAmountShort(), 9.9);
      })
    ])
    .registerCalculateIsRevealed(() => true)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.fertileSoil1")
    .registerI18N({
      shopBoxClass: "minigame-generator"
    })
    .registerMaximumStock(6n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.ikumin"), (gameState) => {
        return costFuncEx(5, 500, gameState.getCurrency("iku.fertileSoil1").getNextPurchasedAmountShort(), 4.9);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("iku.fertileSoil").getCurrentAmount() >= 1n)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.fertileSoil2")
    .registerI18N({
      shopBoxClass: "minigame-generator"
    })
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.ikumin"), (gameState) => {
        return costFuncEx(25, 2000, gameState.getCurrency("iku.fertileSoil2").getNextPurchasedAmountShort(), 9.9);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("iku.fertileSoil1").getCurrentAmount() >= 1n)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.himeJuice")
    .registerI18N({
      interpolations: () => {
        return {
          rate: (gameState.getResolvedValue("iku.ikuminWateringRate").resolve() / 20.0 * 100.0).toFixed(0)
        }
      },
      shopBoxClass: "minigame-generator"
    })
    .registerMaximumStock(15n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.ikumin"), (gameState) => {
        return costFuncEx(2, 500, gameState.getCurrency("iku.himeJuice").getNextPurchasedAmountShort(), 14.9);
      })
    ])
    .registerCalculateIsRevealed(() => true)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.himeJuice2")
    .registerI18N({
      shopBoxClass: "minigame-generator"
    })
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.ikumin"), (gameState) => {
        return costFuncEx(10, 500, gameState.getCurrency("iku.himeJuice2").getNextPurchasedAmountShort(), 14.9);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("iku.himeJuice").getCurrentAmount() >= 5n)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.gardeningRD")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerMaximumStock(1n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.ikumin"), (gameState) => 5n)
    ])
    .registerCalculateIsRevealed(() => true)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.wateringArea")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerMaximumStock(6n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.ikumin"), (gameState) => {
        return costFuncEx(5, 500, gameState.getCurrency("iku.wateringArea").getNextPurchasedAmountShort(), 4.9);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("iku.gardeningRD").getCurrentAmount() >= 1n)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.wateringSprinkler")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerMaximumStock(6n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.ikumin"), (gameState) => {
        return costFuncEx(250, 50, gameState.getCurrency("iku.wateringSprinkler").getNextPurchasedAmountShort(), 4.9);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("iku.wateringArea").getCurrentAmount() >= 4n)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.yeetingGroupHug")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerMaximumStock(1n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.ikumin"), (gameState) => 25n)
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("iku.gardeningRD").getCurrentAmount() >= 1n)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.yeetingArea")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerMaximumStock(5n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.ikumin"), (gameState) => {
        return costFuncEx(50, 250, gameState.getCurrency("iku.yeetingArea").getNextPurchasedAmountShort(), 4.9);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("iku.yeetingGroupHug").getCurrentAmount() >= 1n)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.ikuminVariety")
    .registerI18N({
      shopBoxClass: "ikumin-variety"
    })
    .registerMaximumStock(5n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.ikumin"), (gameState) => {
        switch (gameState.getCurrency("iku.ikuminVariety").getNextPurchasedAmount()) {
          case 0n:
            return 5n;
          case 1n:
            return 10n;
          case 2n:
            return 20n;
          case 3n:
            return 100n;
          case 4n:
            return 250n;
          default:
            return 0n;
        }
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("iku.gardeningRD").getCurrentAmount() >= 1n)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.ikuminBlue")
    .registerI18N({
      shopBoxClass: "ikumin-variety"
    })
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.ikumin"), (gameState) => {
        return 5n + gameState.getCurrency("iku.ikuminBlue").getNextPurchasedAmount();
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("iku.ikuminVariety").getCurrentAmount() >= 1n)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.ikuminVaporwave")
    .registerI18N({
      shopBoxClass: "ikumin-variety"
    })
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.ikumin"), (gameState) => {
        return costFuncEx(5, 500, gameState.getCurrency("iku.ikuminVaporwave").getNextPurchasedAmountShort(), 9.9);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("iku.ikuminVariety").getCurrentAmount() >= 2n)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.ikuminSky")
    .registerI18N({
      shopBoxClass: "ikumin-variety"
    })
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.ikumin"), (gameState) => {
        return costFuncEx(5, 50, gameState.getCurrency("iku.ikuminSky").getNextPurchasedAmountShort(), 9.9);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("iku.ikuminVariety").getCurrentAmount() >= 3n)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.ikuminNeapolitan")
    .registerI18N({
      shopBoxClass: "ikumin-variety"
    })
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.ikumin"), (gameState) => {
        return costFuncEx(50, 500, gameState.getCurrency("iku.ikuminNeapolitan").getNextPurchasedAmountShort(), 9.9);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("iku.ikuminVariety").getCurrentAmount() >= 4n)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.ikuminRainbow")
    .registerI18N({
      shopBoxClass: "ikumin-variety"
    })
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.ikumin"), (gameState) => {
        return costFuncEx(200, 500, gameState.getCurrency("iku.ikuminRainbow").getNextPurchasedAmountShort(), 9.9);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("iku.ikuminVariety").getCurrentAmount() >= 5n)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.ikuminBlueBuff")
    .registerI18N({
      shopBoxClass: "minigame-generator-ikumin-variety"
    })
    .registerMaximumStock(5n)
    .registerCostToPurchaseOne(() => [
      new Cost(gameState.getCurrency("iku.ikumin"), (gameState) => {
        return costFuncEx(1000, 2, gameState.getCurrency("iku.ikuminBlueBuff").getNextPurchasedAmountShort(), 1);
      }),
      new Cost(gameState.getCurrency("iku.furifuri"), (gameState) => {
        return costFuncEx(1000, 2, gameState.getCurrency("iku.ikuminBlueBuff").getNextPurchasedAmountShort(), 1);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("iku.ikuminVariety").getCurrentAmount() >= 1)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.ikuminVaporwaveBuff")
    .registerI18N({
      shopBoxClass: "minigame-generator-ikumin-variety"
    })
    .registerMaximumStock(1n)
    .registerCostToPurchaseOne(() => [
      new Cost(gameState.getCurrency("iku.ikumin"), (_) => 5000n),
      new Cost(gameState.getCurrency("iku.furifuri"), (_) => 50000n)
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("iku.ikuminVariety").getCurrentAmount() >= 2)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.sunscaper")
    .registerI18N({
      interpolations: () => {
        return {
          rate: (100.0 / gameState.getResolvedValue("iku.ikuminGrowthTime").resolve()).toFixed(2)
        }
      },
      shopBoxClass: "minigame-generator-ikumin-variety"
    })
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.ikumin"), (gameState) => {
        return costFuncEx(5, 2000, gameState.getCurrency("iku.sunscaper").getNextPurchasedAmountShort(), 9.9);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("iku.ikuminVariety").getCurrentAmount() >= 3)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.ikuminNeapolitanBuff")
    .registerI18N({
      shopBoxClass: "minigame-generator-ikumin-variety"
    })
    .registerMaximumStock(1n)
    .registerCostToPurchaseOne(() => [
      new Cost(gameState.getCurrency("iku.ikumin"), (_) => 5000n),
      new Cost(gameState.getCurrency("iku.furifuri"), (_) => 50000n)
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("iku.ikuminVariety").getCurrentAmount() >= 4)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.ikuminRainbowBuff")
    .registerI18N({
      shopBoxClass: "minigame-generator-ikumin-variety"
    })
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne(() => [
      new Cost(gameState.getCurrency("iku.ikumin"), (gameState) => {
        return costFuncEx(5, 1, gameState.getCurrency("iku.ikuminRainbowBuff").getNextPurchasedAmountShort(), 9.9);
      }),
      new Cost(gameState.getCurrency("iku.furifuri"), (gameState) => {
        return costFuncEx(5, 1, gameState.getCurrency("iku.ikuminRainbowBuff").getNextPurchasedAmountShort(), 9.9);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("iku.ikuminVariety").getCurrentAmount() >= 5)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.t2Unlock")
    .registerI18N({
      shopBoxClass: "tier-two-unlock"
    })
    .registerMaximumStock(1n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.ikumin"), (_) => 500n)
    ])
    .registerCalculateIsRevealed(() => true)
    .registerOnAmountPurchased(() => {
      gameState.getCurrency("iku.furifuri").setRevealed();
      gameState.getCurrency("iku.furifuri").addAmount(1n);
    })
  );
}

export const registerIkuT2 = (gameState: GameState) => {
  const SCALING_RATE = 10.0;
  const SCALING_OVER = 7.4;

  gameState.registerCurrency(new Currency(gameState, "iku.furifuri"));

  gameState.registerGenerator(new CurrencyGenerator(gameState, "iku.furifuri",
    [{ currency: "iku.ikumin", resolvedValue: "iku.furifuriGeneratorIn" }],
    [{ currency: "iku.furifuri", resolvedValue: "iku.furifuriGeneratorOut" }]
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "iku.furifuriGeneratorIn",
    ["iku.furifuriGenerator1", "iku.furifuriGenerator2", "iku.furifuriGenerator3", "iku.himeLove1", "iku.furifuriBuff1", "iku.ikuminEatWell"],
    [],
    (currencies, values) => {
      let amount =
        currencies.getShort("iku.furifuriGenerator1") * 0.025 +
        currencies.getShort("iku.furifuriGenerator2") * 0.1 +
        currencies.getShort("iku.furifuriGenerator3") * (0.4 - 0.02 * currencies.getShort("iku.ikuminEatWell"));
      amount *=
        // Unique multipliers
        (1.0 + 3.0 * currencies.getShort("iku.himeLove1")) *
        // Plus percent to conversion rate
        (1.0 +
          0.5 * currencies.getShort("iku.furifuriBuff1"));
      return { amount: amount, explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "iku.furifuriGeneratorOut",
    ["iku.furifuriGenerator1", "iku.furifuriGenerator2", "iku.furifuriGenerator3", "iku.himeLove1", "iku.furifuriBuff1", "iku.furifuriBuff2"],
    [],
    (currencies, values) => {
      let amount =
        currencies.getShort("iku.furifuriGenerator1") * 0.5 +
        currencies.getShort("iku.furifuriGenerator2") * 1.0 +
        currencies.getShort("iku.furifuriGenerator3") * 2.0;
      amount *=
        // Unique multipliers
        (1.0 + currencies.getShort("iku.himeLove1")) *
        // Plus percent to conversion rate
        (1.0 +
          0.5 * currencies.getShort("iku.furifuriBuff1")) *
        // Plus percent to output rate
        (1.0 +
          0.3 * currencies.getShort("iku.furifuriBuff2"));
      return { amount: amount, explanation: "" };
    }
  ));

  gameState.registerCurrency(new Currency(gameState, "iku.furifuriGenerator1")
    .registerI18N({
      interpolations: () => {
        const count = 1.0;
        return {
          amount: `(${t("currency.iku.ikumin.withIcon.nameCount", { count: parseFloat((count * 0.025).toFixed(3)) })} → ${t("currency.iku.furifuri.withIcon.nameCount", { count: parseFloat((count * 0.5).toFixed(1)) })})`
        }
      },
      shopBoxClass: "minigame-generator"
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.ikumin"), (gameState) => {
        return costFuncEx(100, SCALING_RATE, gameState.getCurrency("iku.furifuriGenerator1").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("iku.t2Unlock").getCurrentAmount() >= 1n)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.furifuriGenerator2")
    .registerI18N({
      interpolations: () => {
        const count = 1.0;
        return {
          amount: `(${t("currency.iku.ikumin.withIcon.nameCount", { count: parseFloat((count * 0.1).toFixed(1)) })} → ${t("currency.iku.furifuri.withIcon.nameCount", { count: count })})`
        }
      },
      shopBoxClass: "minigame-generator"
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.ikumin"), (gameState) => {
        return costFuncEx(100, SCALING_RATE, gameState.getCurrency("iku.furifuriGenerator2").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("iku.t2Unlock").getCurrentAmount() >= 1n)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.furifuriGenerator3")
    .registerI18N({
      interpolations: () => {
        const count = 1.0;
        return {
          amount: `(${t("currency.iku.ikumin.withIcon.nameCount", { count: parseFloat((count * (0.4 - 0.02 * gameState.getCurrency("iku.ikuminEatWell").getCurrentAmountShort())).toFixed(2)) })} → ${t("currency.iku.furifuri.withIcon.nameCount", { count: count * 2.0 })})`
        }
      },
      shopBoxClass: "minigame-generator"
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.ikumin"), (gameState) => {
        return costFuncEx(100, SCALING_RATE, gameState.getCurrency("iku.furifuriGenerator3").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("iku.t2Unlock").getCurrentAmount() >= 1n)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.furifuriBuff1")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerMaximumStock(10n)
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.furifuri"), (gameState) => {
        return costFuncEx(500, SCALING_RATE, gameState.getCurrency("iku.furifuriBuff1").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("iku.furifuriGenerator1"), (_) => 5n),
      new Cost(gameState.getCurrency("iku.furifuriGenerator2"), (_) => 5n),
      new Cost(gameState.getCurrency("iku.furifuriGenerator3"), (_) => 5n),
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("iku.t2Unlock").getCurrentAmount() >= 1n)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.himeLove")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.ikumin"), (gameState) => {
        return costFuncEx(500, SCALING_RATE, gameState.getCurrency("iku.himeLove").getNextPurchasedAmountShort(), SCALING_OVER);
      }),
      new Cost(gameState.getCurrency("iku.furifuri"), (gameState) => {
        return costFuncEx(5000, SCALING_RATE, gameState.getCurrency("iku.himeLove").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("iku.furifuriGenerator3"), (_) => 10n),
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("iku.furifuriGenerator3").getCurrentAmount() >= 5n)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.himeLove1")
    .registerI18N({
      interpolations: () => {
        return {
          rate1: gameState.getCurrency("iku.himeLove1").getCurrentAmountShort() + 1.0,
          rate2: 3.0 * gameState.getCurrency("iku.himeLove1").getCurrentAmountShort() + 1.0
        }
      },
      shopBoxClass: "minigame-buff"
    })
    .registerMaximumStock(10n)
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.ikumin"), (gameState) => {
        return costFuncEx(2000, SCALING_RATE, gameState.getCurrency("iku.himeLove1").getNextPurchasedAmountShort(), SCALING_OVER);
      }),
      new Cost(gameState.getCurrency("iku.furifuri"), (gameState) => {
        return costFuncEx(20000, SCALING_RATE, gameState.getCurrency("iku.himeLove1").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("iku.furifuriGenerator1"), (_) => 15n),
      new Cost(gameState.getCurrency("iku.furifuriGenerator2"), (_) => 15n),
      new Cost(gameState.getCurrency("iku.furifuriGenerator3"), (_) => 15n),
    ])
    .registerCalculateIsRevealed(() => {
      return (
        gameState.getCurrency("iku.furifuriGenerator1").getCurrentAmount() >= 10n ||
        gameState.getCurrency("iku.furifuriGenerator2").getCurrentAmount() >= 10n ||
        gameState.getCurrency("iku.furifuriGenerator3").getCurrentAmount() >= 10n
      );
    })
  );

  gameState.registerCurrency(new Currency(gameState, "iku.educationMulti1")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerMaximumStock(10n)
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.ikumin"), (gameState) => {
        return costFuncEx(500, SCALING_RATE, gameState.getCurrency("iku.educationMulti1").getNextPurchasedAmountShort(), SCALING_OVER);
      }),
      new Cost(gameState.getCurrency("iku.furifuri"), (gameState) => {
        return costFuncEx(5000, SCALING_RATE, gameState.getCurrency("iku.educationMulti1").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("iku.furifuriGenerator1"), (_) => 10n),
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("iku.furifuriGenerator1").getCurrentAmount() >= 5n)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.decree1")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerMaximumStock(1n)
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.furifuri"), (gameState) => {
        return costFuncEx(5000, SCALING_RATE, gameState.getCurrency("iku.decree1").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("iku.furifuriGenerator2"), (_) => 10n),
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("iku.furifuriGenerator2").getCurrentAmount() >= 5n)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.decree2")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerMaximumStock(1n)
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.furifuri"), (gameState) => {
        return costFuncEx(50000, SCALING_RATE, gameState.getCurrency("iku.decree2").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("iku.furifuriGenerator2"), (_) => 20n),
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("iku.furifuriGenerator2").getCurrentAmount() >= 15n)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.ikuminEatWell")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerMaximumStock(10n)
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.ikumin"), (gameState) => {
        return costFuncEx(2000, SCALING_RATE, gameState.getCurrency("iku.ikuminEatWell").getNextPurchasedAmountShort(), SCALING_OVER);
      }),
      new Cost(gameState.getCurrency("iku.furifuri"), (gameState) => {
        return costFuncEx(20000, SCALING_RATE, gameState.getCurrency("iku.ikuminEatWell").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("iku.furifuriGenerator3"), (_) => 20n),
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("iku.furifuriGenerator3").getCurrentAmount() >= 15n)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.furifuriBuff2")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerMaximumStock(10n)
    .registerPurchaseWordingType(PURCHASE_WORDING_TYPE.LEARN)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.ikumin"), (gameState) => {
        return costFuncEx(2000, SCALING_RATE, gameState.getCurrency("iku.furifuriBuff2").getNextPurchasedAmountShort(), SCALING_OVER);
      }),
      new Cost(gameState.getCurrency("iku.furifuri"), (gameState) => {
        return costFuncEx(20000, SCALING_RATE, gameState.getCurrency("iku.furifuriBuff2").getNextPurchasedAmountShort(), SCALING_OVER);
      })
    ])
    .registerUnlockRequirements([
      new Cost(gameState.getCurrency("iku.furifuriGenerator1"), (_) => 20n),
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("iku.furifuriGenerator1").getCurrentAmount() >= 15n)
  );

  gameState.registerCurrency(new Currency(gameState, "iku.t3Unlock")
    .registerI18N({
      shopBoxClass: "tier-two-unlock"
    })
    .registerMaximumStock(1n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("iku.furifuri"), (_) => 500000n)
    ])
    .registerCalculateIsRevealed(() => true)
    .registerOnAmountPurchased(() => {
      gameState.numCharacterUnlocks += 1;
    })
  );
}

export const registerMenoT1 = (gameState: GameState) => {
  gameState.registerCurrency(new Currency(gameState, "meno.shiny"));

  gameState.registerResolvedValue(new ResolvedValue(gameState, "meno.shinyGenerator",
    [],
    [],
    (currencies, values) => {
      return { amount: Number(0), explanation: "" };
    }
  ));

  gameState.registerResolvedValue(new ResolvedValue(gameState, "meno.puzzleSize",
    ["meno.biggerBlocks"],
    [],
    (currencies, values) => {
      const amount = 2n + currencies.get("meno.biggerBlocks");
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "meno.puzzleDepth",
    ["meno.biggerBlocks2"],
    [],
    (currencies, values) => {
      const amount = 1n + currencies.get("meno.biggerBlocks2");
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "meno.shinyPerLayer",
    ["meno.biggerBlocks", "meno.biggerBlocks1"],
    [],
    (currencies, values) => {
      const amount = 1n + currencies.get("meno.biggerBlocks") * 2n + currencies.get("meno.biggerBlocks1");
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "meno.puzzleGenerationTime",
    ["meno.biggerBlocks", "meno.biggerBlocks1"],
    ["meno.digSpeedModifier"],
    (currencies, values) => {
      const amount = (30.0 +
        currencies.getShort("meno.biggerBlocks") * 5.0 +
        currencies.getShort("meno.biggerBlocks1") * 5.0
      ) / values.get("meno.digSpeedModifier");
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "meno.digSpeedModifier",
    ["meno.digSpeed"],
    [],
    (currencies, values) => {
      const amount = 1.0 + currencies.getShort("meno.digSpeed") * 0.4;
      return { amount: Number(amount), explanation: "" };
    }
  ));
  gameState.registerResolvedValue(new ResolvedValue(gameState, "meno.extraShinyPerDig",
    ["meno.residualShiny"],
    [],
    (currencies, values) => {
      const amount = currencies.getShort("meno.residualShiny");
      return { amount: Number(amount), explanation: "" };
    }
  ));

  gameState.registerGenerator(new CurrencyGenerator(gameState, "meno.passiveMode",
    [],
    [{ currency: "meno.shiny", resolvedValue: "meno.shinyGenerator" }]
  ));
  gameState.getGenerator("meno.passiveMode").enabled = false;

  gameState.registerCurrency(new Currency(gameState, "meno.biggerBlocks")
    .registerI18N({
      interpolations: () => {
        return {
          rate: parseFloat((5.0 / gameState.getResolvedValue("meno.digSpeedModifier").resolve()).toFixed(2))
        }
      },
      shopBoxClass: "minigame-generator"
    })
    .registerMaximumStock(6n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("meno.shiny"), (gameState) => {
        return costFuncEx(2, 2000, gameState.getCurrency("meno.biggerBlocks").getNextPurchasedAmountShort(), 9.9);
      })
    ])
    .registerCalculateIsRevealed(() => true)
  );

  gameState.registerCurrency(new Currency(gameState, "meno.biggerBlocks1")
    .registerI18N({
      interpolations: () => {
        return {
          rate: parseFloat((5.0 / gameState.getResolvedValue("meno.digSpeedModifier").resolve()).toFixed(2))
        }
      },
      shopBoxClass: "minigame-generator"
    })
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("meno.shiny"), (gameState) => {
        return costFuncEx(4, 2000, gameState.getCurrency("meno.biggerBlocks1").getNextPurchasedAmountShort(), 9.9);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("meno.biggerBlocks").getCurrentAmount() >= 1n)
  );

  gameState.registerCurrency(new Currency(gameState, "meno.biggerBlocks2")
    .registerI18N({
      shopBoxClass: "minigame-generator"
    })
    .registerMaximumStock(5n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("meno.shiny"), (gameState) => {
        return costFuncEx(50, 10, gameState.getCurrency("meno.biggerBlocks2").getNextPurchasedAmountShort(), 1);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("meno.biggerBlocks").getCurrentAmount() >= 6n)
  );

  gameState.registerCurrency(new Currency(gameState, "meno.digSpeed")
    .registerI18N({
      shopBoxClass: "minigame-generator"
    })
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("meno.shiny"), (gameState) => {
        return costFuncEx(1, 2000, gameState.getCurrency("meno.digSpeed").getNextPurchasedAmountShort(), 9.9);
      })
    ])
    .registerCalculateIsRevealed(() => true)
  );

  gameState.registerCurrency(new Currency(gameState, "meno.residualShiny")
    .registerI18N({
      shopBoxClass: "minigame-generator"
    })
    .registerMaximumStock(10n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("meno.shiny"), (gameState) => {
        return costFuncEx(100, 500, gameState.getCurrency("meno.residualShiny").getNextPurchasedAmountShort(), 9.9);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("meno.digSpeed").getCurrentAmount() >= 1n)
  );

  gameState.registerCurrency(new Currency(gameState, "meno.magnifyingGlass")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerMaximumStock(9n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("meno.shiny"), (gameState) => {
        return costFuncEx(1, 2000, gameState.getCurrency("meno.magnifyingGlass").getNextPurchasedAmountShort(), 9.9);
      })
    ])
    .registerCalculateIsRevealed(() => true)
  );

  gameState.registerCurrency(new Currency(gameState, "meno.magnifyingGlass1")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerMaximumStock(2n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("meno.shiny"), (gameState) => {
        return costFuncEx(10, 100, gameState.getCurrency("meno.magnifyingGlass1").getNextPurchasedAmountShort(), 1);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("meno.magnifyingGlass").getCurrentAmount() >= 3n)
  );

  gameState.registerCurrency(new Currency(gameState, "meno.chisel")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerMaximumStock(9n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("meno.shiny"), (gameState) => {
        return costFuncEx(1, 2000, gameState.getCurrency("meno.chisel").getNextPurchasedAmountShort(), 9.9);
      })
    ])
    .registerCalculateIsRevealed(() => true)
  );
  5
  gameState.registerCurrency(new Currency(gameState, "meno.chisel1")
    .registerI18N({
      shopBoxClass: "minigame-buff"
    })
    .registerMaximumStock(4n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("meno.shiny"), (gameState) => {
        return costFuncEx(10, 2000, gameState.getCurrency("meno.chisel1").getNextPurchasedAmountShort(), 3.9);
      })
    ])
    .registerCalculateIsRevealed(() => gameState.getCurrency("meno.chisel").getCurrentAmount() >= 3n)
  );

  gameState.registerCurrency(new Currency(gameState, "meno.t2Unlock")
    .registerI18N({
      shopBoxClass: "tier-two-unlock"
    })
    .registerMaximumStock(1n)
    .registerCostToPurchaseOne([
      new Cost(gameState.getCurrency("meno.shiny"), (_) => 50000n)
    ])
    .registerCalculateIsRevealed(() => true)
    .registerOnAmountPurchased(() => {
      //gameState.getCurrency("meno.ippui").setRevealed();
      //gameState.getCurrency("meno.ippui").addAmount(1n);
    })
  );
}

export const registerMenoT2 = (gameState: GameState) => {
  gameState.registerCurrency(new Currency(gameState, "meno.ippui"));
}