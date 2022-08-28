import { t } from "i18next";
import React, { memo, useState } from "react";
import { TOTER_DEBUG_RENDER_ACTIVITY } from "../const";
import { GameState } from "../logic/game-state";
import { toTitleCase } from "../util";
import { ShopAreaComponent } from "./shop-area-component";

export const TooltipTrigger = memo(function TooltipTrigger(props: { style?: React.CSSProperties, tooltipContents: JSX.Element, tooltipBoxStyle?: React.CSSProperties, children: any }) {
  return (
    <span className="tooltip-trigger" style={props.style}>
      {TOTER_DEBUG_RENDER_ACTIVITY ? (
        <div style={{ position: "absolute", top: "0", left: "0", padding: "2px", backgroundColor: Math.floor(Math.random() * 16777215).toString(16) }} />
      ) : null}
      {props.children}
      <div className="tooltip-box" style={props.tooltipBoxStyle}>{props.tooltipContents}</div>
    </span>
  );
});

export const FancyText = memo(function FancyText(props: { rawText: string }) {
  const effectTextObjects = [];
  let currentId = 0;
  let currentText = "";
  let currentTag = "";
  let currentParams = "";
  let mode = 0; // 0 = text, 1 = tag name, 2 = tag parameters
  const effectText = props.rawText;
  for (let i = 0; i < effectText.length; i++) {
    const char = effectText[i];
    if (mode == 0) {
      if (char == '[') {
        // Begin tag
        if (currentTag.toLowerCase() == "class") {
          effectTextObjects.push((<span key={currentId++} className={currentParams}>{currentText}</span>));
        } else if (currentTag.toLowerCase() == "b" && currentText.length > 0) {
          effectTextObjects.push((<b key={currentId++}>{currentText}</b>));
        } else if (currentText.length > 0) {
          effectTextObjects.push((<span key={currentId++}>{currentText}</span>));
        }
        currentText = "";
        currentTag = "";
        mode = 1;
      } else {
        currentText += char;
      }
    } else if (mode == 1) {
      if (char == ' ') {
        // Begin parameters
        mode = 2;
      } else if (char == ']') {
        if (currentTag[0] == '/') {
          currentTag = "";
          currentParams = "";
        }
        mode = 0;
      } else {
        currentTag += char;
      }
    } else if (mode == 2) {
      if (char == ']') {
        // End tag
        if (currentTag[0] == '/') {
          currentTag = "";
          currentParams = "";
        }
        mode = 0;
      } else {
        currentParams += char;
      }
    }
  }
  if (currentText.length > 0) {
    effectTextObjects.push((<span key={currentId++}>{currentText}</span>));
  }

  return (<span className="fancy-text">
    {effectTextObjects}
    {TOTER_DEBUG_RENDER_ACTIVITY ? (
      <span style={{ display: "inline-block", width: "1px", height: "16px", backgroundColor: Math.floor(Math.random() * 16777215).toString(16) }} />
    ) : null}
  </span>);
});

export function HideableArea(props: { openRef?: { open: boolean }, beforeButtonElement: JSX.Element, alwaysShownElement: JSX.Element, openOnlyElement: JSX.Element }) {
  const [open, setOpen] = useState(props.openRef ? props.openRef.open : true);
  return (
    <div>
      <div style={{ textAlign: "center", margin: "0 auto" }}>
        {props.beforeButtonElement}
        <button onClick={() => { setOpen(!open); if (props.openRef) { props.openRef.open = !open; } }}>{open ? "Hide" : "Show"}</button>
      </div>
      {props.alwaysShownElement}
      {open ? props.openOnlyElement : null}
    </div>
  );
}

export function ActivePassiveToggle(props: { gameState: GameState, toggleEnabled: boolean, generatorId: string, generatorHintElement: JSX.Element, children: any }) {
  const isActiveMode = !props.gameState.getGenerator(props.generatorId).enabled;
  return (
    <div>
      {props.toggleEnabled ? (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", margin: "16px auto 0px" }}>
          <p style={{ textAlign: "right", flexBasis: "0", flexGrow: "1", color: isActiveMode ? "black" : "lightgray" }}>Play minigame <b>| ACTIVE MODE</b></p>
          <div>
            <span style={{ visibility: isActiveMode ? "visible" : "hidden", animation: "small-pulsate-0 1.5s infinite" }}>{"<<<"}</span>
          </div>
          <button style={{ width: "60px" }} onClick={() => { props.gameState.getGenerator(props.generatorId).enabled = isActiveMode; }}>SWAP</button>
          <div>
            <span style={{ visibility: isActiveMode ? "hidden" : "visible", animation: "small-pulsate-0 1.5s infinite" }}>{">>>"}</span>
          </div>
          <div style={{ textAlign: "left", flexBasis: "0", flexGrow: "1", color: isActiveMode ? "lightgray" : "black" }}><b>IDLE MODE |</b>&nbsp;{props.generatorHintElement}</div>
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
      (Max rate: {inputCurrency.getFancyTextName(props.gameState.getResolvedValue(`${props.generatorId}GeneratorIn`).resolve().toFixed(2))}/s → {outputCurrency.getFancyTextName(props.gameState.getResolvedValue(`${props.generatorId}GeneratorOut`).resolve().toFixed(2))}/s)
    </div>
  </div>);
}

export function T1Area(props: { gameState: GameState, characterId: string, currencyId: string, upgradesToShow: string[] }) {
  return (
    <HideableArea
      openRef={props.gameState.liveState[`${props.characterId}Scene`].t1Open}
      beforeButtonElement={(
        <span><b>{t(`character.${props.characterId}.nameFull`)}</b> Tier I Upgrades&nbsp;</span>
      )}
      alwaysShownElement={(
        <div style={{ textAlign: "center", margin: "16px auto" }}>
          <b>{props.gameState.getCurrency(props.currencyId).getFancyTextName(null, { textModifier: toTitleCase })}</b>: {props.gameState.getCurrency(props.currencyId).getCurrentAmountShort()}
        </div>
      )}
      openOnlyElement={(
        <ShopAreaComponent gameState={props.gameState} currencyIdsToShow={props.upgradesToShow} />
      )}
    />
  );
}

export function T2Area(props: { gameState: GameState, characterId: string, currencyId: string, generatorId: string, upgradesToShowTop: string[], upgradesToShowBottom: string[] }) {
  return (
    props.gameState.getCurrency(props.currencyId).getIsRevealed() ? (
      <div>
        <HideableArea
          openRef={props.gameState.liveState[`${props.characterId}Scene`].t2Open}
          beforeButtonElement={(
            <span><b>{t(`character.${props.characterId}.nameFull`)}</b> Tier II Upgrades&nbsp;</span>
          )}
          alwaysShownElement={(
            <ConverterToggle gameState={props.gameState} generatorId={props.generatorId} />
          )}
          openOnlyElement={(
            <div>
              <ShopAreaComponent gameState={props.gameState} currencyIdsToShow={props.upgradesToShowTop} />
              <ShopAreaComponent gameState={props.gameState} currencyIdsToShow={props.upgradesToShowBottom} />
            </div>
          )}
        />
        <div className="shop-divider" />
      </div>
    ) : null
  );
}