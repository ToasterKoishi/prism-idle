import { t } from "i18next";
import { default as React } from "react";
import { TOTER_DEBUG } from "../app";
import { Currency } from "../logic/currency";
import { toTitleCase } from "../util";
import { TooltipTrigger } from "./basic-components";

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
    const name = currency.purchaseWordingType == PURCHASE_WORDING_TYPE.LEARN ? currency.getNamePlural() : toTitleCase(currency.getNamePlural());

    let ownAmountText = "";
    if (currency.maximumStock === 1n) {
      // Use one-shot unlock style
      ownAmountText = currency.isInStock() ? "" : ` (${purchaseWording.oneshotBought})`;
    } else {
      ownAmountText = ` ${purchaseWording.owned}: ${currency.getCurrentAmount()}${currency.maximumStock > 0 ? "/" + currency.maximumStock : ""}`
    }

    if (currency.getIsRevealed()) {
      const interpolations = currency.i18n.interpolations();
      const flavorText = t("currency." + currency.getId() + ".flavorText");
      const maybeFlavorBox = (
        <TooltipTrigger style={{ position: "relative", float: "right" }} tooltipBoxStyle={{ bottom: "18px", right: "18px" }} tooltipContents={(<div>{flavorText}</div>)}>
          <span>[?]</span>
        </TooltipTrigger>
      );
      return (
        <div className="upwards-fade-in">
          <div className={"shop-box " + (currency.getIsUnlocked() ? "" : "not-unlocked ") + (currency.isInStock() ? "" : "out-of-stock ") + currency.i18n.shopBoxClass}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                {TOTER_DEBUG ? (
                  <TooltipTrigger tooltipBoxStyle={{ bottom: "18px", width: "max-content" }} tooltipContents={<div><button onClick={() => navigator.clipboard.writeText(currency.getId())}>Copy</button> {currency.getId()}</div>}>
                    <p><b>{name}</b></p>
                  </TooltipTrigger>
                ) : (
                  <p><b>{name}</b></p>
                )}
                <p>{ownAmountText}</p>
              </div>
              <button style={{ width: "55px", height: "38px", flexShrink: "0" }} disabled={!currency.canPurchaseOne()} onClick={() => this.setState((state) => { currency.tryPurchaseOne(); return { state: state }; })}>
                {currency.isInStock() ? (currency.maximumStock > 1 ? purchaseWording.buyOne : purchaseWording.buyOnly) : purchaseWording.soldOut}
              </button>
            </div>
            <p>{
              currency.getIsUnlocked() ?
                (currency.isInStock() ? `Cost: ${currency.getGameState().renderCosts(currency.costToPurchaseOne())}` : "Cost: -") :
                (`Requires: ${currency.getGameState().renderCosts(currency.unlockRequirements)}`)
            }</p>
            <div style={{ width: "80%", height: "1px", margin: "9px auto", background: "linear-gradient(90deg, #80808000, #808080FF 20%, #808080FF 80%, #80808000)" }} />
            <div className="clearfix">
              {t("currency." + currency.getId() + ".shortEffectDescription", interpolations)}
              {flavorText === "" ? null : maybeFlavorBox}
            </div>
          </div>
        </div >
      );
    } else {
      return null;
    }
  }
}