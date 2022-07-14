import React from "react";
import "../app.css";
import { AOI_BOOST_PER_NFT, AOI_DOG_SPEED, awowiFullName, awowiName, BASE_AOI_SPEED, BASE_WCBONALDS_POSITION, COMPRESSED_NUGGIE_1_RATE, NUGGIE_HIT_RADIUS, NUGGIE_MAGNET_AREA_EACH, SCENE_SIZE, SMELL_WAFTER_MOVE_SPEED_BONUS_PERCENT } from "../const";
import { GameState } from "../logic/game-state";
import aoi from "../img/aoi.png";
import dog from "../img/dog.png";
import nuggies from "../img/nuggies.png";
import { RenderGameObject } from "./render-game-object";
import { degToRad, generateUUID, Vec2, vec2 } from "../util";

const RHYTHM_GAME_TIMING_WINDOW = 0.2;

class LogicNuggie {
  id = generateUUID();
  position = vec2();
  velocity = vec2(); // Lol
  rotation = Math.floor(Math.random() * 16.0);
  scale = Math.random() * 0.2 + 0.9;
  spawningTime = 1.0;
  isDespawning = false;
  despawningTime = 1.0;
  lifetime = 120.0;

  isCompressed = false;

  constructor(gameState: GameState, position: Vec2, velocity: Vec2 = vec2()) {
    this.position = position;
    this.velocity = velocity;
    this.isCompressed = Math.random() < gameState.getResolvedValue("compressedNuggiesRate").resolve();
  }

