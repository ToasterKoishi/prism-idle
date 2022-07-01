import React from "react";
import { Currency } from "../logic/currency";

interface SimpleCurrencyPurchaseComponentProps {
  currency: Currency;
}

interface SimpleCurrencyPurchaseComponentState {
}

export class SimpleCurrencyPurchaseComponent extends React.Component {
  props: SimpleCurrencyPurchaseComponentProps;
  state: SimpleCurrencyPurchaseComponentState;

  constructor(props: SimpleCurrencyPurchaseComponentProps) {
    super(props);
  }

  render() {
    const currency = this.props.currency;

    let ownAmountText = "";
    if (currency.maximumStock === 1n) {
      // Use one-shot unlock style
      ownAmountText = currency.isInStock() ? "" : " (BOUGHT)";
    } else {
      ownAmountText = ` (Owned: ${currency.getCurrentAmount()}${currency.maximumStock > 0 ? "/" + currency.maximumStock : ""})`
    }


    if (currency.getIsRevealed()) {
      const costAmount = Number(currency.costToPurchaseOne[0].calculateCost(currency.getGameState()));
      const costCurrency = currency.costToPurchaseOne[0].currency;
      const flavorText = currency.i18n().flavorText;
      const maybeFlavorBox = (
        <span className="tooltip-trigger" style={{ position: "relative", float: "right" }}>[?]
          <div className="tooltip-box">{flavorText}</div>
        </span>
      );
      return (
        <div className={"shop-box " + (currency.isInStock() ? "" : "out-of-stock ") + currency.i18n().shopBoxClass}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <p>{currency.getNamePlural().toUpperCase()}</p>
              <p>{ownAmountText}</p>
            </div>
            <button style={{ width: "50px" }} disabled={!currency.canPurchaseOne()} onClick={() => currency.tryPurchaseOne()}>
              {currency.isInStock() ? "Buy 1" : "SOLD OUT"}
            </button>
          </div>
          <br />
          <p>{currency.isInStock() ? `Cost: ${costCurrency.getNameAmount(costAmount)}` : "Cost: -"}</p>
          <br />
          <div>
            {currency.i18n().shortEffectDescription}
            {flavorText === "" ? null : maybeFlavorBox}
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}