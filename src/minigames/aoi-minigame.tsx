import { t } from "i18next";
import React from "react";
import { ActivePassiveToggle } from "../components/basic-components";
import { AOI_BOOST_PER_NFT, AOI_DOG_SPEED, BASE_AOI_SPEED, BASE_WCBONALDS_POSITION, NUGGIE_HIT_RADIUS, NUGGIE_MAGNET_AREA_EACH, SCENE_SIZE, SMELL_WAFTER_MOVE_SPEED_BONUS_PERCENT } from "../const";
import aoi from "../img/aoi.png";
import dog from "../img/dog.png";
import nuggies from "../img/nuggies.png";
import { GameState } from "../logic/game-state";
import { degToRad, generateUUID, Vec2, vec2 } from "../util";
import { LogicFloatingNumber, RenderGameObject } from "./render-game-object";

const RHYTHM_GAME_TIMING_WINDOW = 0.2;

class LogicNuggie {
  id = generateUUID();
  position = vec2();
  velocity = vec2(); // Lol
  rotation = Math.floor(Math.random() * 16.0);
  spawnProgress = 1.0;
  isDespawning = false;
  despawnProgress = 1.0;
  lifetime = 120.0;

  isCompressed = false;

  constructor(gameState: GameState, position: Vec2, velocity: Vec2 = vec2()) {
    this.position.set(position);
    this.velocity.set(velocity);
    this.isCompressed = Math.random() < gameState.getResolvedValue("aoi.compressedNuggiesRate").resolve();
  }

  gameTick = (time: number) => {
    this.spawnProgress -= time / 0.4;
    if (this.isDespawning) {
      this.despawnProgress -= time / 0.3;
    }

    this.lifetime -= time;
    if (this.lifetime <= 0.0) {
      this.isDespawning = true;
    }

    const newSpeed = Math.max(0.0, this.velocity.mag() - (100.0 * time));
    const newVelocity = this.velocity.isZero() ? this.velocity : this.velocity.unit().times(newSpeed);
    this.position.plusEquals(this.velocity.plus(newVelocity).times(0.5 * time));
    this.velocity = newVelocity;

    // Bounce off edges
    if (this.position.x < 0) {
      this.position.x *= -1;
      this.velocity.x *= -1;
    } else if (this.position.x > SCENE_SIZE.x) {
      this.position.x = 2 * SCENE_SIZE.x - this.position.x;
      this.velocity.x *= -1;
    }
    if (this.position.y < 0) {
      this.position.y *= -1;
      this.velocity.y *= -1;
    } else if (this.position.y > SCENE_SIZE.y) {
      this.position.y = 2 * SCENE_SIZE.y - this.position.y;
      this.velocity.y *= -1;
    }
  }

  onNuggieEaten = () => {
    this.isDespawning = true;
    this.velocity = vec2();
  }
}

interface AoiMinigameAreaProps {
  hooks: { gameTick: ((_: number) => void)[] }
  gameState: GameState
}

export interface AoiMinigameAreaState {
  awowi: {
    position: Vec2,
    boost: number,
    filter: any
  };
  dog: {
    enabled: boolean,
    position: Vec2,
    targetPosition: Vec2,
    nuggiesCollected: number,
    workTime: number, // Max time per cycle
    workPhase: number, // 0 = go out, 1 = collect, 2 = return, 3 = drop off
    phaseTime: number, // Waits for 0.5s at collect phase
  };
  nuggieList: LogicNuggie[];
  timeToNextNuggie: number;
  timeToNextDelivery: number;
  rhythmGame: {
    timer: number,
    combo: number,
    flickerTime: number,
    flickerColor: string,
  };
}

export class AoiMinigameArea extends React.Component {
  props: AoiMinigameAreaProps;
  state: AoiMinigameAreaState;

  canvasRef = React.createRef<HTMLCanvasElement>();
  nuggieSpritesheetRef = React.createRef<HTMLImageElement>();

  floatingNumbers: LogicFloatingNumber[] = [];
  mousePos: Vec2 = vec2();
  shouldMoveAoi: boolean = false;

  constructor(props: AoiMinigameAreaProps) {
    super(props);

    this.state = {
      awowi: {
        position: SCENE_SIZE.times(0.5),
        boost: 0.0,
        filter: {}
      },
      dog: {
        enabled: false,
        position: vec2(),
        targetPosition: vec2(),
        nuggiesCollected: 0.0,
        workTime: 0.0,
        workPhase: 4,
        phaseTime: 0.0,
      },
      nuggieList: [],
      timeToNextNuggie: 0.0,
      timeToNextDelivery: 15.0,
      rhythmGame: {
        timer: 0.0,
        combo: 0,
        flickerTime: 0.0,
        flickerColor: "#000000"
      }
    };
  }

