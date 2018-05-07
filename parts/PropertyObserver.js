import {Part} from './Part.js';
import {Observation} from '../utilities/Observation.js';

/**
 * Memoize the callbacks to prevent observers from having their scripts changed after their first creation.
 * @type {WeakMap}
 */
let callbacks = new WeakMap();

let unique = 0;

/**
 * Property Observer monitors it's parent component's attributes for changes and when
 *  a matching change is detected, it triggers an appropriate callback on the Card which
 *  added the Property Observer to the component.
 *
 * @todo Is there any way to identify the inner text of this element as js for IDEs?
 *      Or, should we use a script tag as a child and grab the text from that?
 *      Maybe once custom-elements are more fully implemented, we can extend the script tag.
 *      For now, one can only create new elements, not extend existing classical elements.
 */
export class PropertyObserver extends Part {

  constructor(){
    super();
    this.__unique = unique++;
  }

  /**
   * When connected to the DOM, start observing the parent component's attributes
   *  for the changes specified in the data-onchange attribute of this node.
   *
   *  Callback is bound to the context of the containing card (as that's where the callbacks should be)
   *  New Property Value is passed into the callback function under the "value" argument.
   *  Component is passed as the "component" argument. (So that the changed component is identifiable)
   *
   *  Best Use Case is to identify a card function to trigger when a property is changed,
   *      not writing out complex functionality inside the element.
   */
  connectedCallback(){
    if(typeof callbacks[this.__unique] === "undefined"){
      // Get the script from the inner text of this element.
      let script = this.innerText;
      // Get the inner text of this node, convert it to a function and erase the innertext value.
      // While not a great practice, the benefit to doing Function like this instead of "eval"
      //  is the ability to control the context and scope of the function script.
      callbacks[this.__unique] = Function("value", "component", script);
      // Clear the innertext as it shouldn't render.
      this.innerText = '';
    }

    let comp = this.parentComponent();
    let card = comp.card;
    // REQUIRED
    let property = this.attributes.property.value;
    let cb = callbacks[this.__unique].bind(card);
    // Trigger the callback on attribute change.
    let observation = new Observation();
    observation.onAttributeChange(property, (val)=>{
      // Bind the callback function to the parent card before calling.
      cb(val, comp);
    });
    observation.observe(comp);
  }
}