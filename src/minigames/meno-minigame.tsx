import { t } from "i18next";
import React, { CSSProperties } from "react";
import { ActivePassiveToggle, TooltipTrigger } from "../components/basic-components";
import { SCENE_SIZE, TOTER_DEBUG_RENDER_ACTIVITY } from "../const";
import ikumin from "../img/iku/ikumin.png";
import chisel from "../img/meno/chisel.png";
import magnifying_glass from "../img/meno/magnifying-glass.png";
import spinner from "../img/meno/spinner.png";
import shiny from "../img/shiny.png";
import { GameState } from "../logic/game-state";
import { generateUUID, Vec2, vec2 } from "../util";
import { LogicFloatingNumber, RenderGameObject } from "./render-game-object";

const ADJACENT_POSITIONS = [vec2(-1, -1), vec2(0, -1), vec2(1, -1), vec2(1, 0), vec2(1, 1), vec2(0, 1), vec2(-1, 1), vec2(-1, 0)];
const CHISEL_POSITIONS = [vec2(0, 0), vec2(0, 1), vec2(0, -1), vec2(0, 2), vec2(0, -2)];
const MAGNIFYING_GLASS_POSITIONS = [vec2(0, 0), vec2(0, 1), vec2(0, -1), vec2(1, 0), vec2(-1, 0), vec2(-1, -1), vec2(1, -1), vec2(-1, 1), vec2(1, 1)];

const TOOL_MAGNIFYING_GLASS = 0;
const TOOL_CHISEL = 1;
const TOOL_HAMMER = 2;

const MAX_PUZZLES = 5;

const getChiselCoords = (coord: Vec2, chiselLevel: number) => {
  return CHISEL_POSITIONS.slice(0, 1 + chiselLevel).map((position) => coord.plus(position));
};
const getMagnifyingGlassCoords = (coord: Vec2, magnifyingGlassLevel: number) => {
  return MAGNIFYING_GLASS_POSITIONS.slice(0, 1 + 4 * magnifyingGlassLevel).map((position) => coord.plus(position));
};

