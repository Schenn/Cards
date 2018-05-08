import {_debounce} from '../utilities/_debounce.js';
import {Part} from './Part.js';
import {Observation} from '../utilities/Observation.js';

/**
 * How long to delay the debouncer.
 *
 * @return {number}
 */
let delay = 100;

/**
 * PropertyInput Class
 *
 * Creates an input(ish) element for the assigned component property.
 * When the input's value is updated (on key up), the propChangeDebounce method is called.
 * When the user stops updating the input value for the predefined amount of time,
 *    than the actual component property is updated.
 *
 * The Component used is the first reachable card-component parent of the PropertyInput.
 *
 * To listen to change events, add a Property-Observer to the component.
 * As the changes from this input are either causing or responding to the change of a component's property,
 *    it would be redundant to use change events here.
 *
 * @extends {Part}
 */
export class PropertyInput extends Part {

  get value(){
    return this.input.value;
  }

  constructor(){
    super();
    this.input = undefined;
  }

  /**
   * Create an input and copy over relevant attributes
   * @return {Element}
   */
  createInput(){
    let input = document.createElement("input");
    input.setAttribute("type", "text");
    this.appendChild(input);
    return input;
  }

  findInput(){
    let selector;
    /**
     * If there's an input attribute, use it's value as a selector on this elements children to find the input.
     */
    if(this.attributes.input){
      selector = this.getAttribute("input");
    } else {
      /**
       * No target input provided, look for one.
       */
      selector = "input, textarea";
    }

    let nodes = this.querySelectorAll(selector);
    if(nodes.length === 0){
      throw "No input elements found in property input's HTML";
    }

    if(nodes.length > 1){
      throw "Too many input element's found in property input's HTML. Use input attribute to provide a selector to use.";
    }

    return nodes[0];
  }

  /**
   * Get a callback which is prepared to update a component property from the input keyup event.
   *    The callback is debounced to reduce redundant updates.
   *
   * @returns {Function} The debounce reference.  Each event request refreshes the debounce timeout.
   */
  propChangeDebounce(){
    let component = this.parentComponent();
    let property = this.getAttribute("property");
    let cb = (e)=>{
      // If the incoming value is empty, use the default value instead.
      component.setAttribute(property, e.target.value);
    };
    return _debounce(cb, delay);
  }

  /**
   * Only called when the element is appended to the dom.
   *
   * Associates a callback to an input,
   *  either one created by this element or one provided by the innerhtml of this element,
   *  which updates a property on a component with the new provided value.
   *
   *  There *must* be an input (or textarea) provided if there's inner content.
   */
  render(){
    let input = (this.innerHTML.trim() === '') ?
        this.createInput() :
        this.findInput();

    // The parentComponent is the dom node for the parent component's custom element.
    const component = this.parentComponent();
    const property = this.getAttribute("property");


    // Update the component property When the user releases a key from their keyboard while the input is focused.
    input.addEventListener("keyup", this.propChangeDebounce());

    // Apply the onchange event handler to capture when the value has changed through other means.
    input.addEventListener("change", this.propChangeDebounce());

    input.value = component.getAttribute(property);

    // Watch the parent component element's property/attributes so that if it change's by an external force, the input updates its value.
    let observation = new Observation();
    observation.onAttributeChange(property, (val)=>{
      if(val !== input.value){
        input.value = val;
      }
    });
    observation.observe(component);

    this.input = input;

  }
}