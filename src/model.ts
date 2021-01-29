import { ReactComponent as House } from './svg/house.svg';
import { ReactComponent as RoadNorth } from './svg/road_n.svg';
import { ReactComponent as RoadEast } from './svg/road_e.svg';
import { ReactComponent as RoadSouth } from './svg/road_s.svg';
import { ReactComponent as RoadWest } from './svg/road_w.svg';
import { ReactComponent as Pawn } from './svg/pawn.svg';
import { ReactComponent as Orc } from './svg/orc.svg';
import { ReactComponent as Cave } from './svg/cave.svg';
import { ReactComponent as Rock } from './svg/rock.svg';
import { ReactComponent as Tree } from './svg/tree.svg';
import { ReactComponent as Wall } from './svg/wall.svg';
import { ReactComponent as Wood } from './svg/wood.svg';
import { ReactComponent as Ore } from './svg/ore.svg';
import { ReactComponent as Ingot } from './svg/ingot.svg';
import { ReactComponent as Axe } from './svg/axe.svg';
import { ReactComponent as Pick } from './svg/pick.svg';
import { ReactComponent as Sword } from './svg/sword.svg';
import { ReactComponent as Shield } from './svg/shield.svg';
import { ReactComponent as Hoe } from './svg/hoe.svg';
import { ReactComponent as Scythe } from './svg/scythe.svg';
import { ReactComponent as Bucket } from './svg/bucket.svg';
import { ReactComponent as FishingRod } from './svg/fishing-rod.svg';
import { ReactComponent as Wheat } from './svg/wheat.svg';
import { ReactComponent as Crops } from './svg/crops.svg';
import { ReactComponent as Sprout } from './svg/sprout.svg';
import { ReactComponent as Seeds } from './svg/seeds.svg';
import { ReactComponent as Fish } from './svg/fish.svg';
import { ReactComponent as Bush } from './svg/bush.svg';
import { ReactComponent as StoneworkTable } from './svg/stonework-table.svg';
import { ReactComponent as StonePile } from './svg/stone-pile.svg';
import { ReactComponent as Stone } from './svg/stone.svg';
import { ReactComponent as Anvil } from './svg/anvil.svg';
import { ReactComponent as Chest } from './svg/chest.svg';
import { ReactComponent as Furnace } from './svg/furnace.svg';
import { ReactComponent as StoneworkIcon } from './svg/stonework-icon.svg';
import { ReactComponent as ChestIcon } from './svg/chest-icon.svg';
import { ReactComponent as AnvilIcon } from './svg/anvil-icon.svg';
import { ReactComponent as FurnaceIcon } from './svg/furnace-icon.svg';
import { ReactComponent as X } from './svg/x.svg';

/* Config */
export const GRID_SIZE = 64;
export const TICK_RATE = 1; // per second
export const MAX_FOOD = 20;
export const MAX_HEALTH = 5;

/* Items */
export type ItemConfig = {
  id: string,
  svg: React.FunctionComponent,
}

export const ITEMS_CONFIG: ItemConfig[] = [
  {
    id: 'wood',
    svg: Wood,
  },
  {
    id: 'ore',
    svg: Ore,
  },
  {
    id: 'ingot',
    svg: Ingot,
  },
  {
    id: 'axe',
    svg: Axe,
  },
  {
    id: 'pick',
    svg: Pick,
  },
  {
    id: 'sword',
    svg: Sword,
  },
  {
    id: 'shield',
    svg: Shield,
  },
  {
    id: 'hoe',
    svg: Hoe,
  },
  {
    id: 'scythe',
    svg: Scythe,
  },
  {
    id: 'bucket',
    svg: Bucket,
  },
  {
    id: 'fishing-rod',
    svg: FishingRod,
  },
  {
    id: 'wheat',
    svg: Wheat,
  },
  {
    id: 'seeds',
    svg: Seeds,
  },
  {
    id: 'fish',
    svg: Fish,
  },
  {
    id: 'stone',
    svg: Stone,
  },
];

export function getItemConfig(type: string): ItemConfig {
  return ITEMS_CONFIG.find(config => config.id === type)!;
}

export class Item {
  x: number;
  y: number;
  type: string;
  svg: React.FunctionComponent;

  constructor(x: number, y: number, type: string){
    this.x = x;
    this.y = y;
    this.type = type;
    this.svg = ITEMS_CONFIG.find(config => config.id === type)!.svg;
  }
}

export type ItemStack = {
  type: string,
  quantity: number,
  config?: ItemConfig,
}

