import { vec2 } from "./minigames/util";

export const GAME_TICK_TIME = 1000.0 / 60.0;
export const SCENE_SIZE = vec2(960.0, 540.0);

export const awowiName = "Awowi";
export const awowiFullName = "Awowi Towokimowi";

export const BASE_NUGGIE_TIMER = 5.0;
export const BASE_WCBONALDS_TIMER = 60.0;
export const BASE_WCBONALDS_POSITION = {
  left: 760.0,
  top: 40.0,
  width: 200.0,
  height: 200.0,
};
export const BASE_AOI_SPEED = 50.0;
export const NUGGIE_HIT_RADIUS = 32.0;
export const SMELL_WAFTER_MOVE_SPEED_BONUS_PERCENT = 50.0;
export const COMPRESSED_NUGGIE_1_RATE = 5.0;
export const AOI_BOOST_PER_NFT = 100.0;
export const NUGGIE_MAGNET_AREA_EACH = Math.pow(SCENE_SIZE.y * Math.sqrt(2) / 2 / 2, 2) / 10;
export const AOI_DOG_SPEED = 400.0;
export const AOI_DOG_AREA_EACH = Math.pow(SCENE_SIZE.y * Math.sqrt(2) / 2 / 2, 2) / 6;