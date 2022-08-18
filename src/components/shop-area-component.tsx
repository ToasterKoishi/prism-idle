import React from "react";
import { Currency } from "../logic/currency";
import { GameState } from "../logic/game-state";
import { SimpleCurrencyPurchaseComponent } from "./currency-purchase-component";

interface ShopAreaComponentProps {
  gameState: GameState;
  currencyIdsToShow: string[];
};

export class ShopAreaComponent extends React.Component {
  props: ShopAreaComponentProps;

  constructor(props) {
    super(props);
  }

  render() {
    const currenciesToShow = this.props.currencyIdsToShow.map((currency) => this.props.gameState.getCurrency(currency));
    const soldOutCurrencies: Currency[] = [];
    const inStockCurrencies: Currency[] = [];
    currenciesToShow.forEach((currency) => {
      currency.isInStock() ? inStockCurrencies.push(currency) : soldOutCurrencies.push(currency);
    });
    const finalOrderedCurrenciesToShow = currenciesToShow; //[...inStockCurrencies, ...soldOutCurrencies];
    const componentsToShow = finalOrderedCurrenciesToShow.map((currency) => <SimpleCurrencyPurchaseComponent key={currency.getId()} currency={currency} />);

    return (
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start", gap: "20px", margin: "20px" }}>
        {componentsToShow}
      </div>
    );
  }
}