/* Buildings */
export type CraftingRecipe = {
  input: ItemStack[],
  output: ItemStack[],
}

export type BuildingConfig = {
  id: string,
  svg: React.FunctionComponent,
  icon?: React.FunctionComponent,
  craftingRecipes?: CraftingRecipe[],
  inputSlots?: number,
  outputSlots?: number,
}

export const BUILDINGS_CONFIG: BuildingConfig[] = [
  {
    id: 'house',
    svg: House,
  },
  {
    id: 'stonework-table',
    icon: StoneworkIcon,
    svg: StoneworkTable,
    craftingRecipes: [
      {
        input: [{type: 'stone', quantity: 1}],
        output: [{type: 'axe', quantity: 1}],
      },
      {
        input: [{type: 'stone', quantity: 1}],
        output: [{type: 'pick', quantity: 1}],
      },
    ],
    inputSlots: 1,
    outputSlots: 1,
  },
  {
    id: 'anvil',
    icon: AnvilIcon,
    svg: Anvil,
    craftingRecipes: [
      {
        input: [{ type: 'ingot', quantity: 3 }],
        output: [{ type: 'sword', quantity: 1 }],
      }
    ],
  },
  {
    id: 'furnace',
    svg: Furnace,
    icon: FurnaceIcon,
    craftingRecipes: [
      {
        input: [
          { type: 'ore', quantity: 1 },
          { type: 'wood', quantity: 1 },
        ],
        output: [{ type: 'ingot', quantity: 1 }],
      }
    ],
  },
  {
    id: 'chest',
    icon: ChestIcon,
    svg: Chest,
    craftingRecipes: ITEMS_CONFIG.map(itemConfig => ({
      input: [{type: itemConfig.id, quantity: 1}],
      output: [{ type: itemConfig.id, quantity: 1}],
    })),
  },
  {
    id: 'road_n',
    svg: RoadNorth,
  },
  {
    id: 'road_e',
    svg: RoadEast,
  },
  {
    id: 'road_s',
    svg: RoadSouth,
  },
  {
    id: 'road_w',
    svg: RoadWest,
  },
  {
    id: 'cave',
    svg: Cave,
  },
  {
    id: 'rock',
    svg: Rock,
  },
  {
    id: 'tree',
    svg: Tree,
  },
  {
    id: 'wall',
    svg: Wall,
  },
  {
    id: 'crops',
    svg: Crops,
  },
  {
    id: 'sprout',
    svg: Sprout,
  },
  // {
  //   id: 'stump',
  //   svg: Stump,
  // },
  {
    id: 'bush',
    svg: Bush,
  },
  {
    id: 'stone-pile',
    svg: StonePile,
  },
  {
    id: 'DELETE',
    svg: X,
  },
];

export type ConnectorType = 'in' | 'out' | null;

export class Building {
  x: number;
  y: number;
  type: string;
  svg: React.FunctionComponent;
  cooldown: number = 0;
  connector_n: ConnectorType = null;
  connector_s: ConnectorType = null;
  connector_e: ConnectorType = null;
  connector_w: ConnectorType = null;
  input: ItemStack[] = [];
  output: ItemStack[] = [];
  selectedRecipe: CraftingRecipe | null;
  config: BuildingConfig;

  constructor(x: number, y: number, type: string){
    this.x = x;
    this.y = y;
    this.type = type;
    this.config = BUILDINGS_CONFIG.find(config => config.id === type)!;
    this.svg = BUILDINGS_CONFIG.find(config => config.id === type)!.svg;
    this.selectedRecipe = this.config.craftingRecipes ? this.config.craftingRecipes[0] : null;
  }
}

/* Units */
export type UnitConfig = {
  id: string,
  svg: React.FunctionComponent,
}

export const UNITS_CONFIG: UnitConfig[] = [
  {
    id: 'pawn',
    svg: Pawn,
  },
  {
    id: 'orc',
    svg: Orc,
  },
];

export class Unit {
  x: number;
  y: number;
  type: string;
  food: number;
  health: number;
  svg: React.FunctionComponent;
  held_item: Item | null;
  spawn: {x: number, y: number} | null;

  constructor(x: number, y: number, type: string, spawn: {x: number, y: number} | null = null){
    this.x = x;
    this.y = y;
    this.type = type;
    this.food = MAX_FOOD;
    this.health = MAX_HEALTH;
    this.held_item = null;
    this.svg = UNITS_CONFIG.find(config => config.id === type)!.svg;
    this.spawn = spawn;
  }
}
