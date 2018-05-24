/**
 * Defines a custom element which can be created in html from a Component module.
 *
 * A CustomElement's attributes match a provided Card Component
 * A CustomElement's tag comes from the Card Component "tag" property
 *
 * Component instance properties are effectively observed through the proxy.
 *
 * When you ask the CustomElement for it's corresponding Component, you actually get back a proxy to the component.
 *  When an observed property on the Component Proxy is updated, than the element re-renders.
 *
 */

import {Card} from '../cards/Card.js';

let idCounter = 0;

export const ObservedElement = function(component){

  let observables = component.observableProperties;

  const componentProxy = function(customElement){
    let comp = new component(this);
    return {
      proxy: new Proxy(comp, {
        set: (comp, prop, value) => {
          // Don't infinite loop through setters.
          if (comp.hasOwnProperty(prop) && comp[prop] !== value) {
            comp[prop] = value;
            if (observables.contains(prop)) {
              customElement.setAttribute(prop, value);
            }
          }
        }
      }),
      component: comp
    };
  };

  class CustomElement extends HTMLElement {

    /**
     * Get the list of Observable Attributes for the Component.
     * @return {string[]|array}
     */
    static get observedAttributes() {
      return observables;
    }

    constructor(){
      super();
      this.__id = idCounter++;
      let compSymbol = Symbol(component.constructor.name + this.__id);
      let partsCache = Symbol(component.constructor.name + 'parts' + this.__id);
      this[compSymbol] = componentProxy(this);
      // Attach our shadow root and set the initial default slots.
      this[partsCache] = null;
      this.attachShadow({mode: 'open'});
      this.shadowRoot.innerHTML = `
            <slot name="content"></slot>
            <slot name="parts"></slot>
      `;
    }

    get component(){
      let compSymbol = Symbol.for(component.constructor.name + this.__id);
      return this[compSymbol].proxy;
    }



    /**
     * When a component's custom element's attribute is changed
     *    Determine if it's an observed attribute and if so, set the value on the element's matching component.
     *
     * @param {string} name
     * @param {*} old
     * @param {*} current
     */
    attributeChangedCallback(name, old, current){
      let compSymbol = Symbol.for(component.constructor.name + this.__id);
      if(observables.contains(name) && this[compSymbol].component[name] !== current) {
        // Sets the change on the actual component itself, not the proxy. This prevents change callback loops.
        this[compSymbol].component[name] = current;
        this.render();
      }
    }

    /**
     * Triggered when this component's custom element is added to the DOM.
     *
     * Dispatches a Component Added event for the parent Card to pick up and do something with if needed.
     */
    connectedCallback(){
      this.children[0].setAttribute("slot", "parts");
      let partsCache = Symbol.for(component.constructor.name + 'parts' + this.__id);
      this[partsCache] = this.children;
      this.render();
      let connectedEvent = new CustomEvent("ComponentAdded", {
        detail: {
          component: this.component,
          __id: this.__id
        }
      });
      this.parentNode.dispatchEvent(connectedEvent);
      let found = false;
      let parent = this.parentNode;
      while(!found ){
        // Don't go any further if we've somehow managed this. Stop the loop, the parent card is missing.
        if(parent.nodeName === "body"){
          break;
        }
        // If the current node we're looking at is an instance of the "Card" class
        if(parent instanceof Card){
          found = true;
        } else {
          parent = parent.parentNode;
        }
      }
      this.component.onReady();

    }

    render(){
      this.innerHTML = this.component.template;
      this.children[0].setAttribute("slot", "content");
      let partsCache = Symbol.for(component.constructor.name + 'parts' + this.__id);
      this.append(this[partsCache]);
    }

    /**
     * Triggered when this component's custom element is removed from the DOM
     *
     * Dispatches a Component Removed event for the parent card to pick up and do something with if needed.
     */
    disconnectedCallback(){
      let removedEvent = new CustomEvent("ComponentRemoved", {
        detail: {
          component: this.getComponent(),
          __id: this.__id
        }
      });
      this.parentNode.dispatchEvent(removedEvent);
      this.component.onRemoved();
    }
  }

  return CustomElement;
};

