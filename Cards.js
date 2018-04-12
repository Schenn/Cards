import {CardComponent} from './components/cards/CardComponent.js';

// Default Components used by Cards.

import {standardComponents} from "./components/standard.js";

import {registerParts} from './parts/registerParts.js';

import {CustomElementCreator} from './Systems/CustomElementCreator.js';

let components = {};

export class Cards {

  /**
   * Create a new instance of the Cards App
   *
   * @param rootNode HTMLElement The element to limit the Cards App to
   * @param elementRegistry CustomElementRegistry The window Custom Element Registry to use.
   *      Note - I haven't tried this yet in an iframe, but I imagine that the custom elements are not shared with their parent frame,
   *        but may be shared downward from their parent frame.
   *
   * @param components array of components to use. If none are provided, the default collection is used instead.
   *
   * @todo Remove the RootNode param.  Not needed anymore as HTML is what controls the creation of Cards and Components, not appending to a root node.
   */
  constructor(rootNode, elementRegistry, components = []){
    let compsToRegister = (components.length === 0) ?
        standardComponents :
        components;

    this.elementRegistry = elementRegistry;

    // Register the Default Parts
    registerParts(this.elementRegistry);

    // Register the default or any provided components.
    compsToRegister.forEach((comp)=>{
      this.registerComponent(comp, this.elementRegistry);
    });

    this.root = rootNode;
  }

  /**
   * Register a specific Component
   *
   * @param {Component} module
   */
  registerComponent(module){
    // If the component is a CardComponent
    console.log("Registering Components as Custom Elements.");

    if(module.prototype instanceof CardComponent) {
      // Cache a reference to the module
      components[module.name] = module;
      // Create a Custom Element which uses the associated module to customize itself.
      CustomElementCreator(module, this.elementRegistry);
    } else {
      console.log("Module was not card component.");
      // Do something else with non-card components
      // @todo Come up with some Non-Card Components?
    }

  }

  /**
   * Register a collection of Components
   * @param {Component[]} modules
   */
  registerComponents(modules=[]){
    for(let module in modules){
      this.registerComponent(module);
    }
  }

  /**
   * Register a Card Custom Element
   *
   * @param {Card} card
   */
  registerCard(card) {
    this.elementRegistry.define(card.tag, card);
  }

  /**
   * Register a collection of Cards
   *
   * @param {Card[]} cards
   */
  registerCards(cards=[]){
    for(let card in cards){
      this.registerCard(card);
    }
  }

}