import {Part} from './Part.js';
import {Observation} from '../utilities/Observation.js';

/**
 * @todo Clean Up. Callbacks memoization here seems redundant.
 */

/**
 * Card Level Callbacks to trigger on component attribute change.
 * @type {{}}
 */
let callbacks = {};

/**
 * Property Observer monitors it's parent component's attributes for changes and when
 *  a matching change is detected, it triggers an appropriate callback on the Card which
 *  added the Property Observer to the component.
 *
 *  @todo Use a similar flow as the parentComponent query to get the card element to trigger effects on.
 */
export class PropertyObserver extends Part {

  /**
   * When connected to the DOM, start observing the parent component's attributes
   *  for the changes specified in the data-onchange attribute of this node.
   */
  connectedCallback(){
    let comp = this.parentComponent();
    if(!this.dataset.hasOwnProperty("onchange")){
      throw "Property Observer has no properties to observe?";
    }

    callbacks[this.__id] = {};
    let props = Object.keys(this.dataset.onchange);

    // If properties have been specified in the data-onchange attribute (propertyName: cardFunctionName)
    if(props.length > 0){
      let observation = new Observation();
      for(let prop of props){
        // On attribute Change, if there's a matching callback, trigger it.
        observation.onAttributeChange(prop, (val)=>{
          if(callbacks[this.__id].hasOwnProperty(prop)){
            callbacks[this.__id][prop](val);
          }
        });
      }

      observation.observe(comp);

    }
  }

  /**
   * Set the card to fire callbacks on.
   * Called from the Cards App after the card is created.
   *
   * @param card
   * @todo Now that Cards are custom-elements, use a similar flow as the parentComponent query to find the containing card to message about the change.
   */
  setCardCallbacks(card){
    let props = Object.keys(this.dataset.onChange);
    for(let prop of props){
      let cb = this.dataset[prop];
      if(cb.indexOf(".") > -1){
        // Callback function is a component message.
        let {compName, funcName} = cb.split(".");
        callbacks[this.__id] = card.getComponent(compName)[funcName];
      } else {
        // Callback function is a function on the card itself.
        callbacks[this.__id] = card[funcName];
      }
    }
  }

}