import React from 'react';
import { ReactComponent as House } from './svg/house.svg';
import './App.scss';

const GRID_SIZE = 64;

class Building {
  x: number;
  y: number;
  type: string;

  constructor(x: number, y: number, type: string){
    this.x = x;
    this.y = y;
    this.type = type;
  }
}

const toGrid = ({x, y}: {x: number, y: number}) => ({
  x: Math.ceil(x / GRID_SIZE) - 1,
  y: Math.ceil(y / GRID_SIZE) - 1,
});

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
    console.log(event);
    console.log(gridCoords);
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
      this.setState({ghostBuilding: null})
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
          {this.state.buildings.map(elem => (<House className="building" style={{ left: elem.x * GRID_SIZE, top: elem.y * GRID_SIZE }}/>))}
          {this.state.ghostBuilding && (<House className="ghost building" style={{ left: this.state.ghostBuilding.x * GRID_SIZE, top: this.state.ghostBuilding.y * GRID_SIZE }}/>)}
        </div>
        <div className="build-ui">
          <strong>Build</strong>
          <button onClick={(event) => this.setBuildMode('house', event)}><House/></button>
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