class RenderPuzzle extends React.Component {
  props: {
    gameState: GameState,
    logicPuzzle: LogicPuzzle,
    hoveredCell?: Vec2,
    shake?: number,
    transitionAmount: number,
    onCellClickedHandler?: (_: Vec2) => void
    onCellHoveredHandler?: (_: Vec2) => void
    onPuzzleLeaveHandler?: () => void
  }
  render() {
    const logicPuzzle = this.props.logicPuzzle;

    if (logicPuzzle == null) {
      return null;
    }

    const rows = [];
    for (let x = 0; x < logicPuzzle.puzzleSize.x; x++) {
      rows.push([]);
      for (let y = 0; y < logicPuzzle.puzzleSize.y; y++) {
        const minedDepth = logicPuzzle.topLayerData[x][y].minedDepth;
        // Calculate broken tile style
        const isBedrock = minedDepth >= logicPuzzle.maxDepth;
        const hasShiny = minedDepth >= 0 ? logicPuzzle.tileData[x][y][minedDepth].hasShiny : false;
        const hasShinyBelow = minedDepth + 1 <= logicPuzzle.maxDepth ? logicPuzzle.tileData[x][y][minedDepth + 1].hasShiny : false;
        const depthPx = (minedDepth + 1.0) * 4.0;

        // Calculate magnifying glass numbers
        let numAround = logicPuzzle.topLayerData[x][y].isInvestigated ? logicPuzzle.tileData[x][y][minedDepth + 1].numAround : -1;

        const depthBelow = x + 1 < logicPuzzle.puzzleSize.x ? logicPuzzle.topLayerData[x + 1][y].minedDepth - minedDepth : logicPuzzle.maxDepth - minedDepth;
        const depthRight = y + 1 < logicPuzzle.puzzleSize.y ? logicPuzzle.topLayerData[x][y + 1].minedDepth - minedDepth : logicPuzzle.maxDepth - minedDepth;

        let finalCellContentToShow = numAround >= 0 ? <span>{numAround}</span> : null;

        let finalStyles: string[] = [];
        if (logicPuzzle.topLayerData[x][y].isHighlighted) {
          finalStyles.push("highlight");
        }
        if (isBedrock) {
          finalStyles.push("broken");
        }
        if (hasShiny) {
          finalStyles.push("shiny");
        }
        if (logicPuzzle.topLayerData[x][y].isInvestigated) {
          finalStyles.push("investigate");
        }

        rows[x].push(
          <div
            key={y}
            className={`meno-puzzle-cell ${depthBelow > 0 ? "bottom-edge" : ""} ${depthRight > 0 ? "right-edge" : ""} ${finalStyles.join(" ")}`}
            style={{
              transform: `translate(${depthPx}px, ${depthPx}px)`,
              "--bottom-edge-left": `${2 * depthBelow}px`,
              "--bottom-edge-bottom": `${-4 * depthBelow}px`,
              "--bottom-edge-height": `${4 * depthBelow - 2}px`,
              "--right-edge-top": `${2 * depthRight}px`,
              "--right-edge-right": `${-4 * depthRight}px`,
              "--right-edge-width": `${4 * depthRight - 2}px`
            } as CSSProperties}
            onMouseDown={(_) => this.props.onCellClickedHandler(vec2(x, y))}
            onMouseMove={(_) => this.props.onCellHoveredHandler(vec2(x, y))}
          >
            {logicPuzzle.topLayerData[x][y].isInvestigated && hasShinyBelow ? <div className="shiny-below" /> : null}
            <div className="meno-puzzle-cell-inner">
              {finalCellContentToShow}
            </div>
          </div>);
      }
    }

    const shakeTransform = `translate(${Math.floor(10.0 * Math.random() * this.props.shake)}px, ${Math.floor(10.0 * Math.random() * this.props.shake)}px)`;
    const transitionTransform = `translateX(${-400.0 * this.props.transitionAmount * Math.abs(this.props.transitionAmount)}px) scale(${1.0 - Math.pow(this.props.transitionAmount, 2)})`;

    return (
      <div
        className="meno-puzzle"
        style={{
          pointerEvents: this.props.transitionAmount == 0.0 ? "auto" : "none",
          transform: this.props.transitionAmount == 0.0 ? shakeTransform : transitionTransform,
          "--cell-size": logicPuzzle.getRenderCellSize() - 2,
          "--shadow-distance": `${logicPuzzle.maxDepth * 4.0 + 8.0}px`,
        } as CSSProperties}
        onMouseLeave={(_) => this.props.onPuzzleLeaveHandler()}
      >
        {rows.map((row, i) => {
          return (
            <div key={i} className="meno-puzzle-row">{row}</div>
          );
        })}
        {TOTER_DEBUG_RENDER_ACTIVITY ? (<div style={{ position: "absolute", top: "0", left: "0", padding: "8px", backgroundColor: Math.floor(Math.random() * 16777215).toString(16) }} />) : null}
      </div>
    );
  }
}

class LogicPuzzle {
  readonly uuid: number;

  puzzleSize: Vec2;
  topLayerData: { minedDepth: number, isHighlighted: boolean, isInvestigated: boolean }[][] = []; // 2d xy coordinate array of tiles
  tileData: { hasShiny: boolean, numAround: number }[][][] = []; // 3d xyz coordinate array
  maxDepth: number = -1;

  totalShinies: number;
  shiniesFound: number = 0;

