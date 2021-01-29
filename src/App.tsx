import React from 'react';
import { GRID_SIZE, Building, BUILDINGS_CONFIG, Unit, TICK_RATE, Item, MAX_FOOD, ConnectorType, ItemStack, CraftingRecipe, ITEMS_CONFIG, MAX_HEALTH } from './model';
import { ReactComponent as Connector } from './svg/connector.svg';
import { ReactComponent as ConnectorArrow } from './svg/connector-arrow.svg';
import './App.scss';
import { CraftingModal } from './components/crafting-modal/crafting-modal';

const randInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1) + min);
const chooseRandom = (array: any[]): any => array[randInt(0, array.length - 1)];

const toGrid = ({x, y}: {x: number, y: number}) => ({
  x: Math.ceil(x / GRID_SIZE) - 1,
  y: Math.ceil(y / GRID_SIZE) - 1,
});

const getRoadDestination = (road: Building) => {
  switch (road.type) {
    case 'road_n':
      return {x: road.x, y: road.y - 1}
    case 'road_s':
      return {x: road.x, y: road.y + 1}
    case 'road_e':
      return {x: road.x + 1, y: road.y}
    case 'road_w':
      return {x: road.x - 1, y: road.y}
    default:
      console.error(`Unknown road type ${road.type}`);
      return null;
  }
};

const getAdjacent = (x: number, y: number): {x: number, y: number}[] => {
  return [
    {x, y: y + 1},
    {x, y: y - 1},
    {x: x + 1, y},
    {x: x -1, y},
  ];
};

const isCraftingStation = (building: Building): boolean => {
  const config = BUILDINGS_CONFIG.find(config => config.id === building.type);
  if (!config) return false;
  return !!config.craftingRecipes;
}

interface AppState {
  buildings: Building[],
  units: Unit[],
  items: Item[]

  ghostBuilding: Building | null,
  craftingModal: Building | null,
}

export default class App extends React.Component<{}, AppState> {
  currentbuildMode: string | null = null;

  onClick(event: MouseEvent) {
    const ghost = this.state.ghostBuilding;
    if (!ghost) { return; }
    
    const buildingAlreadyThere = this.state.buildings.find(building => building.x === ghost.x && building.y === ghost.y);

    if (ghost.type === 'DELETE') {
      if (buildingAlreadyThere) {
        this.setState({ buildings: this.state.buildings.filter(building => building !== buildingAlreadyThere) });
      }
      return;
    }

    if (!buildingAlreadyThere) {
      this.setState({ buildings: [...this.state.buildings, ghost] });
    }
  }

  onMousemove(event: MouseEvent) {
    if (this.currentbuildMode === undefined) { return; }
    if (!this.state.ghostBuilding) { return; }
    const gridCoords = toGrid({ x: event.clientX, y: event.clientY });
    this.setState({ ghostBuilding: { ...this.state.ghostBuilding, ...gridCoords} });
  }

