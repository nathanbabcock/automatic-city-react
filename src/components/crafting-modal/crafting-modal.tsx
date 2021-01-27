import React from 'react';
import { Building, BuildingConfig, getItemConfig, GRID_SIZE, Item, ItemStack, ITEMS_CONFIG } from '../../model';
import './crafting-modal.scss';

interface CraftingModalProps {
  building: Building,
  config: BuildingConfig,
  onClose?: Function,
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
    return <div
        className={`crafting-modal ${this.props.building.type}`}
        style={{left: this.props.building.x * GRID_SIZE, top: this.props.building.y * GRID_SIZE}}
        onMouseLeave={() => this.props.onClose && this.props.onClose()}
    >
      <div className="crafting-input">
        {Array.from(Array(this.props.config.inputSlots)).map((_, index) => {
          const isEmpty = this.props.building.input.length <= index || this.props.building.input[index].quantity === 0;
          return <div className={`input-slot ${isEmpty && 'empty'}`}>
            {this.props.building.selectedRecipe && React.createElement(getItemConfig(this.props.building.selectedRecipe.input).svg)}
            <span className="item-quantity">
              {isEmpty ? 0 : this.props.building.input[index].quantity}
            </span>
          </div>          
      })}
      </div>
      
      <div className="crafting-icon">
        {React.createElement(this.props.config.icon!)}
      </div>

      <div className="crafting-output">
      {Array.from(Array(this.props.config.outputSlots)).map((_, index) => {
          const isEmpty = this.props.building.output.length <= index || this.props.building.output[index].quantity === 0;
          return <div className={`output-slot ${isEmpty && 'empty'}`}>
            {this.props.building.selectedRecipe && React.createElement(getItemConfig(this.props.building.selectedRecipe.output).svg)}
            <span className="item-quantity">
              {isEmpty ? 0 : this.props.building.output[index].quantity}
            </span>
          </div>
        })}
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