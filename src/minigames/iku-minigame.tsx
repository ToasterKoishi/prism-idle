import { t } from "i18next";
import React from "react";
import "../app.css";
import { ActivePassiveToggle, TooltipTrigger } from "../components/basic-components";
import { SCENE_SIZE } from "../const";
import glove from "../img/glove.png";
import ikumin from "../img/ikumin.png";
import sprinkler from "../img/sprinkler.png";
import watering_can from "../img/watering-can.png";
import { GameState } from "../logic/game-state";
import { generateUUID, Vec2, vec2 } from "../util";
import { LogicFloatingNumber, RenderGameObject } from "./render-game-object";

const TOOL_WATERING_CAN = 0;
const TOOL_YEETING_GLOVE = 1;

const IKUMIN_BASIC = 0;
const IKUMIN_BLUE = 1;
const IKUMIN_VAPORWAVE = 2;
const IKUMIN_SKY = 3;
const IKUMIN_NEAPOLITAN = 4;
const IKUMIN_RAINBOW = 5;

const SPROUTING_TIME = 0.4;
const NEAPOLITAN_RANGE = 64.0;
const SPRINKLER_POSITIONS = [
  [],
  [SCENE_SIZE.times(0.5)],
  [SCENE_SIZE.times(vec2(0.25, 0.5)), SCENE_SIZE.times(vec2(0.75, 0.5))],
  [SCENE_SIZE.times(vec2(1.0 / 6.0, 0.5)), SCENE_SIZE.times(vec2(0.5, 0.5)), SCENE_SIZE.times(vec2(5.0 / 6.0, 0.5))],
  [SCENE_SIZE.times(vec2(0.25, 0.25)), SCENE_SIZE.times(vec2(0.75, 0.25)), SCENE_SIZE.times(vec2(0.25, 0.75)), SCENE_SIZE.times(vec2(0.75, 0.75))],
  [SCENE_SIZE.times(vec2(1.0 / 6.0, 0.25)), SCENE_SIZE.times(vec2(5.0 / 6.0, 0.25)), SCENE_SIZE.times(0.5), SCENE_SIZE.times(vec2(1.0 / 6.0, 0.75)), SCENE_SIZE.times(vec2(5.0 / 6.0, 0.75))],
  [SCENE_SIZE.times(vec2(1.0 / 6.0, 0.25)), SCENE_SIZE.times(vec2(5.0 / 6.0, 0.25)), SCENE_SIZE.times(vec2(0.5, 0.25)), SCENE_SIZE.times(vec2(0.5, 0.75)), SCENE_SIZE.times(vec2(1.0 / 6.0, 0.75)), SCENE_SIZE.times(vec2(5.0 / 6.0, 0.75))],
];

class LogicIkumin {
  gameState: GameState;
  id = generateUUID();
  position = vec2();
  velocity = vec2();
  type = -1;

  spawnProgress = 1.0;
  waterLevel = 0.0;
  growthLevel = 0.0;
  sproutingProgress = 0.0;
  performGrowthEffectsThisTick = false;
  isGrown = false;
  isPickedUp = false;
  isThrown = false;
  isAscending = false;

  wateringAnimationTime = 0.0;
  sparkleAnimationTime = 0.0;

  constructor(gameState: GameState, position: Vec2, alreadyGrown: boolean = false, velocity: Vec2 = vec2()) {
    this.gameState = gameState;
    this.position.set(position);
    this.velocity.set(velocity);
    if (alreadyGrown) {
      this.spawnProgress = 0.0;
      this.waterLevel = 1.0;
      this.growthLevel = 1.0;
    }
  }

