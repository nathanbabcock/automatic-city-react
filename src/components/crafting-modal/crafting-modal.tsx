import React from 'react';
import { Building, BuildingConfig, CraftingRecipe, getItemConfig, GRID_SIZE, Item, ItemStack, ITEMS_CONFIG } from '../../model';
import './crafting-modal.scss';

interface CraftingModalProps {
  building: Building,
  config: BuildingConfig,
  onClose?: Function,
  onSelectRecipe?: (recipe: CraftingRecipe) => any,
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

      <div className={`crafting-output ${this.state.outputSelectorOpen && 'selector-open'}`}>
      {!this.state.outputSelectorOpen && Array.from(Array(this.props.config.outputSlots)).map((_, index) => {
          const isEmpty = this.props.building.output.length <= index || this.props.building.output[index].quantity === 0;
          return <button className={`output-slot ${isEmpty && 'empty'}`} onClick={() => this.setState({outputSelectorOpen: true})}>
            {this.props.building.selectedRecipe && React.createElement(getItemConfig(this.props.building.selectedRecipe.output).svg)}
            <span className="item-quantity">
              {isEmpty ? 0 : this.props.building.output[index].quantity}
            </span>
          </button>
        })}
        { this.state.outputSelectorOpen && this.props.building.config.craftingRecipes?.map(recipe => {
          return <button className="output-slot selector-option" onClick={() => this.selectRecipe(recipe)}>
            {React.createElement(getItemConfig(recipe.output).svg)}
          </button>
        })}
      </div>
    </div>;
  }

  selectRecipe(recipe: CraftingRecipe): void {
    this.props.onSelectRecipe && this.props.onSelectRecipe(recipe);
    this.setState({outputSelectorOpen: false});
  }

  constructor(props: any) {
    super(props);
    this.state = {
      outputSelectorOpen: false
    }
  }
}