  constructor(gameState: GameState) {
    this.uuid = generateUUID();

    const puzzleSize: Vec2 = vec2(gameState.getResolvedValue("meno.puzzleSize").resolve());
    const numLayers = gameState.getResolvedValue("meno.puzzleDepth").resolve();
    const shiniesPerLayer = gameState.getResolvedValue("meno.shinyPerLayer").resolve();

    this.puzzleSize = puzzleSize;
    this.maxDepth = numLayers - 1;
    this.totalShinies = shiniesPerLayer * numLayers;

    // Generate arrays of data
    for (let x = 0; x < puzzleSize.x; x++) {
      this.topLayerData.push([]);
      this.tileData.push([]);
      for (let y = 0; y < puzzleSize.y; y++) {
        this.topLayerData[x].push({ isInvestigated: false, isHighlighted: false, minedDepth: x == puzzleSize.x || y == puzzleSize.y ? this.maxDepth : -1 });
        this.tileData[x].push([]);
        for (let z = 0; z < numLayers; z++) {
          this.tileData[x][y].push({ hasShiny: false, numAround: 0 });
        }
      }
    }

    // Place shinies
    for (let i = 0; i < numLayers; i++) {
      const deck: Vec2[] = [];
      for (let x = 0; x < puzzleSize.x; x++) {
        for (let y = 0; y < puzzleSize.y; y++) {
          deck.push(vec2(x, y));
        }
      }
      for (let j = 0; j < shiniesPerLayer; j++) {
        if (deck.length == 0) {
          break;
        }
        const card: Vec2 = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
        this.tileData[card.x][card.y][i].hasShiny = true;
      }
    }

    // Calculate adjacency numbers
    for (let x = 0; x < puzzleSize.x; x++) {
      for (let y = 0; y < puzzleSize.y; y++) {
        for (let z = 0; z < numLayers; z++) {
          ADJACENT_POSITIONS.forEach((clock) => {
            const position = vec2(x, y).plus(clock);
            if (this.isInPuzzleBounds(position) && this.tileData[position.x][position.y][z].hasShiny) {
              this.tileData[x][y][z].numAround += 1;
            }
          });
        }
      }
    }
  }

  isCellActionable = (coord: Vec2, toolAction: number) => {
    return this.isInPuzzleBounds(coord);
  }

  performCellAction = (coord: Vec2, toolAction: number) => {
    if (this.isInPuzzleBounds(coord)) {
      const tld = this.topLayerData[coord.x][coord.y];
      if (toolAction == TOOL_MAGNIFYING_GLASS && !tld.isInvestigated && tld.minedDepth != this.maxDepth) {
        tld.isInvestigated = true;
        return 0;
      } else if ((toolAction == TOOL_CHISEL || toolAction == TOOL_HAMMER) && tld.minedDepth < this.maxDepth) {
        tld.isInvestigated = false;
        tld.minedDepth += 1;
        const foundShiny = this.tileData[coord.x][coord.y][tld.minedDepth].hasShiny ? 1 : 0;
        this.shiniesFound += foundShiny;
        return foundShiny;
      }
    }

    return -1;
  }

  isInPuzzleBounds = (coord: Vec2) => {
    return coord.x >= 0 && coord.y >= 0 && coord.x < this.puzzleSize.x && coord.y < this.puzzleSize.y;
  }

  getRenderCellSize = () => {
    return 48.0 * Math.min(8.0 / this.puzzleSize.y, 1.0);
  }
}

interface MenoMinigameAreaProps {
  gameState: GameState,
  hooks: { gameTick: ((_: number) => void)[] },
}

export interface MenoMinigameAreaState {
  currentPuzzle: LogicPuzzle,
  nextPuzzle: LogicPuzzle,
  toolUsesLeft: number[],
  numStockedPuzzles: number,
  progressToNextPuzzle: number,
}

export class MenoMinigameArea extends React.Component {
  props: MenoMinigameAreaProps;
  state: MenoMinigameAreaState;

  canvasRef = React.createRef<HTMLCanvasElement>();
  ikuminSpritesheetRef = React.createRef<HTMLImageElement>();
  floatingNumbers: LogicFloatingNumber[] = [];

  currentTool: number = TOOL_MAGNIFYING_GLASS;
  hoveredCell: Vec2 = vec2(-1, -1);

  timePassed: number = 0.0;
  showMouse: boolean = false;
  mousePos: Vec2 = vec2();
  lastMousePos: Vec2 = vec2();
  mouseDown: boolean = false;
  mouseDownTime: number = 0.0;

  puzzleTransitionTime: number = 1.0;
  puzzleShakeEffectTime: number = 0.0;
  pingEffects: { position: Vec2, animationProgress: number }[] = [];
  particleEffects: { position: Vec2, velocity: Vec2 }[] = [];
  shinyGatherEffects: { id: number, position: Vec2, animationProgress: number }[] = [];

