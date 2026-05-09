export const TILE = 32;
export const MAP_W = 25;
export const MAP_H = 19;

export const T = {
  GRASS: 0,
  PATH: 1,
  WALL: 2,
  TREE: 3,
  WATER: 4,
  BLDG: 5,
  DOOR: 6,
  FLOOR: 7,
  CARPET: 8,
  ROAD: 9,
  SIDEWALK: 10,
  DESK: 11,
  CHAIR: 12,
  BED: 13,
  COMPUTER: 14,
};

export const TILE_COLORS: Record<number, number> = {
  [T.GRASS]: 0x5a9e3e,
  [T.PATH]: 0xd4b483,
  [T.WALL]: 0x5c4033,
  [T.TREE]: 0x2d5a1e,
  [T.WATER]: 0x4a90d9,
  [T.BLDG]: 0x8b7d6b,
  [T.DOOR]: 0xbf8f3f,
  [T.FLOOR]: 0xc4a882,
  [T.CARPET]: 0x8b4513,
  [T.ROAD]: 0x666666,
  [T.SIDEWALK]: 0xaaaaaa,
  [T.DESK]: 0x6b4423,
  [T.CHAIR]: 0x4a4a4a,
  [T.BED]: 0x4682b4,
  [T.COMPUTER]: 0x333333,
};

export const COLLISION_TILES = new Set([T.WALL, T.TREE, T.WATER, T.BLDG, T.DESK, T.CHAIR, T.BED, T.COMPUTER]);

export type MapData = {
  tiles: number[][];
  width: number;
  height: number;
};

export function createMapData(tiles: number[][]): MapData {
  return { tiles, width: tiles[0].length, height: tiles.length };
}

export const MAP_ROOM: number[][] = [
  [2,2,2,2,2,2,2,2,2,2,2,2],
  [2,7,7,13,7,7,7,7,7,7,7,2],
  [2,7,7,7,7,7,7,7,7,7,7,2],
  [2,7,7,7,7,7,7,7,7,7,7,2],
  [2,7,7,7,7,7,7,7,7,7,7,2],
  [2,7,7,7,7,7,7,7,7,7,7,2],
  [2,7,7,7,7,7,7,7,14,7,7,2],
  [2,7,7,7,7,7,7,7,7,7,7,2],
  [2,7,7,7,7,7,7,7,7,7,7,2],
  [2,7,7,7,7,7,7,7,7,7,7,2],
  [2,2,2,2,2,6,2,2,2,2,2,2],
];

export const MAP_GUERNICA: number[][] = [
  [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  [3,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,3,0,0,0,0,3],
  [3,0,0,0,0,3,0,0,1,1,1,0,0,3,0,0,0,0,0,3,0,0,0,0,3],
  [3,0,0,0,0,3,0,0,1,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,3,0,3,3,3,0,0,1,0,0,3,3,3,3,0,0,3,3,3,3,0,0,3,3],
  [3,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,3,0,0,1,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,3,0,0,1,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
];

export function getMapAllaria(): number[][] {
  const m: number[][] = [];
  for (let y = 0; y < 15; y++) {
    m[y] = [];
    for (let x = 0; x < 25; x++) {
      if (y === 0 || y === 14 || x === 0 || x === 24) m[y][x] = T.WALL;
      else if (y === 2 && x >= 5 && x <= 8) m[y][x] = T.DESK;
      else if (y === 2 && x >= 16 && x <= 19) m[y][x] = T.DESK;
      else if (y === 7 && x === 12) m[y][x] = T.DOOR;
      else if (x >= 10 && x <= 14 && y >= 6 && y <= 8) m[y][x] = T.CARPET;
      else m[y][x] = T.FLOOR;
    }
  }
  return m;
}

export function getMapUADE(): number[][] {
  const m: number[][] = [];
  for (let y = 0; y < 19; y++) {
    m[y] = [];
    for (let x = 0; x < 25; x++) {
      if (y === 0 || y === 18 || x === 0 || x === 24) m[y][x] = T.WALL;
      else if (y < 3 && x > 5 && x < 18) m[y][x] = T.BLDG;
      else if (y > 14) m[y][x] = T.GRASS;
      else if (x > 10 && x < 16 && y > 5 && y < 12) m[y][x] = T.GRASS;
      else m[y][x] = T.PATH;
    }
  }
  return m;
}

export type NPCPosition = {
  id: string;
  tileX: number;
  tileY: number;
  color: number;
  label: string;
  dialogueKey: string;
};

export type EncounterZone = {
  x: number;
  y: number;
  w: number;
  h: number;
  encounter: string;
};

export type SceneTransition = {
  tileX: number;
  tileY: number;
  targetScene: string;
  targetX: number;
  targetY: number;
  label?: string;
};