  gameTick = (time: number) => {
    this.spawnProgress -= time / 0.4;

    if ((this.type == IKUMIN_SKY || this.type == IKUMIN_RAINBOW || this.isAscending) && this.isGrown) {
      this.isThrown = true;
      const newVelocity = this.velocity.plus(vec2(0, -150.0 * time));
      this.position.plusEquals(this.velocity.plus(newVelocity).times(0.5 * time));
      this.velocity.set(newVelocity);
    } else if (this.isThrown) {
      const newSpeed = Math.max(0.0, this.velocity.mag() - (100.0 * time));
      const newVelocity = this.velocity.isZero() ? this.velocity : this.velocity.unit().times(newSpeed);
      this.position.plusEquals(this.velocity.plus(newVelocity).times(0.5 * time));
      this.velocity.set(newVelocity);
    } else {
      this.position.plusEquals(this.velocity.times(0.5 * Math.min(time, (1.0 - this.sproutingProgress) * SPROUTING_TIME)));
    }

    if (this.velocity.isZero()) {
      this.isThrown = false;
    }

    if (this.growthLevel < 1.0) {
      if (this.waterLevel >= 1.0) {
        this.waterLevel = 1.0;
        this.sparkleAnimationTime += time;
        this.growthLevel += time / this.gameState.getResolvedValue("iku.ikuminGrowthTime").resolve();
      }
    } else if (this.sproutingProgress < 1.0) {
      this.sproutingProgress += time / SPROUTING_TIME;
      if (this.sproutingProgress >= 1.0) {
        this.sproutingProgress = 1.0;
        this.performGrowthEffectsThisTick = true;
        this.velocity = vec2();
      }
    } else if (!this.isGrown) {
      this.isGrown = true;
    }

    if (this.growthLevel >= 1.0 && this.type == -1) {
      this.type = this.getRandomIkuminType();
    }
  }

  waterForTime = (time: number) => {
    this.waterLevel = Math.min(this.waterLevel + this.gameState.getResolvedValue("iku.ikuminWateringRate").resolve() * time / this.gameState.getResolvedValue("iku.ikuminWaterRequired").resolve(), 1.0);
  }

  isFlying = () => {
    return this.isGrown && (this.type == IKUMIN_SKY || this.type == IKUMIN_RAINBOW || this.isAscending);
  }

  getRandomIkuminType = () => {
    // This code should have the same logic as the code in ResolvedValue `ikuminGenerator`!
    const gameState = this.gameState;

    const rand = 100.0 * Math.random();
    let currentBorder = 0;

    currentBorder += (gameState.getCurrency("iku.ikuminVariety").getCurrentAmount() >= 1n ? 10.0 + Number(gameState.getCurrency("iku.ikuminBlue").getCurrentAmount()) : 0.0);
    if (rand < currentBorder) {
      return IKUMIN_BLUE;
    }
    currentBorder += (gameState.getCurrency("iku.ikuminVariety").getCurrentAmount() >= 2n ? 10.0 + Number(gameState.getCurrency("iku.ikuminVaporwave").getCurrentAmount()) : 0.0);
    if (rand < currentBorder) {
      return IKUMIN_VAPORWAVE;
    }
    currentBorder += (gameState.getCurrency("iku.ikuminVariety").getCurrentAmount() >= 3n ? 10.0 + Number(gameState.getCurrency("iku.ikuminSky").getCurrentAmount()) : 0.0);
    if (rand < currentBorder) {
      return IKUMIN_SKY;
    }
    currentBorder += (gameState.getCurrency("iku.ikuminVariety").getCurrentAmount() >= 4n ? 10.0 + Number(gameState.getCurrency("iku.ikuminNeapolitan").getCurrentAmount()) : 0.0);
    if (rand < currentBorder) {
      return IKUMIN_NEAPOLITAN;
    }
    currentBorder += (gameState.getCurrency("iku.ikuminVariety").getCurrentAmount() >= 5n ? 10.0 + Number(gameState.getCurrency("iku.ikuminRainbow").getCurrentAmount()) : 0.0);
    if (rand < currentBorder) {
      return IKUMIN_RAINBOW;
    }
    return IKUMIN_BASIC;
  }
}

interface IkuMinigameAreaProps {
  gameState: GameState
  hooks: { gameTick: ((_: number) => void)[] }
}

export interface IkuMinigameAreaState {
  ikuminList: LogicIkumin[];
  progressToNextSpawn: number;
}

export class IkuMinigameArea extends React.Component {
  props: IkuMinigameAreaProps;
  state: IkuMinigameAreaState;

  canvasRef = React.createRef<HTMLCanvasElement>();
  ikuminSpritesheetRef = React.createRef<HTMLImageElement>();

