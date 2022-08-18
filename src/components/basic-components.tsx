import React, { useState } from "react";
import { GameState } from "../logic/game-state";

export function TooltipTrigger(props: { style?: React.CSSProperties, tooltipContents: JSX.Element, tooltipBoxStyle?: React.CSSProperties, children: any }) {
  return (
    <span className="tooltip-trigger" style={props.style}>
      {props.children}
      <div className="tooltip-box" style={props.tooltipBoxStyle}>{props.tooltipContents}</div>
    </span>
  );
}

export function HideableArea(props: { beforeButtonElement: JSX.Element, alwaysShownElement: JSX.Element, openOnlyElement: JSX.Element }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <div style={{ textAlign: "center", margin: "16px auto" }}>
        {props.beforeButtonElement}
        <button onClick={() => { setOpen(!open); }}>{open ? "Hide" : "Show"}</button>
      </div>
      {props.alwaysShownElement}
      {open ? props.openOnlyElement : null}
    </div>
  );
}

export function ActivePassiveToggle(props: { gameState: GameState, toggleEnabled: boolean, generatorId: string, generatorHintElement: JSX.Element, children: any }) {
  const [isActiveMode, setActiveMode] = useState(!props.gameState.getGenerator(props.generatorId).enabled);
  return (
    <div>
      {props.toggleEnabled ? (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", margin: "16px auto 0px" }}>
          <p style={{ textAlign: "right", flexBasis: "0", flexGrow: "1", color: isActiveMode ? "black" : "lightgray" }}>Play minigame <b>| ACTIVE MODE</b></p>
          <div>
            <span style={{ visibility: isActiveMode ? "visible" : "hidden", animation: "small-pulsate-0 1.5s infinite" }}>{"<<<"}</span>
          </div>
          <button style={{ width: "60px" }} onClick={() => { props.gameState.getGenerator(props.generatorId).enabled = isActiveMode; setActiveMode(!isActiveMode); }}>SWAP</button>
          <div>
            <span style={{ visibility: isActiveMode ? "hidden" : "visible", animation: "small-pulsate-0 1.5s infinite" }}>{">>>"}</span>
          </div>
          <div style={{ textAlign: "left", flexBasis: "0", flexGrow: "1", color: isActiveMode ? "lightgray" : "black" }}><b>PASSIVE MODE |</b>&nbsp;{props.generatorHintElement}</div>
        </div>
      ) : null}

      {isActiveMode ? props.children : null}
    </div>
  );
}

export function ConverterToggle(props: { gameState: GameState, generatorId: string }) {
  const generator = props.gameState.getGenerator(props.generatorId);
  const inputCurrency = props.gameState.getCurrency(generator.inputs[0].currency);
  const outputCurrency = props.gameState.getCurrency(generator.outputs[0].currency);
  const [currentlyEnabled, setCurrentlyEnabled] = useState(generator.enabled);
  return (<div>
    <div style={{ display: "flex", justifyContent: "center", gap: "8px", margin: "16px auto 0px" }}>
      <p style={{ textAlign: "right", flexBasis: "0", flexGrow: "1" }}>{inputCurrency.getCurrentAmountShort()} | <b>{inputCurrency.getNamePlural().toUpperCase()}</b></p>
      <div style={{ visibility: currentlyEnabled ? "visible" : "hidden" }}>
        <span style={{ animation: "small-pulsate-0 1.5s infinite" }}>{">"}</span>
        <span style={{ animation: "small-pulsate-1 1.5s infinite" }}>{">"}</span>
        <span style={{ animation: "small-pulsate-2 1.5s infinite" }}>{">"}</span>
      </div>
      <button style={{ width: "45px" }} onClick={() => { props.gameState.getGenerator(props.generatorId).enabled = !currentlyEnabled; setCurrentlyEnabled(!currentlyEnabled); }}>
        {currentlyEnabled ? "ON" : "OFF"}
      </button>
      <div style={{ visibility: currentlyEnabled ? "visible" : "hidden" }}>
        <span style={{ animation: "small-pulsate-0 1.5s infinite" }}>{">"}</span>
        <span style={{ animation: "small-pulsate-1 1.5s infinite" }}>{">"}</span>
        <span style={{ animation: "small-pulsate-2 1.5s infinite" }}>{">"}</span>
      </div>
      <p style={{ textAlign: "left", flexBasis: "0", flexGrow: "1" }}><b>{outputCurrency.getNamePlural().toUpperCase()}</b> | {outputCurrency.getCurrentAmountShort()}</p>
    </div>
    <div style={{ textAlign: "center", margin: "6px auto 0px" }}>
      (Max rate: {props.gameState.getResolvedValue(`${props.generatorId}GeneratorIn`).resolve().toFixed(2)}/s → {props.gameState.getResolvedValue(`${props.generatorId}GeneratorOut`).resolve().toFixed(2)}/s)
    </div>
  </div>);
}