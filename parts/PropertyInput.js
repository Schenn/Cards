import {_debounce} from '../utilities/_debounce.js';
import {Part} from './Part.js';

/**
 * @todo Cleanup
 * @todo Improve input generation to handle more types and attributes.
 */

/**
 * Get a callback which is prepared to update a component property from the input keyup event.
 *    The callback is debounced to reduce redundant updates.
 *
 * @param {string} property
 * @param {CardComponent} component
 * @param {*} defaultValue Must be a valid value for the input to use.
 * @returns {Function} The debounce reference.  Each event request refreshes the debounce timeout.
 */
const propChangeDebounce = function(property, component, defaultValue = ''){
  let cb = (e)=>{
    // If the incoming value is empty, use the default value instead.
    component[property] = e.target.value.trim() === '' ?
      defaultValue :
      e.target.value;
  };
  return _debounce(cb, 100);
};

/**
 * Optional Attributes for different input types.
 *
 *  Used to limit which attributes are copied from the PropertyInput instance and the child input element.
 *
 * @type {{number: [string,string,string], date: Array, textarea: [string,string], default: [string]}}
 */
const validAtts = {
  'number':["step", "max", "min"],
  'date': [],
  'textarea': ['rows', 'cols'],
  'default': ['length']
};

/**
 * Apply attributes to an input using the validAttributes constant as a guide.
 * @param input {HTMLElement}
 * @param attributes {NamedNodeMap}
 */
const applyAtts = function(input, attributes){
  const type = attributes.type.value;
  // Get the list of attributes which can be passed from the Property-Input element down to the actual input.
  const validAttributes = (validAtts.hasOwnProperty(type)) ?
      validAtts[type] :
      validAtts['default'];

  // Apply any attributes which are valid for the type of input being mutated.
  for(let att of attributes){
    if(validAttributes.includes(att)){
      input.setAttribute(att, attributes[att]);
    }
  }
};

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
 * @extends {Part}
 */
export class PropertyInput extends Part {
  /**
   * Only called when the element is appended to the dom.
   *
   * Builds the Input element and appends it to the PropertyInput element.
   */
  render(){
    // If the input type isn't an input element, use the right one.
    let input;
    if(this.attributes.type.value === "textarea") {
      input = document.createElement("textarea");
    } else {
      input = document.createElement("input");
      input.setAttribute("type", this.attributes.type.value);
    }

    // Apply valid attributes from this component onto the 'input' element.
    applyAtts(input, this.attributes);

    // The parentComponent is the dom node for the parent component's custom element.
    // @todo Use the custom element, not the custom elements associated component.
    const component = this.parentComponent().getComponent();
    const property = this.dataset.property;

    // Update the component property When the user releases a key from their keyboard while the input is focused.
    input.addEventListener("keyup", propChangeDebounce(property, component, this.attributes.defaultvalue.value));

    // Add the 'input' to the dom.
    this.appendChild(input);

  }
}