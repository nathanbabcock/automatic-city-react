import React from 'react';
import { ReactComponent as House } from './svg/house.svg';
import { ReactComponent as RoadEnd } from './svg/road_end.svg';
import './App.scss';

const GRID_SIZE = 64;

type BuildingConfig = {
  id: string,
  name: string,
  svg: React.FunctionComponent,
}

const BUILDINGS_CONFIG: BuildingConfig[] = [
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

class Building {
  x: number;
  y: number;
  type: string;
  svg: React.FunctionComponent;

  constructor(x: number, y: number, type: string){
    this.x = x;
    this.y = y;
    this.type = type;
    this.svg = BUILDINGS_CONFIG.find(config => config.id === type)!.svg;
  }
}

const toGrid = ({x, y}: {x: number, y: number}) => ({
  x: Math.ceil(x / GRID_SIZE) - 1,
  y: Math.ceil(y / GRID_SIZE) - 1,
});

// const renderBuilding = (building: Building, additionalProps = []) => {
//   const config = BUILDINGS_CONFIG.find(config => config.id === building.type);
//   if (!config) {
//     console.error(`Could not find config for building type ${building.type}`);
//     return;
//   }
//   const TagName = config.svg;

//   return (<div className="building" style={{ left: building.x * GRID_SIZE, top: building.y * GRID_SIZE }}><TagName/></div>);
// }

export default class App extends React.Component<{}, { ghostBuilding: Building | null, buildings: Building[]}> {
  currentbuildMode: string | null = null;
  test: string = 'hello';

  onClick(event: MouseEvent) {
    if (!this.state.ghostBuilding) { return; }
    this.currentbuildMode = null;
    this.setState({
      buildings: [...this.state.buildings, this.state.ghostBuilding],
      ghostBuilding: null,
    });
  }

  onMousemove(event: MouseEvent) {
    if (this.currentbuildMode === undefined) { return; }
    if (!this.state.ghostBuilding) { return; }
    const gridCoords = toGrid({ x: event.clientX, y: event.clientY });
    this.setState({ ghostBuilding: { ...this.state.ghostBuilding, ...gridCoords} });
  }

  componentDidMount() {
    window.addEventListener('mousemove', this.onMousemove.bind(this));
    window.addEventListener('click', this.onClick.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.onMousemove.bind(this));
    window.removeEventListener('click', this.onMousemove.bind(this));
  }

  setBuildMode(buildingType: string, event: React.MouseEvent) {
    // Toggle build mode back off
    if (this.currentbuildMode !== null) {
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
    }
  }
}
