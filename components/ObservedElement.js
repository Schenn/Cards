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
import {ComponentAddedEvent} from '../events/ComponentAddedEvent.js';
import {ComponentRemovedEvent} from '../events/ComponentRemovedEvent.js';

let idCounter = 0;

export const ObservedElement = function(component){

  let observables = component.observableProperties;

  const componentProxy = function(customElement){
    let comp = new component(customElement);
    return {
      proxy: new Proxy(comp, {
        set: (comp, prop, value) => {
          // Don't infinite loop through setters.
          if (comp.hasOwnProperty(prop) && comp[prop] !== value) {
            comp[prop] = value;
            if (observables.includes(prop)) {
              customElement.setAttribute(prop, value);
            }
          }
          return true;
        }
      }),
      component: comp
    };
  };

  class CustomElement extends HTMLElement {

    /**
     * Get the list of Observable Attributes for the Component.
     * @return {string[]}
     */
    static get observedAttributes() {
      return observables;
    }

    constructor(){
      super();
      this._ = Symbol(component.name + idCounter++);
      this.__ = Symbol(component.name + 'content' + idCounter);
      // Component and Proxy Property
      this[this._] = componentProxy(this);

      this[this.__] = document.createElement("component-content");

      // Attach our shadow root and set the initial default slots.
      // Parts Cache Private Property
      this.attachShadow({mode: 'open'});
      this.shadowRoot.innerHTML = `
            <slot name="content"></slot>
            <slot name="parts"></slot>
      `;
    }

    get component(){
      return this[this._].proxy;
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
      if(observables.includes(name) && this[this._].component[name] !== current) {
        // Sets the change on the actual component itself, not the proxy. This prevents change callback loops.
        this[this._].component[name] = current;
        this.render();
      }
    }

    findCard(){
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
      if(found){
        this.card = parent;
      }
    }

    /**
     * Triggered when this component's custom element is added to the DOM.
     *
     * Dispatches a Component Added event for the parent Card to pick up and do something with if needed.
     *
     * @todo: Check for default values and apply as appropriate.
     */
    connectedCallback(){

      let parts = document.createElement("component-parts");

      parts.innerHTML = this.innerHTML;
      this[this.__].innerHTML = this.component.template;

      this.innerHTML = '';
      this.append(this[this.__]);
      this.append(parts);
      this.render();
      this.parentNode.dispatchEvent(new ComponentAddedEvent(this.component));
      this.findCard();
      this.component.onReady();

    }

    render(){
      this[this.__].innerHTML = this.component.template;
    }

    /**
     * Triggered when this component's custom element is removed from the DOM
     *
     * Dispatches a Component Removed event for the parent card to pick up and do something with if needed.
     */
    disconnectedCallback(){
      this.parentNode.dispatchEvent(new ComponentRemovedEvent(this.component));
      this.component.onRemoved();
    }

    /**
     * Set the visibility attribute to visible.
     *
     * Uses the visibility attribute instead of style to avoid style clashes and
     *  reduce potential conflicts with other scripts that adjust the style of the element at the same time.
     */
    show(){
      this.setAttribute("visibility", "visible");
    }

    /**
     * Set the visibility attribute to hidden. - Still affects layout but does not render.
     *
     * Uses the visibility attribute instead of style to avoid style clashes and
     *  reduce potential conflicts with other scripts that adjust the style of the element at the same time.
     */
    hide(){
      this.setAttribute("visibility", "hidden");
    }
  }

  return CustomElement;
};

