import React from 'react';
import { GRID_SIZE, Building, BUILDINGS_CONFIG, Unit, TICK_RATE, Item } from './model';
import './App.scss';

const randInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1) + min);

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

export default class App extends React.Component<{}, { ghostBuilding: Building | null, buildings: Building[], units: Unit[], items: Item[]}> {
  currentbuildMode: string | null = null;

  onClick(event: MouseEvent) {
    const ghost = this.state.ghostBuilding;
    if (!ghost) { return; }
    
    if (!this.state.buildings.find(building => building.x === ghost.x && building.y === ghost.y)) {
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
          const destination = spawn_squares[0];
          this.setState({units: [...this.state.units, new Unit(destination.x, destination.y, 'pawn')]});
          house.cooldown = 999999;
        }
      });

    this.state.units
      .filter(unit => unit.type === 'pawn')
      .forEach(pawn => {
        // Gather
        let interacted = false;
        const adjacent = getAdjacent(pawn.x, pawn.y);
        const resources = ['tree', 'rock']
        adjacent.forEach(tile => {
          if (interacted) { return; }
          const resource = this.state.buildings.find(building => building.x === tile.x && building.y === tile.y && resources.includes(building.type));
          if (!resource) { return; }
          if (resource.cooldown <= 0) {
            const itemSpawn = {x: pawn.x, y: pawn.y};
            const itemType = resource.type === 'tree' ? 'logs' : 'ore';
            resource.cooldown = 10;
            this.setState({
              items: [...this.state.items, new Item(itemSpawn.x, itemSpawn.y, itemType)],
            });
            interacted = true;
          }
        });
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
    return this.setState({
      items: [],
      units: [],
    });
  }

  getUnitSpawnSquares(x: number, y: number): {x: number, y: number}[] {
    const n = {x, y: y - 1};
    const s = {x, y: y - 1};
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

  render() {
    return (
      <div>
        <div className="buildings">
          {this.state.buildings.map(building => (
            <div className={`building ${building.cooldown && 'cooldown'}`} style={{ left: building.x * GRID_SIZE, top: building.y * GRID_SIZE }}>
              {React.createElement(building.svg)}
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
            <div className="unit" style={{ left: unit.x * GRID_SIZE, top: unit.y * GRID_SIZE }}>{React.createElement(unit.svg)}</div>
          ))}
        </div>
        <div className="build-ui">
          <strong>Build:</strong>
          { BUILDINGS_CONFIG.map(building => (<button onClick={(event) => this.setBuildMode(building.id, event)}>{React.createElement(building.svg)}</button>))}
          <button onClick={this.restart.bind(this)}>Restart</button>
          <button onClick={this.clear.bind(this)}>Clear</button>
        </div>
      </div>
    );
  }

  constructor(props: any) {
    super(props);
    this.state = {
      ghostBuilding: null,
      buildings: [],
      units: [],
      items: [],
    }
  }
}
