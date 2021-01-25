import React from 'react';
import { GRID_SIZE, Building, BUILDINGS_CONFIG, Unit, TICK_RATE } from './model';
import './App.scss';

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
}

const choose_random = (array: []) => array[Math.floor(Math.random() * array.length)];

export default class App extends React.Component<{}, { ghostBuilding: Building | null, buildings: Building[], units: Unit[]}> {
  currentbuildMode: string | null = null;

  onClick(event: MouseEvent) {
    const ghost = this.state.ghostBuilding;
    if (!ghost) { return; }
    
    if (!this.state.buildings.find(building => building.x === ghost.x && building.y === ghost.y)) {
      this.setState({ buildings: [...this.state.buildings, ghost] });
    }

    // this.setState({ ghostBuilding: null });
    // this.currentbuildMode = null;
  }

  onMousemove(event: MouseEvent) {
    if (this.currentbuildMode === undefined) { return; }
    if (!this.state.ghostBuilding) { return; }
    const gridCoords = toGrid({ x: event.clientX, y: event.clientY });
    this.setState({ ghostBuilding: { ...this.state.ghostBuilding, ...gridCoords} });
  }

  onTick(){
    this.state.buildings
      .filter(building => building.type === 'house')
      .forEach(house => {
        // Cooldown
        house.cooldown--;

        // Spawn
        if (house.cooldown <= 0 && !this.state.units.find(unit => unit.x === house.x && unit.y === house.y)) {
          const spawn_squares = this.getUnitSpawnSquares(house.x, house.y);
          if (spawn_squares.length === 0) { return; }
          // const destination = choose_random(spawn_squares);
          const destination = spawn_squares[0];
          this.setState({units: [...this.state.units, new Unit(destination.x, destination.y, 'pawn')]});
          house.cooldown += 5;
        }
      });

    this.state.units
      .filter(building => building.type === 'pawn')
      .forEach(pawn => {
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
    window.setInterval(this.onTick.bind(this), Math.round(1000 / TICK_RATE))
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
          {this.state.buildings.map(building => (<div className="building" style={{ left: building.x * GRID_SIZE, top: building.y * GRID_SIZE }}>{React.createElement(building.svg)}</div>))}
          {this.state.ghostBuilding && (<div className="ghost building" style={{ left: this.state.ghostBuilding.x * GRID_SIZE, top: this.state.ghostBuilding.y * GRID_SIZE }}>{React.createElement(this.state.ghostBuilding.svg)}</div>)}
        </div>
        <div className="units">
          {this.state.units.map(unit => (
            <div className="unit" style={{ left: unit.x * GRID_SIZE, top: unit.y * GRID_SIZE }}>{React.createElement(unit.svg)}</div>
          ))}
        </div>
        <div className="build-ui">
          <strong>Build:</strong>
          { BUILDINGS_CONFIG.map(building => (<button onClick={(event) => this.setBuildMode(building.id, event)}>{React.createElement(building.svg)}</button>))}
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
    }
  }
}