  gameTick = (time: number) => {
    this.spawningTime -= time / 0.4;
    if (this.isDespawning) {
      this.despawningTime -= time / 0.3;
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

class LogicFloatingNumber {
  id: number = generateUUID();
  lifetime: number = 1.0;
  renderObject: any;
  constructor(position: Vec2, text: string, textStyle: string) {
    this.renderObject =
      <RenderFloatingNumber
        key={this.id}
        position={vec2(Math.round(position.x), Math.round(position.y))}
        text={text}
        textStyle={textStyle}
      />
  }
  gameTick = (time: number) => {
    this.lifetime -= time;
  }
}

class RenderFloatingNumber extends React.Component {
  props: {
    position: Vec2,
    text: string,
    textStyle: string,
  };
  render() {
    return (
      <div className="floating-number-outer" style={{
        left: `${this.props.position.x - 100}px`,
        top: `${this.props.position.y - 10}px`,
      }}>
        <p className={this.props.textStyle}><b>{this.props.text}</b></p>
      </div>
    )
  }
}

interface AoiMinigameAreaProps {
  callbacks: { gameTick: (_: number) => void }
  gameState: GameState
}

interface AoiMinigameAreaState {
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
    // this.shouldMoveAoi = false;
  }

  handleOnMouseDown = (e) => {
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
  componentDidMount(): void {
  }

  gameTick = (time: number) => {
    if (this.props.gameState.getGenerator("nuggie").enabled) {
      return;
    }

    if (time > 60.0) {
      // Don't run the game simulation if it's too large an amount of time to prevent insane lag
      // Grant some pity nuggies equivalent to running in passive mode for that period of time
      this.props.gameState.getCurrency("nuggie").addFractionalAmount(this.props.gameState.getResolvedValue("nuggieGenerator").resolve() * time);
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
        const boostedDistance = boostTime * gameState.getCurrency("nuggieFlavorTechnique").getCurrentAmountShort() * AOI_BOOST_PER_NFT;
        const maxDistToMove = time * BASE_AOI_SPEED * (1.0 + (SMELL_WAFTER_MOVE_SPEED_BONUS_PERCENT / 100.0) * Number(gameState.getCurrency("smellWafter").getCurrentAmount())) + boostedDistance;
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
        const magnetRange = Math.sqrt(NUGGIE_MAGNET_AREA_EACH * gameState.getCurrency("nuggieMagnet").getCurrentAmountShort());
        if (nuggie.spawningTime <= 0.0 && magnetRange > 0) {
          if (distance2 < magnetRange) {
            nuggie.velocity = vec2();
            nuggie.position.plusEquals(distance.unit().times(-1 * time * 4.0 * (magnetRange)));
          }
        }

        nuggie.gameTick(time);

        // Check if it's eaten
        if (nuggie.spawningTime <= 0.0 && !nuggie.isDespawning && distance2 <= NUGGIE_HIT_RADIUS) {
          const amountGained = this.amountGainedForNuggie(nuggie);
          gameState.getCurrency("nuggie").addFractionalAmount(amountGained);
          this.floatingNumbers.push(new LogicFloatingNumber(nuggie.position, `+${amountGained.toFixed(2).replace(/\.?0+$/, '')}${nuggie.isCompressed ? "!" : ""}`, nuggie.isCompressed ? "floating-number-inner-crit" : "floating-number-inner"));
          nuggie.onNuggieEaten();
          anyNuggieEaten = true;
        }

        // Remove when fully despawned
        return nuggie.despawningTime > 0.0;
      });

      // Update dog
      if (!state.dog.enabled) {
        state.dog.position.set(state.awowi.position);
      }
      state.dog.enabled = gameState.getCurrency("nuggieDog").getCurrentAmount() > 0;
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
              if (nuggie.spawningTime <= 0.0 && !nuggie.isDespawning && distance <= gameState.calculateNuggieDogHitRadius()) {
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
              gameState.getCurrency("nuggie").addFractionalAmount(state.dog.nuggiesCollected);
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
      if (anyNuggieEaten && gameState.getCurrency("nuggieFlavorTechnique").getCurrentAmountShort() > 0) {
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
        state.timeToNextNuggie += gameState.getResolvedValue("airFryerRate").resolve();
        const numNuggiesToSpawn = gameState.getResolvedValue("airFryerAmount").resolve();
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
        state.timeToNextDelivery += gameState.getResolvedValue("wcbonaldsRate").resolve();
        if (this.isAoiInDeliveryArea()) {
          const numNuggiesToSpawn = gameState.getResolvedValue("wcbonaldsAmount").resolve();
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

          if (nuggie.spawningTime > 0) {
            context.rotate(nuggie.spawningTime);
            context.globalAlpha = 1.0 - nuggie.spawningTime;
          } else if (nuggie.isDespawning) {
            context.scale(nuggie.despawningTime, nuggie.despawningTime);
            context.globalAlpha = nuggie.despawningTime;
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

        if (gameState.getCurrency("aoiRhythmGames").getCurrentAmount() > 0n) {
          context.setTransform(1, 0, 0, 1, 0, 0);
          context.globalAlpha = 1.0;
          context.fillStyle = state.rhythmGame.flickerTime > 0 ? state.rhythmGame.flickerColor : "#000000";
          context.strokeStyle = context.fillStyle;
          
          context.fillRect(10, canvas.height - 15, canvas.width - 20, 1);

          context.beginPath();
          context.arc(canvas.width / 2, canvas.height - 15, 8, 0, 2.0 * Math.PI);
          context.stroke();

          let dx = state.rhythmGame.timer * 100.0;
          if (dx < 0) {
            dx += 100.0;
          }
          while (dx < (canvas.width - 20) / 2) {
            context.globalAlpha = Math.min(Math.max(0.0, 1.2 - dx / 360.0), 1.0);
            context.fillRect(canvas.width / 2 + dx - 4, canvas.height - 25, 8, 20);
            context.fillRect(canvas.width / 2 - dx - 4, canvas.height - 25, 8, 20);
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
      (nuggie.isCompressed ? this.props.gameState.getResolvedValue("compressedNuggiesAmount").resolve() : 1.0)
      * this.props.gameState.getResolvedValue("nuggieGlobalPercent").resolve() *
      (1.0 + this.state.rhythmGame.combo * this.props.gameState.getCurrency("aoiRhythmGames").getCurrentAmountShort() * 0.01)
    );
  }

  render() {
    const gameState = this.props.gameState;
    const isActiveMode = !gameState.getGenerator("nuggie").enabled;

    const deliveryVisibility = gameState.getCurrency("wcbonalds").getCurrentAmount() > 0 ? "visible" : "hidden";
    const comboVisibility = gameState.getCurrency("aoiRhythmGames").getCurrentAmount() > 0 ? "visible" : "hidden";
    const floatingNumbers = this.floatingNumbers.map((logicObject) => logicObject.renderObject);

    return (
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ margin: "auto", textAlign: "center" }}>
          <h1 style={{}}>{awowiName}'s Room</h1>
          {gameState.getCurrency("aoiT2Unlock").getCurrentAmount() ? (
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", margin: "16px auto 0px" }}>
              <p style={{ textAlign: "right", flexBasis: "0", flexGrow: "1", color: isActiveMode ? "black" : "lightgray" }}>Play minigame <b>| ACTIVE MODE</b></p>
              <div>
                <span style={{ visibility: isActiveMode ? "visible" : "hidden", animation: "small-pulsate-0 1.5s infinite" }}>{"<<<"}</span>
              </div>
              <button style={{ width: "60px" }} onClick={() => { gameState.getGenerator("nuggie").enabled = !gameState.getGenerator("nuggie").enabled; this.setState(this.state); }}>SWAP</button>
              <div>
                <span style={{ visibility: isActiveMode ? "hidden" : "visible", animation: "small-pulsate-0 1.5s infinite" }}>{">>>"}</span>
              </div>
              <p style={{ textAlign: "left", flexBasis: "0", flexGrow: "1", color: isActiveMode ? "lightgray" : "black" }}><b>PASSIVE MODE |</b> {gameState.getResolvedValue("nuggieGenerator").resolve().toFixed(2)} nuggies/s <span className="tooltip-trigger">[?]<div className="tooltip-box" style={{ bottom: "auto", top: "20" }}><b>Base generation:</b> {gameState.getResolvedValue("nuggieGeneratorBase").resolve().toFixed(2)} nuggies/s<br /><b>Motivation:</b> x{gameState.getResolvedValue("nuggieGeneratorMulti").resolve().toFixed(3)}</div></span></p>
            </div>
          ) : null}

          {isActiveMode ? (
            <div>
              <p style={{ margin: "16pt auto 16pt", textAlign: "left" }}>Welcome to {awowiName}'s room! It is very messy, and {gameState.getCurrency("nuggie").i18n().namePlural} keep showing up in the most unexpected places. Use your mouse to guide {awowiName} to those delicious {gameState.getCurrency("nuggie").i18n().namePlural}! Unfortunately, {awowiName} is very :aoilazy: and moves frustratingly slow. We can probably find some way to motivate her... right...?</p>
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
                  <b>Combo: {this.state.rhythmGame.combo}/10 (x{(1.0 + this.state.rhythmGame.combo * gameState.getCurrency("aoiRhythmGames").getCurrentAmountShort() * 0.01).toFixed(2)})</b>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="shop-divider" />
      </div>
    );
  }
}