  floatingNumbers: LogicFloatingNumber[] = [];

  currentTool: number = TOOL_WATERING_CAN;
  showMouse: boolean = false;
  mousePos: Vec2 = vec2();
  lastMousePos: Vec2 = vec2();
  mouseDown: boolean = false;
  lastMouseDown: boolean = false;
  mouseDownTime: number = 0.0;

  constructor(props: IkuMinigameAreaProps) {
    super(props);
    this.state = {
      ikuminList: [],
      progressToNextSpawn: 0.0,
    };
  }

  componentDidMount(): void {
    this.props.hooks.gameTick.push(this.gameTick);
    if (this.props.gameState.liveState.ikuMinigame) {
      Object.assign(this.state, this.props.gameState.liveState.ikuMinigame);
    }
  }

  componentWillUnmount(): void {
    this.props.hooks.gameTick.splice(this.props.hooks.gameTick.indexOf(this.gameTick), 1);
    this.props.gameState.liveState.ikuMinigame = this.state;
  }

  handleOnMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    this.showMouse = true;
    const parentRect = e.currentTarget.getBoundingClientRect();
    this.mousePos.x = e.clientX - parentRect.left;
    this.mousePos.y = e.clientY - parentRect.top;
  }

  handleOnMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    this.showMouse = false;
    if (this.currentTool == TOOL_YEETING_GLOVE) {
      this.mouseDown = false;
      const parentRect = e.currentTarget.getBoundingClientRect();
      this.mousePos.x = e.clientX - parentRect.left;
      this.mousePos.y = e.clientY - parentRect.top;
    }
  }

  handleOnMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button == 0) {
      this.mouseDown = true;
    }
  }

  handleOnMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button == 0) {
      this.mouseDown = false;
    }
  }

  handleOnKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      // case "1":
      //   this.changeTool(TOOL_WATERING_CAN);
      //   break;
      // case "2":
      //   this.changeTool(TOOL_YEETING_GLOVE);
      //   break;
    }
  }

  gameTick = (time: number) => {
    if (this.props.gameState.getGenerator("iku.ikumin").enabled) {
      return;
    }

    if (time > 60.0) {
      // Don't run the game simulation if it's too large an amount of time to prevent insane lag
      // Grant some pity equivalent to running in passive mode for that period of time
      this.props.gameState.getCurrency("iku.ikumin").addFractionalAmount(this.props.gameState.getResolvedValue("iku.ikuminGenerator").resolve() * time);
      return;
    }

    this.setState((state: IkuMinigameAreaState, props: IkuMinigameAreaProps) => {
      const gameState = props.gameState;

      const isWatering = this.currentTool == TOOL_WATERING_CAN && this.showMouse && this.mouseDown;
      const wateringRadius = gameState.getResolvedValue("iku.ikuminWateringRadius").resolve();
      const yeetingRadius = gameState.getResolvedValue("iku.ikuminYeetingRadius").resolve();

      if (this.mouseDown) {
        this.mouseDownTime += time;
      } else {
        this.mouseDownTime = 0.0;
      }

      // Update ikumin
      const yeetingLimited: boolean = gameState.getCurrency("iku.yeetingGroupHug").getCurrentAmountShort() == 0;
      let hasUsedLimitedYeet: boolean = false;
      const newIkuminToAdd: LogicIkumin[] = [];
      state.ikuminList = state.ikuminList.filter((ikumin) => {
        if (!ikumin.isGrown) {
          // Watering
          let wasWatered = false;
          const distance = ikumin.position.minus(this.mousePos).mag();

          if (isWatering && distance <= wateringRadius) {
            ikumin.waterForTime(time);
            ikumin.wateringAnimationTime += time;
            wasWatered = true;
          }

          let numSprinklers = Number(gameState.getCurrency("iku.wateringSprinkler").getCurrentAmount());
          for (let i = 0; i < numSprinklers; i++) {
            const distance = ikumin.position.minus(SPRINKLER_POSITIONS[numSprinklers][i]).mag();
            if (distance <= wateringRadius) {
              ikumin.waterForTime(time);
              ikumin.wateringAnimationTime += time;
              wasWatered = true;
            }
          }

          if (!wasWatered) {
            ikumin.wateringAnimationTime = 0.0;
          }
        } else {
          // Yeeting
          if (this.lastMouseDown != this.mouseDown) {
            if (this.mouseDown && this.currentTool == TOOL_YEETING_GLOVE) {
              if (!(yeetingLimited && hasUsedLimitedYeet) && ikumin.isGrown && !ikumin.isPickedUp && !ikumin.isThrown && ikumin.position.minus(this.mousePos).mag() < yeetingRadius) {
                ikumin.isPickedUp = true;
                hasUsedLimitedYeet = true;
              }
            } else {
              if (ikumin.isPickedUp) {
                ikumin.isPickedUp = false;
                ikumin.isThrown = true;

                const dv = this.mousePos.minus(this.lastMousePos);

                if (dv.isZero()) {
                  ikumin.velocity.set(vec2());
                } else {
                  const baseSpeed = Math.min(dv.mag() / time * 0.166, 500.0);
                  const adjustedVel = dv.unit().times(baseSpeed).plus(Vec2.randomUnit().times(baseSpeed * 0.05));
                  ikumin.velocity.set(adjustedVel);
                }
              }
            }
          }

          // Little wiggle effect for picked up but not thrown ikumin
          if (ikumin.isPickedUp) {
            const dv = this.mousePos.minus(this.lastMousePos);
            ikumin.position.plusEquals(dv.times(0.05));
          }

          // Gain ikumin when they go off-screen
          if (ikumin.position.x < -10.0 || ikumin.position.x > SCENE_SIZE.x + 10.0 || ikumin.position.y < -10.0 || ikumin.position.y > SCENE_SIZE.y + 10.0) {
            const amountGained =
              ((ikumin.type == IKUMIN_BLUE || ikumin.type == IKUMIN_RAINBOW ? 5.0 : 1.0) + gameState.getResolvedValue("iku.minigameIkuminBonus").resolve()) *
              gameState.getResolvedValue("iku.ikuminGlobalPercent").resolve();
            gameState.getCurrency("iku.ikumin").addFractionalAmount(amountGained);

            const numberPosition = ikumin.position.get();
            let direction = "";
            if (ikumin.position.x < 0.0) {
              numberPosition.plusEquals(vec2(20.0, 0.0));
              direction = "right";
            } else if (ikumin.position.x > SCENE_SIZE.x) {
              numberPosition.plusEquals(vec2(-20.0, 0.0));
              direction = "left";
            } else if (ikumin.position.y < 0.0) {
              numberPosition.plusEquals(vec2(0.0, 10.0));
              direction = "down";
            } else {
              numberPosition.plusEquals(vec2(0.0, -30.0));
              direction = "up";
            }
            this.floatingNumbers.push(new LogicFloatingNumber(numberPosition, `+${amountGained.toFixed(2).replace(/\.?0+$/, '')}${false ? "!" : ""}`, false ? "floating-number-inner-crit" : "floating-number-inner", direction));
            return false;
          }
        }

        // Growth effect
        if (ikumin.performGrowthEffectsThisTick) {
          ikumin.performGrowthEffectsThisTick = false;
          if (ikumin.type == IKUMIN_VAPORWAVE || ikumin.type == IKUMIN_RAINBOW) {
            // Split into two new fully grown ikumin of random types
            if (gameState.getCurrency("iku.ikuminVaporwaveBuff").getCurrentAmount() > 0) {
              // Go to two random positions on the map
              for (let i = 0; i < 2; i++) {
                const vx = ((Math.random() * SCENE_SIZE.x) - ikumin.position.x) / SPROUTING_TIME;
                const vy = ((Math.random() * SCENE_SIZE.y) - ikumin.position.y) / SPROUTING_TIME;
                newIkuminToAdd.push(new LogicIkumin(gameState, ikumin.position, true, vec2(vx, vy)));
              }
            } else {
              // Short horizontal split
              const vx = Math.random() * 20.0 + 100.0;
              const vy = Math.random() * 50.0 - 25.0;
              newIkuminToAdd.push(new LogicIkumin(gameState, ikumin.position, true, vec2(-vx, vy)));
              newIkuminToAdd.push(new LogicIkumin(gameState, ikumin.position, true, vec2(vx, -vy)));
            }
            if (ikumin.type == IKUMIN_VAPORWAVE) {
              return false;
            }
          }
          if (ikumin.type == IKUMIN_NEAPOLITAN || ikumin.type == IKUMIN_RAINBOW) {
            // Cause sprouts around this ikumin to instantly grow
            this.state.ikuminList.forEach((other) => {
              if (other.growthLevel < 1.0 && other.spawnProgress <= 0.0) {
                const distance = ikumin.position.minus(other.position).mag();
                if (distance <= NEAPOLITAN_RANGE) {
                  other.growthLevel = 1.0;
                }
              }
            });
            // Also cause Ikumin to fly away, if feature unlocked
            if (gameState.getCurrency("iku.ikuminNeapolitanBuff").getCurrentAmount() > 0) {
              this.state.ikuminList.forEach((other) => {
                if (other.isGrown && !other.isPickedUp && !other.isThrown) {
                  const distance = ikumin.position.minus(other.position).mag();
                  if (distance <= NEAPOLITAN_RANGE) {
                    other.isAscending = true;
                  }
                }
              });
            }
          }
        }

        ikumin.gameTick(time);

        return true;
      });

      this.state.ikuminList = this.state.ikuminList.concat(newIkuminToAdd);

      // Update floating text
      this.floatingNumbers = this.floatingNumbers.filter((obj) => {
        obj.gameTick(time);
        return obj.lifetime > 0.0;
      });

      // Spawn seedlings
      state.progressToNextSpawn += time / gameState.getResolvedValue("iku.ikuminSeedSpawnRate").resolve();
      if (state.progressToNextSpawn >= 0.0) {
        state.progressToNextSpawn -= 1.0;
        const usePattern: boolean = gameState.getCurrency("iku.decree2").getCurrentAmount() > 0;
        const allowedCloseness = usePattern ? 24.0 : 32.0;
        const numGroupsToSpawn = 1n + gameState.getCurrency("iku.fertileSoil2").getCurrentAmount();
        const numIkuminToSpawn = 1n + gameState.getCurrency("iku.fertileSoil1").getCurrentAmount();
        for (let i = 0; i < numGroupsToSpawn; i++) {
          let baseSpawnPosition: Vec2;
          let baseSpawnAngle: number;
          if (usePattern) {
            // This code should have the same logic as the code in ResolvedValue `ikuminGenerator`!
            const xGridSpacing = allowedCloseness;
            const xGridMax = Math.floor((SCENE_SIZE.x - 40.0) / xGridSpacing);
            const xGridSpawn = Math.floor(Math.random() * (xGridMax + 1));
            const yGridSpacing = Math.sqrt(3) * 0.5 * allowedCloseness;
            const yGridMax = Math.floor((SCENE_SIZE.y - 40.0) / yGridSpacing);
            const yGridSpawn = Math.floor(Math.random() * (yGridMax + 1));
            baseSpawnPosition = vec2(20.0 + xGridSpacing * xGridSpawn + (yGridSpawn % 2 == 1 ? xGridSpacing * 0.5 : 0.0), 20.0 + yGridSpacing * yGridSpawn);
            baseSpawnAngle = Math.floor(Math.random() * 6) / 6.0 * 2.0 * Math.PI;
          } else {
            baseSpawnPosition = vec2(Math.random() * (SCENE_SIZE.x - 40.0) + 20.0, Math.random() * (SCENE_SIZE.y - 40.0) + 20.0);
            baseSpawnAngle = Math.random() * 2.0 * Math.PI;
          }
          for (let i = 0; i < numIkuminToSpawn; i++) {
            let spawnPosition = baseSpawnPosition.get();
            if (i > 0) {
              spawnPosition = baseSpawnPosition.plus(Vec2.unit(baseSpawnAngle + Math.PI / 3.0 * i).times(allowedCloseness));
            }
            let blocked = false;
            let ikuminAllowance = gameState.getCurrency("iku.decree1").getCurrentAmount() >= 1n ? 2.0 : 0.0;
            state.ikuminList.forEach((ikumin) => {
              if (!ikumin.isFlying() && spawnPosition.minus(ikumin.position).mag() < allowedCloseness - 0.01) {
                if (ikumin.growthLevel >= 1.0 && ikuminAllowance > 0) {
                  ikuminAllowance -= 1;
                } else {
                  blocked = true;
                  return;
                }
              }
            });
            if (!blocked) {
              state.ikuminList.push(new LogicIkumin(gameState, spawnPosition));
            }
          }
        }
      }

      // Sort by y-position for depth ordering effect
      state.ikuminList.sort((lhs, rhs) => {
        const lhsFliesMod = lhs.isFlying() ? 1000.0 : 0.0;
        const rhsFliesMod = rhs.isFlying() ? 1000.0 : 0.0;
        return (lhs.position.y + lhsFliesMod) - (rhs.position.y + rhsFliesMod)
      }); // Lol this is probably super laggy

      // Draw
      const canvas = this.canvasRef.current;
      if (canvas) {
        canvas.width = 960;
        canvas.height = 540;

        const context = canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Watering & sprinklers
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.globalAlpha = 1.0;
        context.fillStyle = "#00ffff40";
        if (isWatering) {
          context.beginPath();
          context.ellipse(this.mousePos.x, this.mousePos.y, wateringRadius, wateringRadius, 0.0, 0.0, 360.0);
          context.fill();
        }

        let numSprinklers = Number(gameState.getCurrency("iku.wateringSprinkler").getCurrentAmount());
        for (let i = 0; i < numSprinklers; i++) {
          SPRINKLER_POSITIONS[numSprinklers][i];
          context.beginPath();
          context.ellipse(SPRINKLER_POSITIONS[numSprinklers][i].x, SPRINKLER_POSITIONS[numSprinklers][i].y, wateringRadius, wateringRadius, 0.0, 0.0, 360.0);
          context.fill();
        }

        this.state.ikuminList.forEach((ikumin) => {
          context.setTransform(1, 0, 0, 1, Math.floor(ikumin.position.x), Math.floor(ikumin.position.y));
          context.globalAlpha = 1;

          if (ikumin.growthLevel < 1.0) {
            // Seedling
            if (ikumin.spawnProgress > 0.0) {
              context.scale(1.0 - ikumin.spawnProgress, 1.0 - ikumin.spawnProgress);
              context.globalAlpha = 1.0 - ikumin.spawnProgress;
            } else if (ikumin.waterLevel < 1.0) {
              const scale = 1.1 - 0.1 * Math.cos(ikumin.wateringAnimationTime * 2.0 * Math.PI);
              context.scale(scale, scale);
              context.globalAlpha = 1;
            }

            const ssx = ikumin.waterLevel >= 1.0 ? (ikumin.sparkleAnimationTime % 0.8 < 0.4 ? 64 : 128) : 0;
            context.drawImage(
              this.ikuminSpritesheetRef.current,
              ssx, 0, 64, 64,
              -32, -32, 64, 64);
          } else {
            // Ikumin
            const dy = 15.0 * Math.sin(Math.min(ikumin.sproutingProgress - 1.0, 0.0) * Math.PI);
            const ssx = ikumin.type * 64;
            const ssy = ikumin.isPickedUp || ikumin.isThrown ? 128 : 64;
            context.drawImage(
              this.ikuminSpritesheetRef.current,
              ssx, ssy, 64, 64,
              -32, -32 + dy, 64, 64);
          }
        });

        if (this.currentTool == TOOL_YEETING_GLOVE && this.showMouse && gameState.getCurrency("iku.yeetingGroupHug").getCurrentAmountShort() > 0) {
          context.setTransform(1, 0, 0, 1, 0, 0);
          context.globalAlpha = 0.75;
          context.strokeStyle = "#00ff00";
          context.beginPath();
          context.ellipse(this.mousePos.x, this.mousePos.y, yeetingRadius, yeetingRadius, 0.0, 0.0, 360.0);
          context.stroke();
        }
      }

      this.lastMousePos.set(this.mousePos);
      this.lastMouseDown = this.mouseDown;

      return state;
    });
  }

  changeTool = (toolId: number) => {
    this.currentTool = toolId;
    this.lastMouseDown = true;
    this.mouseDown = false;
  }

  render() {
    const gameState = this.props.gameState;

    const floatingNumbers = this.floatingNumbers.map((logicObject) => logicObject.renderObject);

    let numSprinklers = Number(gameState.getCurrency("iku.wateringSprinkler").getCurrentAmount());
    const sprinklers = SPRINKLER_POSITIONS[numSprinklers].map((sprinklerPosition, index) => (
      <RenderGameObject
        key={index}
        position={sprinklerPosition}
        sprite={sprinkler}
        spriteWidth={64.0}
        spriteHeight={64.0}
      />
    ));

    return (
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ margin: "auto", textAlign: "center" }}>
          <h1 style={{}}>{t("minigame.iku.name")}</h1>
          <ActivePassiveToggle
            gameState={this.props.gameState}
            toggleEnabled={gameState.getCurrency("iku.t2Unlock").getCurrentAmount() > 0n}
            generatorId="iku.ikumin"
            generatorHintElement={<span>{this.props.gameState.getResolvedValue("iku.ikuminGenerator").resolve().toFixed(2)} ikumin/s&nbsp;
              <TooltipTrigger
                tooltipBoxStyle={{ bottom: "auto", top: "20" }}
                tooltipContents={<div>
                  <b>Optimal generation:</b> {gameState.getResolvedValue("iku.ikuminGeneratorBase").resolve().toFixed(2)} ikumin /s
                  <br />
                  <b>Growth efficiency:</b> x{gameState.getResolvedValue("iku.farmEfficiency").resolve().toFixed(3)}
                  <br />
                  <b>Ikumin education:</b> x{gameState.getResolvedValue("iku.farmEducation").resolve().toFixed(2)}
                </div>}
              >
                [?]
              </TooltipTrigger>
            </span>
            }
          >
            <div>
              <p style={{ margin: "16pt auto 16pt", textAlign: "left" }}>
                {t("minigame.iku.description")}</p>
              <div
                className="minigame-size iku-minigame"
                style={{ cursor: "none", outline: "none" }}
                onMouseMove={this.handleOnMouseMove}
                onMouseLeave={this.handleOnMouseLeave}
                onMouseDown={this.handleOnMouseDown}
                onMouseUp={this.handleOnMouseUp}
                onKeyDown={this.handleOnKeyDown}
                tabIndex={-1}
              >
                <img style={{ display: "none" }} src={ikumin} ref={this.ikuminSpritesheetRef} />

                <canvas className="minigame-size" ref={this.canvasRef} />
                {sprinklers}
                <div style={{ position: "absolute", bottom: "16px", left: "16px", border: "2px dotted black", padding: "8px", backgroundColor: "#ffffffc0" }} onMouseDown={(e) => { this.changeTool(TOOL_WATERING_CAN); e.stopPropagation(); }}>
                  <img src={watering_can} width="32px" height="32px" />
                  <div style={{ position: "absolute", "bottom": "2px", "right": "2px" }}><b></b></div>
                </div>
                <div style={{ position: "absolute", bottom: "16px", left: "80px", border: "2px dotted black", padding: "8px", backgroundColor: "#ffffffc0" }} onMouseDown={(e) => { this.changeTool(TOOL_YEETING_GLOVE); e.stopPropagation(); }}>
                  <img src={glove} width="32px" height="32px" />
                  <div style={{ position: "absolute", "bottom": "2px", "right": "2px" }}><b></b></div>
                </div>
                <RenderGameObject
                  position={this.mousePos.plus(this.currentTool == TOOL_WATERING_CAN ? vec2(28.0, -28.0) : vec2(0.0, 8.0))}
                  sprite={this.currentTool == TOOL_WATERING_CAN ? watering_can : glove}
                  spriteWidth={64.0}
                  spriteHeight={64.0}
                  outerStyle={{ visibility: this.showMouse ? "visible" : "hidden" }}
                />

                {floatingNumbers}
              </div>
            </div>
          </ActivePassiveToggle>

          <div className="shop-divider" />
        </div>
      </div>
    );
  }
}