  componentDidMount(): void {
    this.props.hooks.gameTick.push(this.gameTick);
    if (this.props.gameState.liveState.aoiMinigame) {
      Object.assign(this.state, this.props.gameState.liveState.aoiMinigame);
    }
  }

  componentWillUnmount(): void {
    this.props.hooks.gameTick.splice(this.props.hooks.gameTick.indexOf(this.gameTick), 1);
    this.props.gameState.liveState.aoiMinigame = this.state;
  }

  handleOnMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const parentRect = e.currentTarget.getBoundingClientRect();
    this.mousePos.x = e.clientX - parentRect.left;
    this.mousePos.y = e.clientY - parentRect.top;
  }

  handleOnMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
    this.shouldMoveAoi = true;
  }

  handleOnMouseOut = (e: React.MouseEvent<HTMLDivElement>) => {
    this.shouldMoveAoi = false;
  }

  handleOnMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button == 0) {
      if (this.state.rhythmGame.timer < RHYTHM_GAME_TIMING_WINDOW) {
        this.setState((state: AoiMinigameAreaState) => {
          return {
            rhythmGame: {
              timer: state.rhythmGame.timer + 1.0,
              combo: Math.min(state.rhythmGame.combo + 1, 10),
              flickerTime: 0.1,
              flickerColor: "#008000",
            }
          };
        });
      } else {
        this.setState((state: AoiMinigameAreaState) => {
          return {
            rhythmGame: {
              timer: state.rhythmGame.timer,
              combo: Math.max(0, state.rhythmGame.combo - 1),
              flickerTime: 0.1,
              flickerColor: "#FF0000",
            }
          };
        });
      }
    }
  }

  gameTick = (time: number) => {
    if (this.props.gameState.getGenerator("aoi.passiveMode").enabled) {
      return;
    }

    if (time > 60.0) {
      // Don't run the game simulation if it's too large an amount of time to prevent insane lag
      // Grant some pity equivalent to running in passive mode for that period of time
      this.props.gameState.getCurrency("aoi.nuggie").addFractionalAmount(this.props.gameState.getResolvedValue("aoi.nuggieGenerator").resolve() * time);
      return;
    }

    this.setState((state: AoiMinigameAreaState, props: AoiMinigameAreaProps) => {
      const gameState = props.gameState;

      // Update Aoi
      if (state.awowi.boost > 0) {
        state.awowi.filter = { filter: `brightness(${100 + Math.floor(state.awowi.boost * 250)}%)` };
      } else {
        state.awowi.filter = {};
      }
      const boostTime = Math.min(state.awowi.boost, time);
      state.awowi.boost -= boostTime;
      if (this.shouldMoveAoi) {
        const dist = this.mousePos.minus(state.awowi.position);
        const boostedDistance = boostTime * gameState.getCurrency("aoi.nuggieFlavorTechnique").getCurrentAmountShort() * AOI_BOOST_PER_NFT;
        const maxDistToMove = time * BASE_AOI_SPEED * (1.0 + (SMELL_WAFTER_MOVE_SPEED_BONUS_PERCENT / 100.0) * Number(gameState.getCurrency("aoi.smellWafter").getCurrentAmount())) + boostedDistance;
        if (dist.mag() <= maxDistToMove) {
          state.awowi.position.set(this.mousePos);
        } else {
          state.awowi.position.plusEquals(dist.unit().times(maxDistToMove));
        }
      }

      // Update nuggies
      let anyNuggieEaten = false;
      state.nuggieList = state.nuggieList.filter((nuggie) => {
        const distance = nuggie.position.minus(state.awowi.position);
        const distance2 = distance.mag();

        // Magnet
        const magnetRange = Math.sqrt(NUGGIE_MAGNET_AREA_EACH * gameState.getCurrency("aoi.nuggieMagnet").getCurrentAmountShort());
        if (nuggie.spawnProgress <= 0.0 && magnetRange > 0) {
          if (distance2 < magnetRange) {
            nuggie.velocity = vec2();
            nuggie.position.plusEquals(distance.unit().times(-1 * time * 4.0 * (magnetRange)));
          }
        }

        nuggie.gameTick(time);

        // Check if it's eaten
        if (nuggie.spawnProgress <= 0.0 && !nuggie.isDespawning && distance2 <= NUGGIE_HIT_RADIUS) {
          const amountGained = this.amountGainedForNuggie(nuggie);
          gameState.getCurrency("aoi.nuggie").addFractionalAmount(amountGained);
          this.floatingNumbers.push(new LogicFloatingNumber(nuggie.position, `+${amountGained.toFixed(2).replace(/\.?0+$/, '')}${nuggie.isCompressed ? "!" : ""}`, nuggie.isCompressed ? "floating-number-inner-crit" : "floating-number-inner"));
          nuggie.onNuggieEaten();
          anyNuggieEaten = true;
        }

        // Remove when fully despawned
        return nuggie.despawnProgress > 0.0;
      });

      // Update dog
      if (!state.dog.enabled) {
        state.dog.position.set(state.awowi.position);
      }
      state.dog.enabled = gameState.getCurrency("aoi.nuggieDog").getCurrentAmount() > 0;
      if (state.dog.enabled) {
        if (state.dog.workTime <= 0.0) {
          // Acquire target
          if (state.nuggieList.length > 0) {
            state.dog.targetPosition.set(state.nuggieList[Math.floor(Math.random() * state.nuggieList.length)].position);
            state.dog.workTime += gameState.calculateNuggieDogCycleTime();
            state.dog.workPhase = 0;
          } else {
            // Delay until next frame
            state.dog.workTime = time;
          }
        }

        if (state.dog.workPhase === 0) {
          // Go out
          const maxDist = AOI_DOG_SPEED * time;
          const dv = state.dog.targetPosition.minus(state.dog.position);
          if (dv.mag() <= maxDist) {
            state.dog.position.set(state.dog.targetPosition);
            state.dog.workPhase = 1;
            state.dog.phaseTime = 0.5;

            // Collect nuggies one time instantaneously when dog stops
            state.nuggieList.forEach((nuggie) => {
              const distance = nuggie.position.minus(state.dog.position).mag();
              if (nuggie.spawnProgress <= 0.0 && !nuggie.isDespawning && distance <= gameState.calculateNuggieDogHitRadius()) {
                state.dog.nuggiesCollected += this.amountGainedForNuggie(nuggie);
                nuggie.onNuggieEaten();
              }
            });
          } else {
            state.dog.position.plusEquals(dv.unit().times(maxDist));
          }
        } else if (state.dog.workPhase === 1) {
          // Wait
          state.dog.phaseTime -= time;
          if (state.dog.phaseTime <= 0.0) {
            state.dog.workPhase = 2;
          }
        } else if (state.dog.workPhase === 2) {
          // Return to Awowi
          state.dog.targetPosition.set(state.awowi.position);
          const maxDist = AOI_DOG_SPEED * time;
          const dv = state.dog.targetPosition.minus(state.dog.position);
          if (dv.mag() <= maxDist) {
            state.dog.position.set(state.dog.targetPosition);
            state.dog.workPhase = 3;

            // Attempt drop-off one time instantaneously when dog stops
            if (state.awowi.position.minus(state.dog.position).mag() <= NUGGIE_HIT_RADIUS && state.dog.nuggiesCollected > 0n) {
              gameState.getCurrency("aoi.nuggie").addFractionalAmount(state.dog.nuggiesCollected);
              this.floatingNumbers.push(new LogicFloatingNumber(state.awowi.position, `+${state.dog.nuggiesCollected.toFixed(2).replace(/\.?0+$/, '')}`, "floating-number-inner-dog"));
              state.dog.nuggiesCollected = 0.0;
              anyNuggieEaten = true;
            }
          } else {
            state.dog.position.plusEquals(dv.unit().times(maxDist));
          }
        }

        state.dog.workTime -= time;
      }

      // NFT (Nuggie Flavor Technique)
      if (anyNuggieEaten && gameState.getCurrency("aoi.nuggieFlavorTechnique").getCurrentAmountShort() > 0) {
        state.awowi.boost = 0.1;
      }

      // Update floating text
      this.floatingNumbers = this.floatingNumbers.filter((obj) => {
        obj.gameTick(time);
        return obj.lifetime > 0.0;
      });

      // Spawn randomly-spawning nuggies
      state.timeToNextNuggie -= time;
      if (state.timeToNextNuggie <= 0.0) {
        state.timeToNextNuggie += gameState.getResolvedValue("aoi.airFryerRate").resolve();
        const numNuggiesToSpawn = gameState.getResolvedValue("aoi.airFryerAmount").resolve();
        for (let i = 0; i < numNuggiesToSpawn; i++) {
          state.nuggieList.push(new LogicNuggie(gameState,
            vec2(Math.random() * SCENE_SIZE.x, Math.random() * SCENE_SIZE.y),
            Vec2.randomUnit().times(120.0)
          ));
        }
      }

      // Spawn nuggies from delivery BUT ONLY IF AWOWI IS THERE!!!!!oneoneoneoe
      state.timeToNextDelivery -= time;
      if (state.timeToNextDelivery <= 0.0) {
        state.timeToNextDelivery += gameState.getResolvedValue("aoi.wcbonaldsRate").resolve();
        if (this.isAoiInDeliveryArea()) {
          const numNuggiesToSpawn = gameState.getResolvedValue("aoi.wcbonaldsAmount").resolve();
          for (let i = 0; i < numNuggiesToSpawn; i++) {
            const center = vec2(BASE_WCBONALDS_POSITION.left + BASE_WCBONALDS_POSITION.width / 2, BASE_WCBONALDS_POSITION.top + BASE_WCBONALDS_POSITION.height / 2);
            const radius = Math.random() * BASE_WCBONALDS_POSITION.height * 0.4;
            state.nuggieList.push(new LogicNuggie(gameState,
              center.plus(Vec2.randomUnit().times(radius)),
              Vec2.unit(degToRad(150.0 + 60.0 * Math.random())).times(120.0 + 240.0 * Math.random())));
          }
        }
      }

      // Update rhythm game timer
      state.rhythmGame.timer -= time;
      state.rhythmGame.flickerTime -= time;
      if (state.rhythmGame.timer < -RHYTHM_GAME_TIMING_WINDOW) {
        // Note missed
        state.rhythmGame.timer = (state.rhythmGame.timer % 1.0) + 1.0;
        state.rhythmGame.combo = Math.max(0, state.rhythmGame.combo - 1);
        state.rhythmGame.flickerTime = 0.1;
        state.rhythmGame.flickerColor = "#FF0000";
      }

      // Draw
      const canvas = this.canvasRef.current;
      if (canvas) {
        canvas.width = 960;
        canvas.height = 540;

        const context = canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        this.state.nuggieList.forEach((nuggie) => {
          context.setTransform(1, 0, 0, 1, Math.floor(nuggie.position.x), Math.floor(nuggie.position.y));

          if (nuggie.spawnProgress > 0) {
            context.rotate(nuggie.spawnProgress);
            context.globalAlpha = 1.0 - nuggie.spawnProgress;
          } else if (nuggie.isDespawning) {
            context.scale(nuggie.despawnProgress, nuggie.despawnProgress);
            context.globalAlpha = nuggie.despawnProgress;
          } else {
            context.globalAlpha = 1;
          }

          const ssx = 64 * nuggie.rotation;
          const ssy = nuggie.isCompressed ? 64 : 0;
          context.drawImage(
            this.nuggieSpritesheetRef.current,
            ssx, ssy, 64, 64,
            -32, -32, 64, 64);
        });

        if (gameState.getCurrency("aoi.aoiRhythmGames").getCurrentAmount() > 0n) {
          context.setTransform(1, 0, 0, 1, 0, 0);
          context.globalAlpha = 1.0;
          context.fillStyle = state.rhythmGame.flickerTime > 0 ? state.rhythmGame.flickerColor : "#000000";
          context.strokeStyle = context.fillStyle;

          context.fillRect(10, canvas.height - 15, canvas.width - 20, 1);

          context.beginPath();
          context.arc(canvas.width / 2, canvas.height - 15, 8, 0, 2.0 * Math.PI);
          context.stroke();

          let dx = state.rhythmGame.timer * 100.0;
          while (dx < (canvas.width - 20) / 2) {
            const edx = Math.max(0, dx);
            context.globalAlpha = Math.min(Math.max(0.0, 1.2 - edx / 360.0), 1.0);
            context.fillRect(canvas.width / 2 + edx - 4, canvas.height - 25, 8, 20);
            context.fillRect(canvas.width / 2 - edx - 4, canvas.height - 25, 8, 20);
            dx += 100.0;
          }
        }
      }

      return state;
    });
  }

  isAoiInDeliveryArea = () => {
    return this.state.awowi.position.x >= BASE_WCBONALDS_POSITION.left &&
      this.state.awowi.position.y >= BASE_WCBONALDS_POSITION.top &&
      this.state.awowi.position.x <= BASE_WCBONALDS_POSITION.left + BASE_WCBONALDS_POSITION.width &&
      this.state.awowi.position.y <= BASE_WCBONALDS_POSITION.top + BASE_WCBONALDS_POSITION.height;
  }

  amountGainedForNuggie: (_: LogicNuggie) => number = (nuggie: LogicNuggie) => {
    return (
      (nuggie.isCompressed ? this.props.gameState.getResolvedValue("aoi.compressedNuggiesAmount").resolve() : 1.0)
      * this.props.gameState.getResolvedValue("aoi.nuggieGlobalPercent").resolve() *
      (1.0 + this.state.rhythmGame.combo * this.props.gameState.getCurrency("aoi.aoiRhythmGames").getCurrentAmountShort() * 0.01)
    );
  }

  render() {
    const gameState = this.props.gameState;

    const deliveryVisibility = gameState.getCurrency("aoi.wcbonalds").getCurrentAmount() > 0 ? "visible" : "hidden";
    const comboVisibility = gameState.getCurrency("aoi.aoiRhythmGames").getCurrentAmount() > 0 ? "visible" : "hidden";
    const floatingNumbers = this.floatingNumbers.map((logicObject) => logicObject.renderObject);

    return (
      <div className="minigame-area">
        <h1 style={{}}>{t("minigame.aoi.name")}</h1>
        <ActivePassiveToggle
          gameState={this.props.gameState}
          toggleEnabled={gameState.getCurrency("aoi.t2Unlock").getCurrentAmount() > 0n}
          generatorId="aoi.passiveMode"
          generatorHintElement={<span>{this.props.gameState.getResolvedValue("aoi.nuggieGenerator").resolve().toFixed(2)} nuggies/s <span className="tooltip-trigger">[?]<div className="tooltip-box" style={{ bottom: "auto", top: "20" }}><b>Base generation:</b> {gameState.getResolvedValue("aoi.nuggieGeneratorBase").resolve().toFixed(2)} nuggies/s<br /><b>Motivation:</b> x{gameState.getResolvedValue("aoi.nuggieGeneratorMulti").resolve().toFixed(3)}</div></span></span>}
        >
          <div>
            <p style={{ margin: "16pt auto 16pt", textAlign: "left" }}>
              {t("minigame.aoi.description")}</p>
            <div
              className="minigame-size aoi-minigame"
              onMouseMove={this.handleOnMouseMove}
              onMouseOver={this.handleOnMouseOver}
              onMouseOut={this.handleOnMouseOut}
              onMouseDown={this.handleOnMouseDown}
            >
              <img style={{ display: "none" }} src={nuggies} ref={this.nuggieSpritesheetRef} />

              <div style={{
                visibility: deliveryVisibility,
                position: "absolute",
                left: BASE_WCBONALDS_POSITION.left,
                top: BASE_WCBONALDS_POSITION.top,
                width: BASE_WCBONALDS_POSITION.width,
                height: BASE_WCBONALDS_POSITION.height,
                backgroundColor: this.isAoiInDeliveryArea() ? "green" : "brown",
                outline: "1px solid black"
              }} />

              <canvas className="minigame-size" ref={this.canvasRef} />
              <RenderGameObject
                position={this.state.dog.position}
                sprite={dog}
                spriteWidth={64.0}
                spriteHeight={64.0}
                innerStyle={{ visibility: this.state.dog.enabled ? "visible" : "hidden" }}
              />
              <RenderGameObject
                position={this.state.awowi.position}
                sprite={aoi}
                spriteWidth={64.0}
                spriteHeight={64.0}
                innerStyle={this.state.awowi.filter}
              />

              {floatingNumbers}

              <div style={{
                visibility: deliveryVisibility,
                position: "absolute",
                right: "10px",
                top: "10px",
                color: "black",
                userSelect: "none"
              }}>
                <b style={{ color: this.isAoiInDeliveryArea() ? "#00ff00" : ((this.state.timeToNextDelivery < 10 && this.state.timeToNextDelivery % 1 >= 0.5) || (this.state.timeToNextDelivery < 50 && this.state.timeToNextDelivery % 10 >= 9.5) ? "#ff0000" : "black") }}>Time to next delivery: {this.state.timeToNextDelivery.toFixed(1)}</b>
              </div>

              <div style={{
                visibility: comboVisibility,
                position: "absolute",
                margin: "0 auto",
                left: "0",
                right: "0",
                bottom: "32px",
                color: this.state.rhythmGame.flickerTime > 0 ? this.state.rhythmGame.flickerColor : "black",
                userSelect: "none"
              }}>
                <b>Combo: {this.state.rhythmGame.combo}/10 (x{(1.0 + this.state.rhythmGame.combo * gameState.getCurrency("aoi.aoiRhythmGames").getCurrentAmountShort() * 0.01).toFixed(2)})</b>
              </div>
            </div>
          </div>
        </ActivePassiveToggle>

        <div className="shop-divider" />
      </div>
    );
  }
}