  onTick(){
    // Cooldown
    this.state.buildings.forEach(building => {
      if (building.cooldown > 0) {
        building.cooldown--;
      }
    })

    // Spawn
    this.state.buildings
      .filter(building => building.type === 'house')
      .forEach(house => {
        if (house.cooldown <= 0 && !this.state.units.find(unit => unit.x === house.x && unit.y === house.y)) {
          const spawn_squares = this.getUnitSpawnSquares(house.x, house.y);
          if (spawn_squares.length === 0) { return; }
          const destination = chooseRandom(spawn_squares);
          this.setState({units: [...this.state.units, new Unit(destination.x, destination.y, 'pawn', house)]});
          house.cooldown = MAX_FOOD;
        }
      });

    // Spawn enemies
    this.state.buildings
      .filter(building => building.type === 'cave')
      .forEach(cave => {
        if (cave.cooldown <= 0 && !this.state.units.find(unit => unit.x === cave.x && unit.y === cave.y)) {
          const spawn_squares = this.getEnemySpawnSquares(cave.x, cave.y);
          if (spawn_squares.length === 0) { return; }
          const destination = chooseRandom(spawn_squares);
          this.setState({units: [...this.state.units, new Unit(destination.x, destination.y, 'orc', cave)]});
          cave.cooldown = MAX_FOOD;
        }
      });

      // Craft 
      this.state.buildings
      .forEach(craftingStation => {
        // Sanity checks
        const config = BUILDINGS_CONFIG.find(config => config.id === craftingStation.type);
        if (!config) { return; }
        if (!config.craftingRecipes) { return; }
        const recipe = craftingStation.selectedRecipe;
        if (!recipe) { return; }

        // Check that we have all ingredients
        let validInput = true;
        recipe.input.forEach(recipeStack => {
          if (!validInput) return;
          if (!craftingStation.input.find(itemStack => itemStack.type === recipeStack.type && itemStack.quantity >= recipeStack.quantity)) {
            validInput = false;
            return;
          }
        });
        if (!validInput) return;

        // Now subtract the input...
        recipe.input.forEach(recipeStack => {
          const inputStack = craftingStation.input.find(itemStack => itemStack.type === recipeStack.type)!;
          inputStack.quantity -= recipeStack.quantity;
          if (inputStack.quantity <= 0) {
            craftingStation.input = craftingStation.input.filter(input => input !== inputStack);
          }
        });

        // ...And add the output
        recipe.output.forEach(recipeStack => {
          const outputStack = craftingStation.output.find(itemStack => itemStack.type === recipeStack.type)!;
          if (outputStack) {
            outputStack.quantity += recipeStack.quantity;
          } else {
            craftingStation.output.push({type: recipeStack.type, quantity: recipeStack.quantity});
          }
        });
      });

    this.state.units
      .filter(unit => unit.type === 'pawn')
      .forEach(pawn => {
        // Hunger
        pawn.food--;
        if (pawn.food === 0) {
          // Drop held item
          if (pawn.held_item) {
            pawn.held_item.x = pawn.x;
            pawn.held_item.y = pawn.y;
            this.setState({
              items: [...this.state.items, pawn.held_item]
            });
          }

          // Starve
          this.setState({
            units: [...this.state.units.filter(unit => unit !== pawn)],
          });

          return;
        }

        // Gather
        let interacted = false;
        const adjacent = getAdjacent(pawn.x, pawn.y);
        const resources = ['tree', 'rock', 'bush', 'stone-pile'];
        adjacent.forEach(tile => {
          if (interacted) { return; }
          const resource = this.state.buildings.find(building => building.x === tile.x && building.y === tile.y && resources.includes(building.type));
          if (!resource) { return; }
          if (resource.cooldown <= 0) {
            if (resource.type === 'bush') {
              pawn.food = MAX_FOOD;
              resource.cooldown = 10;
              this.setState({
                units: [...this.state.units],
              });
            } else if (resource.type === 'rock') {
              if (!pawn.held_item || pawn.held_item.type !== 'pick') { return; }
              this.setState({
                items: [...this.state.items, new Item(pawn.x, pawn.y, 'ore')],
              });
            } else if (resource.type === 'stone-pile') {
              if (pawn.held_item) { return; }
              this.setState({
                items: [...this.state.items, new Item(pawn.x, pawn.y, 'stone')],
              });
            } else if (resource.type === 'tree') {
              if (!pawn.held_item || pawn.held_item.type !== 'axe') { return; }
              this.setState({
                items: [...this.state.items, new Item(pawn.x, pawn.y, 'wood')],
              });
            }
            resource.cooldown = 10;
            interacted = true;
          }
        });

        // Attack
        const enemies = ['orc'];
        adjacent.forEach(tile => {
          if (interacted) return;
          const enemy = this.state.units.find(unit => enemies.includes(unit.type) && unit.x === tile.x && unit.y === tile.y);
          if (!enemy) return;
          if (!pawn.held_item || pawn.held_item.type !== 'sword') return;
          enemy.health--;
          if (enemy.health <= 0) {
            this.setState({
              units: this.state.units.filter(unit => unit !== enemy)
            });
          }
        })

        // Load/unload crafting
        const crafting = ['stonework-table', 'furnace', 'anvil', 'chest'];
        adjacent.forEach(tile => {
          if (interacted) { return; }
          const craftingStation = this.state.buildings.find(building => building.x === tile.x && building.y === tile.y && crafting.includes(building.type));
          if (!craftingStation) { return; }
          const selectedRecipe = craftingStation.selectedRecipe;
          if (!selectedRecipe) { return; }

          let connector;
          if (craftingStation.y > pawn.y) { connector = craftingStation.connector_n; }
          if (craftingStation.y < pawn.y) { connector = craftingStation.connector_s; }
          if (craftingStation.x > pawn.x) { connector = craftingStation.connector_w; }
          if (craftingStation.x < pawn.x) { connector = craftingStation.connector_e; }

          if (connector === 'in' && pawn.held_item && selectedRecipe.input.find(recipeStack => recipeStack.type === pawn.held_item!.type)) {
            let existingStack = craftingStation.input.find(stack => stack.type === pawn.held_item!.type);
            if (existingStack) { existingStack.quantity++; }
            else { craftingStation.input.push({type: pawn.held_item!.type, quantity: 1}); }
            pawn.held_item = null;
            interacted = true;
          } else if (connector === 'out' && craftingStation.output.length > 0 && !pawn.held_item) {
            let outputItem = craftingStation.output.pop();
            pawn.held_item = new Item(pawn.x, pawn.y, outputItem!.type);
            interacted = true;
          }
        });

        // Pick up item
        const itemToPickup = this.state.items.find(item => item.x === pawn.x && item.y === pawn.y);
        if(!pawn.held_item && itemToPickup) {
          pawn.held_item = itemToPickup;
          this.setState({
            items: this.state.items.filter(item => item !== itemToPickup)
          });
        }

        if (interacted) { return; }

        // Move
        const currentRoad = this.state.buildings.find(building => building.type.startsWith('road') && building.x === pawn.x && building.y === pawn.y);
        if (! currentRoad) { return; }
        const destination = getRoadDestination(currentRoad);
        const occupyingUnit = destination && this.state.units.find(unit => unit.x === destination.x && unit.y === destination.y)
        if (destination && !occupyingUnit) {
          pawn.x = destination.x;
          pawn.y = destination.y;
          this.setState({units: [...this.state.units]});
        }
      });

    this.state.units
      .filter(unit => unit.type === 'orc')
      .forEach(orc => {
        const adjacent = getAdjacent(orc.x, orc.y);
        if (!orc.spawn) return;

        let attacked = false;
        adjacent.forEach(tile => {
          if (attacked) return;
          const pawn = this.state.units.find(unit => unit.type === 'pawn' && unit.x === tile.x && unit.y === tile.y);
          if (!pawn) return;
          attacked = true;
          pawn.health--;
          if (pawn.health <= 0) {
            this.setState({
              units: this.state.units.filter(unit => unit !== pawn)
            });
          }
        });
        if (attacked) return;

        // random walk
        const walkTo = chooseRandom(adjacent
          .filter(tile => !this.state.buildings.find(building => building.x === tile.x && building.y === tile.y && !building.type.startsWith('road')))
          .filter(tile => !this.state.units.find(unit => unit.x === tile.x && unit.y === tile.y))
          .filter(tile => orc.spawn && Math.abs(tile.x - orc.spawn.x) <= 2 && Math.abs(tile.y - orc.spawn.y) <= 2));

        orc.x = walkTo.x;
        orc.y = walkTo.y;
      });

    // Dirty force refresh
    this.setState({
      items: [...this.state.items],
      buildings: [...this.state.buildings],
      units: [...this.state.units],
    });

    this.saveGame();
  }

