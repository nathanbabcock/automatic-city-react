import React from 'react';
import { Building, BuildingConfig, getItemConfig, GRID_SIZE, Item, ItemStack, ITEMS_CONFIG } from '../../model';
import './crafting-modal.scss';

interface CraftingModalProps {
  building: Building,
  config: BuildingConfig,
}

interface CraftingModalState {
  outputSelectorOpen: boolean,
}

export class CraftingModal extends React.Component<CraftingModalProps, CraftingModalState> {
  /** Convert an array of individual items to grouped stacks for display */
  count(items: Item[]) {
    let counted: ItemStack[] = [];
    items.forEach(item => {
      let existingStack = counted.find(x => x.type === item.type);
      if (existingStack) { existingStack.quantity++; }
      else { counted.push({type: item.type, quantity: 1, config: ITEMS_CONFIG.find(config => config.id === item.type)}); }
    });
    console.log('count');
    return  counted;
  }

  render(): JSX.Element {
    return <div className={`crafting-modal ${this.props.building.type}`} style={{left: this.props.building.x * GRID_SIZE, top: this.props.building.y * GRID_SIZE}}>
      <div className="crafting-input">
        {Array.from(Array(this.props.config.inputSlots)).map((_, index) => (
          <div className="input-slot">
            {this.props.building.input.length > index && React.createElement(getItemConfig(this.props.building.input[index].type).svg)}
            {this.props.building.input.length > index && <span className="item-quantity">
              {this.props.building.input[index].quantity}
            </span>}
          </div>          
        ))}
      </div>
      
      <div className="crafting-icon">
        {React.createElement(this.props.config.icon!)}
      </div>

      <div className="crafting-output">
      {Array.from(Array(this.props.config.outputSlots)).map((_, index) => (
          <div className="output-slot">
            {this.props.building.output.length > index && React.createElement(getItemConfig(this.props.building.output[index].type).svg)}
            {this.props.building.output.length > index && <span className="item-quantity">
              {this.props.building.output[index].quantity}
            </span>}
          </div>
        ))}
      </div>
    </div>;
  }

  constructor(props: any) {
    super(props);
    this.state = {
      outputSelectorOpen: false
    }
  }
}