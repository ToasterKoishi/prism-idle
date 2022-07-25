import { t } from "i18next";
import React from "react";
import { Currency } from "../logic/currency";

export const PURCHASE_WORDING_TYPE = {
  BUY: 0,
  LEARN: 1,
  GRANT: 2,
};

const PURCHASE_WORDING_I18N = {
  0: {
    oneshotBought: "BOUGHT",
    owned: "Owned",
    buyOne: "Buy 1",
    buyOnly: "Buy 1",
    soldOut: "SOLD OUT"
  },
  1: {
    oneshotBought: "LEARNED",
    owned: "Level",
    buyOne: "Level Up",
    buyOnly: "Learn",
    soldOut: "MAX LVL"
  }
}

interface SimpleCurrencyPurchaseComponentProps {
  currency: Currency;
}

export class SimpleCurrencyPurchaseComponent extends React.Component {
  props: SimpleCurrencyPurchaseComponentProps;

  constructor(props: SimpleCurrencyPurchaseComponentProps) {
    super(props);
  }

  render() {
    const currency = this.props.currency;
    const purchaseWording = PURCHASE_WORDING_I18N[currency.purchaseWordingType];

    let ownAmountText = "";
    if (currency.maximumStock === 1n) {
      // Use one-shot unlock style
      ownAmountText = currency.isInStock() ? "" : ` (${purchaseWording.oneshotBought})`;
    } else {
      ownAmountText = ` (${purchaseWording.owned}: ${currency.getCurrentAmount()}${currency.maximumStock > 0 ? "/" + currency.maximumStock : ""})`
    }


    if (currency.getIsRevealed()) {
      const interpolations = currency.i18n.interpolations();
      const flavorText = t("currency." + currency.getId() + ".flavorText");
      const maybeFlavorBox = (
        <div className="tooltip-trigger" style={{ position: "relative", float: "right" }}>[?]
          <div className="tooltip-box">{flavorText}</div>
        </div>
      );
      return (
        <div className="shop-box-outer">
          <div className={"shop-box " + (currency.getIsUnlocked() ? "" : "not-unlocked ") + (currency.isInStock() ? "" : "out-of-stock ") + currency.i18n.shopBoxClass}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <p>{currency.getNamePlural().toUpperCase()}</p>
                <p>{ownAmountText}</p>
              </div>
              <button style={{ width: "55px", height: "38px", flexShrink: "0" }} disabled={!currency.canPurchaseOne()} onClick={() => currency.tryPurchaseOne()}>
                {currency.isInStock() ? (currency.maximumStock > 1 ? purchaseWording.buyOne : purchaseWording.buyOnly) : purchaseWording.soldOut}
              </button>
            </div>
            <br />
            <p>{
              currency.getIsUnlocked() ?
                (currency.isInStock() ? `Cost: ${currency.getGameState().renderCosts(currency.costToPurchaseOne)}` : "Cost: -") :
                (`Requires: ${currency.getGameState().renderCosts(currency.unlockRequirements)}`)
            }</p>
            <br />
            <div className="clearfix">
              {t("currency." + currency.getId() + ".shortEffectDescription", interpolations)}
              {flavorText === "" ? null : maybeFlavorBox}
            </div>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}