  saveGame() {
    window.localStorage.setItem('buildings', JSON.stringify(this.state.buildings));
  }

  loadGame() {
    const buildings = window.localStorage.getItem('buildings');
    if (!buildings) { return; }
    let parsed = JSON.parse(buildings);
    parsed.forEach((building: Building) => {
      building.svg = BUILDINGS_CONFIG.find(config => config.id === building.type)!.svg;
      building.cooldown = 0;
    });
    this.setState({ buildings: parsed });
  }

  clear() {
    return this.setState({
      buildings: [],
      items: [],
      units: [],
    });
  }

  restart() {
    this.state.buildings.forEach(building => {
      building.cooldown = 0;
      building.input = [];
      building.output = [];
    });

    return this.setState({
      items: [],
      units: [],
      buildings: [...this.state.buildings],
    });
  }

  getUnitSpawnSquares(x: number, y: number): {x: number, y: number}[] {
    const n = {x, y: y - 1};
    const s = {x, y: y + 1};
    const e = {x: x + 1, y};
    const w = {x: x - 1, y};
    const spawn_n = this.state.buildings.find(building => building.type === 'road_n' && building.x === n.x && building.y === n.y);
    const spawn_s = this.state.buildings.find(building => building.type === 'road_s' && building.x === s.x && building.y === s.y);
    const spawn_e = this.state.buildings.find(building => building.type === 'road_e' && building.x === e.x && building.y === e.y);
    const spawn_w = this.state.buildings.find(building => building.type === 'road_w' && building.x === w.x && building.y === w.y);
    return [
      spawn_n,
      spawn_s,
      spawn_e,
      spawn_w,
    ].filter(spawn => spawn !== undefined && !this.state.units.find(unit => unit.x === spawn.x && unit.y === spawn.y)) as {x: number, y: number}[];
  }

