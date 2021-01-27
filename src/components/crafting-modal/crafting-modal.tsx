import React from 'react';
import { Building, BuildingConfig, BUILDINGS_CONFIG, GRID_SIZE, Item, ItemStack, ITEMS_CONFIG } from '../../model';
import './crafting-modal.scss';

interface CraftingModalProps {
  building: Building,
}

interface CraftingModalState {
  outputSelectorOpen: boolean,
  countedInput?: ItemStack[];
  countedOutput?: ItemStack[];
  config?: BuildingConfig;
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

  componentDidMount() {
    this.setState({
      countedInput: this.count(this.props.building.input),
      countedOutput: this.count(this.props.building.output),
      config: BUILDINGS_CONFIG.find(config => config.id === this.props.building.type),
    });
  }

  render(): JSX.Element {
    return <div className={`crafting-modal ${this.props.building.type}`} style={{left: this.props.building.x * GRID_SIZE, top: this.props.building.y * GRID_SIZE}}>
      <div className="crafting-input">
        {Array.from(Array(this.state.config?.inputSlots)).map((_, index) => (
          <div className="input-slot">
            {this.state.countedInput && this.state.countedInput.length > index && React.createElement(this.state.countedInput![index].config!.svg)}
            {this.state.countedInput && this.state.countedInput.length > index && <span className="item-quantity">
              {this.state.countedInput[index].quantity}
            </span>}
          </div>          
        ))}
      </div>
      
      <div className="crafting-icon">
        {this.state.config && this.state.config.icon && React.createElement(this.state.config.icon)}
      </div>

      <div className="crafting-output">
      {Array.from(Array(this.state.config?.outputSlots)).map((_, index) => (
          <div className="output-slot">
            {this.state.countedOutput && this.state.countedOutput.length > index && React.createElement(this.state.countedOutput[index].config!.svg)}
            {this.state.countedOutput && this.state.countedOutput.length > index && <span className="item-quantity">
              {this.state.countedOutput[index].quantity}
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