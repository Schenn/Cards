import {Component} from './components/Component.js';
import {partsList} from './parts/partsList.js';
import {ObservedElement} from './Systems/ObservedElement.js';

let components = {};

export class Cards {

  /**
   * Create a new instance of the Cards App
   *
   * @param elementRegistry CustomElementRegistry The window Custom Element Registry to use.
   *      Note - I haven't tried this yet in an iframe, but I imagine that the custom elements are not shared with their parent frame,
   *        but may be shared downward from their parent frame.
   *
   * @param compsToRegister array of components to use.
   *
   */
  constructor(elementRegistry, compsToRegister = []){

    this.elementRegistry = elementRegistry;

    // Register the Default Parts
    this.registerParts(partsList);

    // Register the default or any provided components.
    compsToRegister.forEach((comp)=>{
      this.registerComponent(comp, this.elementRegistry);
    });
  }

  /**
   * Register a specific Component
   *
   * @param {Component} module
   */
  registerComponent(module){
    console.log("Registering Components as Custom Elements.");

    if(module.prototype instanceof Component) {
      // Cache a reference to the module
      components[module.name] = module;
      // Create a Custom Element which uses the associated module to customize itself.
      this.elementRegistry.define(module.tag, ObservedElement(module));
    } else {
      console.log("Module was not card component.");
      console.log(module);
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
    for(let card of cards){
      this.registerCard(card);
    }
  }

  registerParts(parts = []){
    for(let part of parts){
      this.elementRegistry.define(part.tag, part);
    }
  }

}