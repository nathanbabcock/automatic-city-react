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
        {this.props.building.selectedRecipe!.input.map(recipeStack => {
          const inputStack = this.props.building.input.find(input => input.type === recipeStack.type);
          const isEmpty = !inputStack || inputStack.quantity === 0;
          return <div className={`input-slot ${isEmpty && 'empty'}`}>
            {React.createElement(getItemConfig(recipeStack.type).svg)}
            <span className="item-quantity">{isEmpty ? 0 : inputStack!.quantity}</span>
          </div>
        })}
      </div>
      
      <div className="crafting-icon">
        {React.createElement(this.props.config.icon!)}
      </div>

      <div className={`crafting-output ${this.state.outputSelectorOpen && 'selector-open'}`}>
        {!this.state.outputSelectorOpen && this.props.building.selectedRecipe!.output.map(recipeStack => {
          const outputStack = this.props.building.output.find(output => output.type === recipeStack.type);
          const isEmpty = !outputStack || outputStack.quantity === 0;
          return <button className={`output-slot ${isEmpty && 'empty'}`} onClick={() => this.props.config.craftingRecipes!.length > 1 && this.setState({outputSelectorOpen: true})}>
            {React.createElement(getItemConfig(recipeStack.type).svg)}
            <span className="item-quantity">{isEmpty ? 0 : outputStack!.quantity}</span>
          </button>
        })}
        {this.state.outputSelectorOpen && this.props.building.config.craftingRecipes?.map(recipe => {
          return <button className="output-slot selector-option" onClick={() => this.selectRecipe(recipe)}>
            {React.createElement(getItemConfig(recipe.output[0].type).svg)/* multi-output breaks here */}
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