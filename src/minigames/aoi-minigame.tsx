import React from "react";
import "./aoi-minigame.css";
import { RenderGameObject } from "./render-game-object";
import { generateUUID, Vec2, vec2 } from "./util";
import aoi from "../img/aoi.png";
import nuggie from "../img/nuggie.png";
import { GameState } from "../gamestate";
import { SMELL_WAFTER_MOVE_SPEED_BONUS_PERCENT } from "../const";

const BASE_NUGGIE_TIMER = 5.0;
const BASE_AOI_SPEED = 50.0;
const NUGGIE_HIT_RADIUS = 32.0;

class LogicNuggie {
  position = vec2();
  renderObject: any;

  constructor(position: Vec2) {
    this.position = position;
    this.renderObject =
      <RenderGameObject
        key={generateUUID()}
        position={this.position}
        sprite={nuggie}
        spriteWidth={32.0}
        spriteHeight={32.0}
      />
  }
}

interface AoiMinigameAreaProps {
  callbacks: { gameTick: (_: number) => void }
  gameState: GameState
}

interface AoiMinigameAreaState {
  awowi: { position: Vec2 };
  nuggieList: LogicNuggie[];
}

export class AoiMinigameArea extends React.Component {
  props: AoiMinigameAreaProps;
  state: AoiMinigameAreaState;

  timeToNextNuggie = 0.0;
  mousePos: Vec2 = vec2();
  shouldMoveAoi: boolean = false;

  constructor(props: AoiMinigameAreaProps) {
    super(props);
    this.state = {
      awowi: {
        position: vec2(320.0, 180.0)
      },
      nuggieList: []
    };

    props.callbacks.gameTick = this.gameTick;
  }

  handleOnMouseMove = (e) => {
    const parentRect = e.currentTarget.getBoundingClientRect();
    this.mousePos.x = e.clientX - parentRect.left;
    this.mousePos.y = e.clientY - parentRect.top;
  }

  handleOnMouseOver = (e) => {
    this.shouldMoveAoi = true;
  }

  handleOnMouseOut = (e) => {
    this.shouldMoveAoi = false;
  }

  gameTick = (time: number) => {
    this.setState((state: AoiMinigameAreaState, props: AoiMinigameAreaProps) => {
      // Move Aoi very slowly...
      if (this.shouldMoveAoi) {
        const dist = this.mousePos.minus(state.awowi.position);
        const maxDistToMove = time * BASE_AOI_SPEED * (1.0 + (SMELL_WAFTER_MOVE_SPEED_BONUS_PERCENT/100.0)*props.gameState.currencies.get("smellWafter").getCurrentAmount());
        if (dist.mag() <= maxDistToMove) {
          state.awowi.position.set(this.mousePos);
        } else {
          state.awowi.position.plusEquals(dist.unit().times(maxDistToMove));
        }
      }

      // Spawn nuggies
      this.timeToNextNuggie -= time;
      if (this.timeToNextNuggie <= 0.0) {
        this.timeToNextNuggie += BASE_NUGGIE_TIMER;
        const currentNuggiesOnScreen = state.nuggieList.length;
        const numNuggiesToSpawn = Math.min(props.gameState.calculateNuggiesPerCycle(), props.gameState.calculateMaxNuggiesOnScreen() - currentNuggiesOnScreen);
        for (let i = 0; i < numNuggiesToSpawn; i++) {
          state.nuggieList.push(new LogicNuggie(vec2(Math.random() * 640.0, Math.random() * 360.0)));
        }
      }

      // Nom
      state.nuggieList = state.nuggieList.filter((nuggie) => {
        const distance = nuggie.position.minus(state.awowi.position).mag();
        if (distance > NUGGIE_HIT_RADIUS) {
          return true;
        } else {
          // It was eaten
          props.gameState.currencies.get("nuggie").addAmount(1);
          return false;
        }
      });

      return state;
    });
  }

  render() {
    const renderNuggies = this.state.nuggieList.map((logicNuggie) => {
      return logicNuggie.renderObject;
    });
    return (
      <div
        className="aoi-minigame"
        onMouseMove={this.handleOnMouseMove}
        onMouseOver={this.handleOnMouseOver}
        onMouseOut={this.handleOnMouseOut}
      >
        {renderNuggies}
        <RenderGameObject
          position={this.state.awowi.position}
          sprite={aoi}
          spriteWidth={64.0}
          spriteHeight={64.0}
        />
      </div>
    );
  }
}