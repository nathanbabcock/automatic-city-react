import { ReactComponent as House } from './svg/house.svg';
import './App.scss';
import React from 'react';

export default class App extends React.Component {
  currentbuildMode: string | null = null;

  setBuildMode(buildingType: string) {
    this.currentbuildMode = buildingType;
    console.log(this.currentbuildMode);
  }

  render() {
    return (
      <div className="build-ui">
        <strong>Build</strong>
        <button onClick={() => this.setBuildMode('house')}><House/></button>
      </div>
    );
  }
}
