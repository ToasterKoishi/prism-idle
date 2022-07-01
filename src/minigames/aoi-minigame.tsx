import React from "react";
import "../app.css";
import { AOI_BOOST_PER_NFT, AOI_DOG_SPEED, BASE_AOI_SPEED, BASE_WCBONALDS_POSITION, COMPRESSED_NUGGIE_1_RATE, NUGGIE_HIT_RADIUS, NUGGIE_MAGNET_AREA_EACH, SCENE_SIZE, SMELL_WAFTER_MOVE_SPEED_BONUS_PERCENT } from "../const";
import { GameState } from "../gamestate";
import aoi from "../img/aoi.png";
import dog from "../img/dog.png";
import nuggies from "../img/nuggies.png";
import { RenderGameObject } from "./render-game-object";
import { degToRad, generateUUID, Vec2, vec2 } from "./util";

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
    this.isCompressed = Math.random() < Number(gameState.getCurrency("compressedNuggies1").getCurrentAmount()) * COMPRESSED_NUGGIE_1_RATE / 100;
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
    nuggiesCollected: bigint,
    workTime: number, // Max time per cycle
    workPhase: number, // 0 = go out, 1 = collect, 2 = return, 3 = drop off
    phaseTime: number, // Waits for 0.5s at collect phase
  };
  nuggieList: LogicNuggie[];
  timeToNextNuggie: number;
  timeToNextDelivery: number;
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
        nuggiesCollected: 0n,
        workTime: 0.0,
        workPhase: 4,
        phaseTime: 0.0,
      },
      nuggieList: [],
      timeToNextNuggie: 0.0,
      timeToNextDelivery: 15.0,
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

  componentDidMount(): void {
    {
      const canvas = this.canvasRef.current;
      canvas.width = 960;
      canvas.height = 540;
    }
  }

  gameTick = (time: number) => {
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
        const boostedDistance = boostTime * Number(gameState.getCurrency("nuggieFlavorTechnique").getCurrentAmount()) * AOI_BOOST_PER_NFT;
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
            nuggie.position.plusEquals(distance.unit().times(-1 * time * 2.5 * (magnetRange)));
          }
        }

        nuggie.gameTick(time);

        // Check if it's eaten
        if (nuggie.spawningTime <= 0.0 && !nuggie.isDespawning && distance2 <= NUGGIE_HIT_RADIUS) {
          const amountGained = this.amountGainedForNuggie(nuggie);
          gameState.getCurrency("nuggie").addAmount(amountGained);
          this.floatingNumbers.push(new LogicFloatingNumber(nuggie.position, `+${amountGained}${nuggie.isCompressed ? "!" : ""}`, nuggie.isCompressed ? "floating-number-inner-crit" : "floating-number-inner"));
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
              gameState.getCurrency("nuggie").addAmount(state.dog.nuggiesCollected);
              this.floatingNumbers.push(new LogicFloatingNumber(state.awowi.position, `+${state.dog.nuggiesCollected}`, "floating-number-inner-dog"));
              state.dog.nuggiesCollected = 0n;
              anyNuggieEaten = true;
            }
          } else {
            state.dog.position.plusEquals(dv.unit().times(maxDist));
          }
        }

        state.dog.workTime -= time;
      }

      // NFT (Nuggie Flavor Technique)
      if (anyNuggieEaten) {
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
        state.timeToNextNuggie += gameState.calculateNuggieCycleTime();
        const numNuggiesToSpawn = gameState.calculateNuggiesPerCycle();
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
        state.timeToNextDelivery += gameState.calculateNuggieDeliveryTime();
        if (this.isAoiInDeliveryArea()) {
          const numNuggiesToSpawn = Number(gameState.getCurrency("wcbonalds").getCurrentAmount()) * 50;
          for (let i = 0; i < numNuggiesToSpawn; i++) {
            const center = vec2(BASE_WCBONALDS_POSITION.left + BASE_WCBONALDS_POSITION.width / 2, BASE_WCBONALDS_POSITION.top + BASE_WCBONALDS_POSITION.height / 2);
            const radius = Math.random() * BASE_WCBONALDS_POSITION.height * 0.4;
            state.nuggieList.push(new LogicNuggie(gameState,
              center.plus(Vec2.randomUnit().times(radius)),
              Vec2.unit(degToRad(150.0 + 60.0 * Math.random())).times(120.0 + 240.0 * Math.random())));
          }
        }
      }

      // Draw
      const canvas = this.canvasRef.current;
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

      return state;
    });
  }

  isAoiInDeliveryArea = () => {
    return this.state.awowi.position.x >= BASE_WCBONALDS_POSITION.left &&
      this.state.awowi.position.y >= BASE_WCBONALDS_POSITION.top &&
      this.state.awowi.position.x <= BASE_WCBONALDS_POSITION.left + BASE_WCBONALDS_POSITION.width &&
      this.state.awowi.position.y <= BASE_WCBONALDS_POSITION.top + BASE_WCBONALDS_POSITION.height;
  }

  amountGainedForNuggie = (nuggie: LogicNuggie) => {
    return nuggie.isCompressed ? this.props.gameState.calculateNumNuggiesPerCompressedNuggie() : 1n;
  }

  render() {
    const gameState = this.props.gameState;

    const deliveryVisibility = gameState.getCurrency("wcbonalds").getCurrentAmount() > 0 ? "visible" : "hidden";
    const floatingNumbers = this.floatingNumbers.map((logicObject) => logicObject.renderObject);

    return (
      <div
        className="minigame-size aoi-minigame"
        onMouseMove={this.handleOnMouseMove}
        onMouseOver={this.handleOnMouseOver}
        onMouseOut={this.handleOnMouseOut}
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
          <b>Time to next delivery: {this.state.timeToNextDelivery.toFixed(1)}</b>
        </div>
      </div>
    );
  }
}