  constructor(props: MenoMinigameAreaProps) {
    super(props);
    this.state = {
      currentPuzzle: new LogicPuzzle(props.gameState),
      nextPuzzle: null,
      toolUsesLeft: [1, 1],
      numStockedPuzzles: 5,
      progressToNextPuzzle: 1.0,
    };
  }

  componentDidMount(): void {
    this.props.hooks.gameTick.push(this.gameTick);
    if (this.props.gameState.liveState.menoMinigame) {
      Object.assign(this.state, this.props.gameState.liveState.menoMinigame);
    }
  }

  componentWillUnmount(): void {
    this.props.hooks.gameTick.splice(this.props.hooks.gameTick.indexOf(this.gameTick), 1);
    this.props.gameState.liveState.menoMinigame = this.state;
  }

  handleOnMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    this.showMouse = true;
    const parentRect = e.currentTarget.getBoundingClientRect();
    this.mousePos.x = e.clientX - parentRect.left;
    this.mousePos.y = e.clientY - parentRect.top;
  }

  handleOnMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    this.showMouse = false;
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
      case "1":
        this.changeTool(TOOL_MAGNIFYING_GLASS);
        break;
      case "2":
        this.changeTool(TOOL_CHISEL);
        break;
    }
  }

  handleGoToNextPuzzle = () => {
    this.setState((state: MenoMinigameAreaState, props: MenoMinigameAreaProps) => {
      if (state.numStockedPuzzles > 0) {
        state.numStockedPuzzles -= 1;
        state.nextPuzzle = new LogicPuzzle(props.gameState);
        state.toolUsesLeft = this.getMaxToolUses();

        this.puzzleTransitionTime = 0.0;
      }
      return state;
    });
  }

  handleOnCellClicked = (cell: Vec2) => {
    if (this.state.toolUsesLeft[this.currentTool] > 0) {
      if (this.state.currentPuzzle.isCellActionable(cell, this.currentTool)) {
        const coordsToAction = this.currentTool == TOOL_MAGNIFYING_GLASS ? getMagnifyingGlassCoords(cell, this.props.gameState.getCurrency("meno.magnifyingGlass1").getCurrentAmountShort()) : getChiselCoords(cell, this.props.gameState.getCurrency("meno.chisel1").getCurrentAmountShort());
        let hadAnyEffect = false;
        coordsToAction.forEach((coord) => {
          const useResult = this.state.currentPuzzle.performCellAction(coord, this.currentTool);
          if (useResult >= 0) {
            hadAnyEffect = true;
            const cellRenderPosition = coord.minus(this.state.currentPuzzle.puzzleSize.times(0.5)).times(this.state.currentPuzzle.getRenderCellSize()).reverse().plus(SCENE_SIZE.times(0.5).plus(vec2(this.state.currentPuzzle.getRenderCellSize()).times(0.5)));
            if (this.currentTool == TOOL_MAGNIFYING_GLASS) {
              this.pingEffects.push({ position: cellRenderPosition.get(), animationProgress: 1.0 });
            } else if (this.currentTool == TOOL_CHISEL) {
              this.puzzleShakeEffectTime = 1.0;
              for (let i = 0; i < 10; i++) {
                this.particleEffects.push({ position: cellRenderPosition.get(), velocity: Vec2.unit(-Math.random() * Math.PI).times(Math.random() * 100.0 + 100.0) });
              }
              if (useResult > 0) {
                this.props.gameState.getCurrency("meno.shiny").addAmount(1n);
                this.floatingNumbers.push(new LogicFloatingNumber(cellRenderPosition.plus(vec2(0.0, -16.0)), "+1", "floating-number-inner-shiny"));
                this.shinyGatherEffects.push({ id: generateUUID(), position: cellRenderPosition.plus(vec2(2, 2)), animationProgress: 0.0 });
              }
            }
          }
        });
        if (hadAnyEffect) {
          this.state.toolUsesLeft[this.currentTool] -= 1;
        }
      }
    }
  }

  handleOnCellHovered = (cell: Vec2) => {
    if (!this.hoveredCell.isEqual(cell)) {
      this.hoveredCell.set(cell);
      this.state.currentPuzzle.topLayerData.forEach((_) => _.forEach((tile) => {
        tile.isHighlighted = this.currentTool == TOOL_HAMMER;
      }));
      if (this.state.currentPuzzle.isCellActionable(cell, this.currentTool)) {
        const highlightedCoords = this.currentTool == TOOL_MAGNIFYING_GLASS ? getMagnifyingGlassCoords(cell, this.props.gameState.getCurrency("meno.magnifyingGlass1").getCurrentAmountShort()) : getChiselCoords(cell, this.props.gameState.getCurrency("meno.chisel1").getCurrentAmountShort());
        highlightedCoords.forEach((coord) => {
          if (this.state.currentPuzzle.isInPuzzleBounds(coord)) {
            this.state.currentPuzzle.topLayerData[coord.x][coord.y].isHighlighted = true;
          }
        });
      }
    }
  }

  handleOnPuzzleLeave = () => {
    this.hoveredCell = vec2(-1, -1);
    this.state.currentPuzzle.topLayerData.forEach((_) => _.forEach((tile) => {
      tile.isHighlighted = false;
    }));
  }

  gameTick = (time: number) => {
    if (this.props.gameState.getGenerator("meno.passiveMode").enabled) {
      return;
    }

    this.timePassed += time;

    if (time > 60.0) {
      // Don't run the game simulation if it's too large an amount of time to prevent insane lag
      // Grant some pity equivalent to running in passive mode for that period of time
      this.props.gameState.getCurrency("meno.shiny").addFractionalAmount(this.props.gameState.getResolvedValue("meno.shinyGenerator").resolve() * time);
      return;
    }

    this.setState((state: MenoMinigameAreaState, props: MenoMinigameAreaProps) => {
      const gameState = props.gameState;

      state.progressToNextPuzzle += time / gameState.getResolvedValue("meno.puzzleGenerationTime").resolve();
      if (state.progressToNextPuzzle >= 1.0) {
        if (state.numStockedPuzzles < MAX_PUZZLES) {
          state.numStockedPuzzles += 1;
          state.progressToNextPuzzle = 0.0;
          this.pingEffects.push({ position: vec2(SCENE_SIZE.x - 40.0, 70.0), animationProgress: 1.0 });

          const numExtraShiny = gameState.getResolvedValue("meno.extraShinyPerDig").resolve();
          if (numExtraShiny > 0) {
            gameState.getCurrency("meno.shiny").addFractionalAmount(numExtraShiny);
            this.floatingNumbers.push(new LogicFloatingNumber(vec2(SCENE_SIZE.x - 40.0, 70.0), `+${numExtraShiny}`, "floating-number-inner-shiny"));
          }
        } else {
          state.progressToNextPuzzle = 1.0;
        }
      }

      // Update effects
      this.puzzleShakeEffectTime = Math.max(0.0, this.puzzleShakeEffectTime - time / 0.3);
      if (this.puzzleTransitionTime < 1.0) {
        this.puzzleTransitionTime += time / 0.4;
        if (this.puzzleTransitionTime >= 1.0) {
          this.puzzleTransitionTime = 1.0;
          state.currentPuzzle = state.nextPuzzle;
          state.nextPuzzle = null;
        }
      }

      this.pingEffects = this.pingEffects.filter((effect) => {
        effect.animationProgress -= time / 0.4;
        return effect.animationProgress > 0.0;
      });
      this.particleEffects = this.particleEffects.filter((particle) => {
        const newVelocity = particle.velocity.plus(vec2(0, 600.0 * time));
        particle.position.plusEquals(particle.velocity.plus(newVelocity).times(0.5 * time));
        particle.velocity.set(newVelocity);
        return particle.position.y < SCENE_SIZE.y;
      });
      this.shinyGatherEffects = this.shinyGatherEffects.filter((effect) => {
        effect.animationProgress += time;
        return effect.animationProgress < 1.0;
      });

      // Update floating text
      this.floatingNumbers = this.floatingNumbers.filter((obj) => {
        obj.gameTick(time);
        return obj.lifetime > 0.0;
      });

      // Draw
      const canvas = this.canvasRef.current;
      if (canvas) {
        canvas.width = 960;
        canvas.height = 540;

        const context = canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);

        context.strokeStyle = "#ffff00";
        context.lineWidth = 3.0;
        this.pingEffects.forEach((ping) => {
          context.globalAlpha = ping.animationProgress;
          context.beginPath();
          context.arc(ping.position.x, ping.position.y, 100.0 * Math.sqrt(1.0 - ping.animationProgress), 0.0, 360.0, false);
          context.closePath();
          context.stroke();
        });

        context.globalAlpha = 1.0;
        context.fillStyle = "#808080";
        this.particleEffects.forEach((particle) => {
          context.fillRect(particle.position.x - 1, particle.position.y - 1, 2, 2);
        });
      }

      this.lastMousePos.set(this.mousePos);

      return state;
    });
  }

  changeTool = (toolId: number) => {
    this.currentTool = toolId;
    this.mouseDown = false;
  }

  getMaxToolUses = () => {
    return [
      1 + this.props.gameState.getCurrency("meno.magnifyingGlass").getCurrentAmountShort(),
      1 + this.props.gameState.getCurrency("meno.chisel").getCurrentAmountShort()
    ];
  }

  render() {
    const gameState = this.props.gameState;

    const hotbarItems = [magnifying_glass, chisel];
    const maxToolUses = this.getMaxToolUses();
    let hotbarDivs = [];
    hotbarItems.forEach((item, index) => {
      hotbarDivs.push(<div key={index} className={`hotbar-item-container${this.currentTool == index ? " selected" : ""}${this.state.toolUsesLeft[index] > 0 ? "" : " disabled"}`} onMouseDown={(e) => { this.changeTool(index); e.stopPropagation(); }}>
        <img className="hotbar-item-img" src={item} />
        <div className="hotbar-item-count"><b>{`${this.state.toolUsesLeft[index]}/${maxToolUses[index]}`}</b></div>
        <div className="hotbar-item-shortcut"><b>{index + 1}</b></div>
      </div >);
    });

    const hasMorePuzzles = this.state.numStockedPuzzles > 0;
    const stockFull = this.state.numStockedPuzzles >= MAX_PUZZLES && this.state.progressToNextPuzzle >= 1.0;
    const recommendNextPuzzle = this.state.currentPuzzle.shiniesFound == this.state.currentPuzzle.totalShinies || this.state.toolUsesLeft[TOOL_CHISEL] == 0
    const shinyGatherEffectElements = this.shinyGatherEffects.map((effect) => <img key={effect.id} className="meno-puzzle-shiny" style={{ position: "absolute", left: `${effect.position.x - 12}px`, top: `${effect.position.y - 12}px`, width: "24px" }} src={shiny} />);
    const floatingNumbers = this.floatingNumbers.map((logicObject) => logicObject.renderObject);

    return (
      <div className="minigame-area">
        <h1>{t("minigame.meno.name")}</h1>
        <ActivePassiveToggle
          gameState={this.props.gameState}
          toggleEnabled={gameState.getCurrency("meno.t2Unlock").getCurrentAmount() > 0n}
          generatorId="meno.passiveMode"
          generatorHintElement={<span>{gameState.getCurrency("meno.shiny").getFancyTextName(this.props.gameState.getResolvedValue("meno.shinyGenerator").resolve().toFixed(2))}/s&nbsp;
            <TooltipTrigger
              tooltipBoxStyle={{ bottom: "auto", top: "20" }}
              tooltipContents={<div>
              </div>}
            >
              [?]
            </TooltipTrigger>
          </span>
          }
        >
          <div>
            <p style={{ margin: "16pt auto 16pt", textAlign: "left" }}>
              {t("minigame.meno.description")}</p>
            <div
              className="minigame-size meno-minigame"
              style={{ cursor: "none", outline: "none" }}
              onMouseMove={this.handleOnMouseMove}
              onMouseLeave={this.handleOnMouseLeave}
              onMouseDown={this.handleOnMouseDown}
              onMouseUp={this.handleOnMouseUp}
              onKeyDown={this.handleOnKeyDown}
              tabIndex={-1}
            >
              <img style={{ display: "none" }} src={ikumin} ref={this.ikuminSpritesheetRef} />

              <div style={{ position: "absolute", top: "20px", left: 0, right: 0, margin: "0 auto", fontSize: "20pt" }}>Shinies: {`${this.state.currentPuzzle.shiniesFound}/${this.state.currentPuzzle.totalShinies}`}</div>
              <button className={hasMorePuzzles ? "" : "disabled"} style={{ position: "absolute", bottom: "20px", width: "80px", height: "40px", left: 0, right: 0, margin: "0 auto", filter: recommendNextPuzzle && hasMorePuzzles ? "drop-shadow(0 0 10px yellow)" : null }} onClick={(e) => { this.handleGoToNextPuzzle(); }} onMouseMove={(e) => { this.showMouse = false; e.stopPropagation(); }}>{recommendNextPuzzle ? "Next" : "Skip"}</button>

              {this.state.currentPuzzle ? <RenderPuzzle
                key={this.state.currentPuzzle.uuid}
                gameState={gameState}
                logicPuzzle={this.state.currentPuzzle}
                hoveredCell={this.hoveredCell}
                shake={this.puzzleShakeEffectTime}
                transitionAmount={this.puzzleTransitionTime % 1.0}
                onCellClickedHandler={this.handleOnCellClicked}
                onCellHoveredHandler={this.handleOnCellHovered}
                onPuzzleLeaveHandler={this.handleOnPuzzleLeave}
              /> : null}
              {this.state.nextPuzzle ? <RenderPuzzle
                key={this.state.nextPuzzle.uuid}
                gameState={gameState}
                logicPuzzle={this.state.nextPuzzle}
                transitionAmount={this.puzzleTransitionTime - 1.0}
              /> : null}
              {shinyGatherEffectElements}
              <canvas className="minigame-size" style={{ pointerEvents: "none" }} ref={this.canvasRef} />

              <div style={{ display: "flex", flexDirection: "column", position: "absolute", width: "80px", height: "100%", right: 0, top: 0, bottom: 0, margin: "auto 0" }}>
                <div className="horizontal-align-outer" style={{ flex: "1 0 0" }}><b>Blocks:<br />{`${this.state.numStockedPuzzles}/${MAX_PUZZLES}`}</b></div>
                <div style={{ position: "relative", flex: "0 0 1", margin: "0 auto", border: "1px solid black", width: "20px", height: "400px" }}>
                  <div style={{ position: "absolute", bottom: 0, width: "100%", height: `${(400.0 * this.state.progressToNextPuzzle).toFixed(0)}px`, backgroundColor: "yellow" }} />
                </div>
                <div className="horizontal-align-outer" style={{ flex: "1 0 0", fontSize: "8pt" }}><b>{stockFull ? (<span>Output<br />Full</span>) : "Digging..."}</b></div>
              </div>
              {stockFull ? null : (<RenderGameObject position={SCENE_SIZE.minus(vec2(40.0, 35.0))} sprite={spinner} spriteWidth={48.0} spriteHeight={48.0} outerStyle={{ animation: "rotate-stepwise-1-8 1s infinite" }} />)}

              <div className="minigame-hotbar">
                {hotbarDivs}
              </div>
              <RenderGameObject
                position={this.mousePos.plus(this.currentTool == TOOL_MAGNIFYING_GLASS ? vec2(-4.0, 0.0) : vec2(12.0, 10.0))}
                sprite={this.currentTool == TOOL_MAGNIFYING_GLASS ? magnifying_glass : chisel}
                spriteWidth={32.0}
                spriteHeight={32.0}
                outerStyle={{ visibility: this.showMouse ? "visible" : "hidden", filter: this.state.toolUsesLeft[this.currentTool] > 0 ? "none" : "grayscale(100%)" }}
              />

              {floatingNumbers}
            </div>
          </div>
        </ActivePassiveToggle>

        <div className="shop-divider" />
      </div>
    );
  }
}