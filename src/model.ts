import { ReactComponent as House } from './svg/house.svg';
import { ReactComponent as RoadEnd } from './svg/road_end.svg';
import { ReactComponent as Pawn } from './svg/pawn.svg';

export const GRID_SIZE = 64;
export const TICK_RATE = 1; // per second

export type BuildingConfig = {
  id: string,
  name: string,
  svg: React.FunctionComponent,
}

export const BUILDINGS_CONFIG: BuildingConfig[] = [
  {
    id: 'house',
    name: 'House',
    svg: House,
  },
  {
    id: 'road',
    name: 'Road',
    svg: RoadEnd,
  },
];

export class Building {
  x: number;
  y: number;
  type: string;
  svg: React.FunctionComponent;
  cooldown: number = 0;

  constructor(x: number, y: number, type: string){
    this.x = x;
    this.y = y;
    this.type = type;
    this.svg = BUILDINGS_CONFIG.find(config => config.id === type)!.svg;
  }
}

export type UnitConfig = {
  id: string,
  name: string,
  svg: React.FunctionComponent,
}

export const UNITS_CONFIG: UnitConfig[] = [
  {
    id: 'pawn',
    name: 'Pawn',
    svg: Pawn,
  },
];

export class Unit {
  x: number;
  y: number;
  type: string;
  svg: React.FunctionComponent;

  constructor(x: number, y: number, type: string){
    this.x = x;
    this.y = y;
    this.type = type;
    this.svg = UNITS_CONFIG.find(config => config.id === type)!.svg;
  }
}