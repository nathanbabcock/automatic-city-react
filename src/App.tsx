import React from 'react';
import { GRID_SIZE, Building, BUILDINGS_CONFIG, Unit, TICK_RATE } from './model';
import './App.scss';

const toGrid = ({x, y}: {x: number, y: number}) => ({
  x: Math.ceil(x / GRID_SIZE) - 1,
  y: Math.ceil(y / GRID_SIZE) - 1,
});

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
          this.setState({units: [...this.state.units, new Unit(house.x, house.y, 'pawn')]});
          house.cooldown += 5;
        }
      });

    this.state.units
      .filter(building => building.type === 'pawn')
      .forEach(pawn => {
          const destination = {x: pawn.x + 1, y: pawn.y};
          const destinationRoad = this.state.buildings.find(building => building.type === 'road' && building.x === destination.x && building.y === destination.y);
          const occupyingUnit = destinationRoad && this.state.units.find(unit => unit.x === destinationRoad.x && unit.y === destinationRoad.y)
          if (destinationRoad && !occupyingUnit) {
            pawn.x = destination.x;
            pawn.y = destination.y;
            this.setState({units: [...this.state.units]});
          }
      });
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
          {this.state.units.map(unit => (<div className="unit" style={{ left: unit.x * GRID_SIZE, top: unit.y * GRID_SIZE }}>{React.createElement(unit.svg)}</div>))}
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