  getEnemySpawnSquares(x: number, y: number): {x: number, y: number}[] {
    const n = {x, y: y - 1};
    const s = {x, y: y + 1};
    const e = {x: x + 1, y};
    const w = {x: x - 1, y};
    return [n, s, e, w]
      .filter(spawn => {
        const hasBuilding = this.state.units.find(unit => unit.x === spawn.x && unit.y === spawn.y);
        const hasUnit = this.state.buildings.find(building => building.x === spawn.x && building.y === spawn.y);
        return !hasBuilding && !hasUnit;
      });
  }

  componentDidMount() {
    window.addEventListener('mousemove', this.onMousemove.bind(this));
    window.addEventListener('click', this.onClick.bind(this));
    window.setInterval(this.onTick.bind(this), Math.round(1000 / TICK_RATE));
    this.loadGame();
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.onMousemove.bind(this));
    window.removeEventListener('click', this.onMousemove.bind(this));
  }

  setBuildMode(buildingType: string, event: React.MouseEvent) {
    // Toggle build mode back off
    if (this.currentbuildMode === buildingType) {
      this.currentbuildMode = null;
      this.setState({ghostBuilding: null});
      event.stopPropagation();
      return;
    }

    this.currentbuildMode = buildingType;
    const gridCoords = toGrid({ x:event.clientX, y: event.clientY });
    this.setState({ghostBuilding: new Building(gridCoords.x, gridCoords.y, buildingType)});
    console.log(this.state.ghostBuilding);
    console.log(!!this.state.ghostBuilding);
    event.stopPropagation();
  }

  toggleConnector(building: Building, side: 'n' | 's' | 'e' | 'w') {
    const cycleConnectorType = (initialType: ConnectorType): ConnectorType => {
      if (initialType === 'out') { return 'in'; }
      if (initialType === 'in') { return null; }
      return initialType = 'out';
    } 

    switch(side) {
      case 'n': building.connector_n = cycleConnectorType(building.connector_n); break;
      case 's': building.connector_s = cycleConnectorType(building.connector_s); break;
      case 'e': building.connector_e = cycleConnectorType(building.connector_e); break;
      case 'w': building.connector_w = cycleConnectorType(building.connector_w); break;
      default: return console.error('Unknown connector side ' + side);
    }

    this.setState({
      buildings: [...this.state.buildings]
    });
  }

  render() {
    return (
      <div>
        <div className="buildings">
          {this.state.buildings.map(building => (
            <div className={`building ${building.type} ${(building.cooldown ? 'cooldown' : '')}`} style={{ left: building.x * GRID_SIZE, top: building.y * GRID_SIZE }}>
              <button onMouseOver={() => isCraftingStation(building) && this.setState({craftingModal: building})}>
                {React.createElement(building.svg)}
              </button>
              
              {isCraftingStation(building) && (
              <div>
                <button onClick={() => this.toggleConnector(building, 'n')} className={'connector north ' + (building.connector_n || '')}>
                  <Connector className="connector-line"></Connector>
                  <ConnectorArrow className="connector-arrow"></ConnectorArrow>
                </button>

                <button onClick={() => this.toggleConnector(building, 'e')}  className={'connector east ' + (building.connector_e || '')}>
                  <Connector className="connector-line"></Connector>
                  <ConnectorArrow className="connector-arrow"></ConnectorArrow>
                </button>

                <button onClick={() => this.toggleConnector(building, 'w')}  className={'connector west ' + (building.connector_w || '')}>
                  <Connector className="connector-line"></Connector>
                  <ConnectorArrow className="connector-arrow"></ConnectorArrow>
                </button>

                <button onClick={() => this.toggleConnector(building, 's')}  className={'connector south ' + (building.connector_s || '')}>
                  <Connector className="connector-line"></Connector>
                  <ConnectorArrow className="connector-arrow"></ConnectorArrow>
                </button>
              </div>)}
            </div>
          ))}
          {this.state.ghostBuilding && (<div className="ghost building" style={{ left: this.state.ghostBuilding.x * GRID_SIZE, top: this.state.ghostBuilding.y * GRID_SIZE }}>{React.createElement(this.state.ghostBuilding.svg)}</div>)}
        </div>

        <div className="items">
          {this.state.items.map(item => (
            <div className="item" style={{ left: item.x * GRID_SIZE, top: item.y * GRID_SIZE }}>{React.createElement(item.svg)}</div>
          ))}
        </div>

        <div className="units">
          {this.state.units.map(unit => (
            <div className="unit" style={{ left: unit.x * GRID_SIZE, top: unit.y * GRID_SIZE }}>
              {React.createElement(unit.svg)}
              {unit.held_item && (<div className="held-item">{React.createElement(unit.held_item.svg)}</div>)}
              <div className="health-bar">
                <div className="health-bar-fill" style={{width: `${Math.round((unit.health / MAX_HEALTH) * 100)}%`}}></div>
              </div>
              <div className="food-bar">
                <div className="food-bar-fill" style={{height: `${Math.round((unit.food / MAX_FOOD) * 100)}%`}}></div>
              </div>
            </div>
          ))}
        </div>

        <div className="build-ui">
          <strong>Build:</strong>
          { BUILDINGS_CONFIG.map(building => (<button onClick={(event) => this.setBuildMode(building.id, event)}>{React.createElement(building.svg)}</button>))}
          <button onClick={this.restart.bind(this)}>Restart</button>
          <button onClick={this.clear.bind(this)}>Clear</button>
        </div>

        { this.state.craftingModal && <CraftingModal
            building={this.state.craftingModal}
            config={BUILDINGS_CONFIG.find(config => config.id === this.state.craftingModal!.type)!}
            onClose={() => this.setState({craftingModal: null})}
            onSelectRecipe={(recipe: CraftingRecipe) => { 
              this.state.craftingModal!.selectedRecipe = recipe;
              this.setState({buildings: [...this.state.buildings]});
            }}
        />}
      </div>
    );
  }

  constructor(props: any) {
    super(props);
    this.state = {
      buildings: [],
      units: [],
      items: [],

      ghostBuilding: null,
      craftingModal: null,
    }
  }
}
