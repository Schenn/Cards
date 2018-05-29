import {Component} from './components/Component.js';
import {partsList} from './parts/partsList.js';
import {ObservedElement} from './components/ObservedElement.js';

class ComponentContent extends HTMLElement{
  connectedCallback(){
    this.setAttribute("slot", "content");
  }
}

class ComponentParts extends HTMLElement{
  connectedCallback(){
    this.setAttribute("slot", "parts");
  }
}

export class Cards {

  /**
   * Create a new instance of the Cards App
   * @param {Component[]} compsToRegister array of components to use.*
   * @param {Card[]} cardsToRegister Array of cards to use.
   *
   * @param elementRegistry CustomElementRegistry A custom element registry such as window.customElements or a wrapper thereof.
   *      Note - I haven't tried this yet in an iframe, but I imagine that the custom elements are not shared with their parent frame,
   *        but may be shared downward from their parent frame.
   *
   */
  constructor(compsToRegister = [], cardsToRegister = [], elementRegistry = null){

    this.elementRegistry = elementRegistry ? elementRegistry : window.customElements;

    // Register the Default Parts
    if(!this.elementRegistry.get("component-content")){
      this.elementRegistry.define("component-content", ComponentContent);
      this.elementRegistry.define("component-parts", ComponentParts);
    }


    this.registerParts(partsList);
    this.registerComponents(compsToRegister);
    this.registerCards(cardsToRegister);
  }

  /**
   * Register a specific Component
   *
   * @param {Component} module
   */
  registerComponent(module){
    console.log("Registering Components as Custom Elements.");

    if(module.prototype instanceof Component && !this.elementRegistry.get(module.tag)) {
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
    for(let module of modules){
      this.registerComponent(module);
    }
  }

  /**
   * Register a Card Custom Element
   *
   * @param {Card} card
   */
  registerCard(card) {
    if(!this.elementRegistry.get(card.tag)){
      this.elementRegistry.define(card.tag, card);
    }
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

  /**
   * Register a collection of parts.
   * @param parts
   */
  registerParts(parts = []){
    for(let part of parts){
      if(!this.elementRegistry.get(part.tag)) {
        this.elementRegistry.define(part.tag, part);
      }
    }
  }

}