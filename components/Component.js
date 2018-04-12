/**
 * Unique ID
 * @type {number}
 */
let unique = 0;

/**
 * Lookup for the Custom Element associated with the given Component
 * @type {WeakMap}
 */
let ComponentMap = new WeakMap();

/**
 * Components are base tools which a Cards application may use.
 * The Component Class provides the abstract and virtual methods which child classes should implement.
 *
 * Components should be self-contained for internal functionality with public methods that can be invoked by any container.
 * True Components don't depend on other components.
 * Cards use components to provide functionality, then apply Parts to the components to trigger their own effects.
 *
 * But the Component stands alone.
 *
 * @abstract Component provides the promise that your code must adhere to in order to be used by the system.
 *
 * @todo Move the Custom Element / Rendering related functionality to CardComponent.  Generic Components should be more abstractable than that.
 */
export class Component {
  /**
   * @override This property MUST be overwritten
   * @return string The HTML tag to use.  Note - CustomElement Requires that custom html tags have at least 1 "-" symbol.
   * @throws if not implemented
   */
  static get tag(){
    throw "Property must be replaced by child class.";
  }

  /**
   * @override This property MUST be overwritten
   * @return array of properties which should trigger the component element to re-render when they change.
   * @throws if not implemented
   */
  static get observableProperties(){
    console.trace();
    throw "Property must be replaced by child class.";
  }

  /**
   * Give the instance access to the static getter.
   * @returns {array}
   */
  get observableProperties(){
    return this.constructor.observableProperties;
  }

  /**
   * @override Override this method to perform a task when the individual component is ready for use (after its first render).
   */
  onReady(){
    // Do Nothing. Descendant class should provide functionality here if any is required.
  }

  /**
   * @override Override this method to perform a task when the individual component has been removed from the dom.
   */
  onRemoved(){
    // Do Nothing. Descendant class should provide functionality here if any is required.
  }

  constructor(element){
    // Abstract Check
    ComponentMap[this.constructor.tag + `-${++unique}`] = element;
    if(new.target === Component){
      console.log("Throw an error! Cannot instantiate abstract class.");
    }
    // Initialize

    this.__unique = unique;
  }

  /**
   * Get the Custom Element for the Component
   *
   * @returns {Proxy}
   */
  get element(){
    let key = `${this.constructor.tag}-${this.__unique}`;
    return ComponentMap[key];
  }

  /**
   * Get a provided attribute from this component's custom element
   *
   * @param {string} att
   * @return {*|String|string}
   */
  getAttribute(att){
    return ComponentMap[`${this.constructor.tag}-${this.__unique}`].getAttribute(att);
  }

  /**
   * Set an attribute on this component's custom element.
   *
   * @param {string} att
   * @param {*} value
   */
  setAttribute(att, value){
    ComponentMap[`${this.constructor.tag}-${this.__unique}`].setAttribute(att, value);
  }

  /**
   * Pass through any requests to re-render to the components Element.
   */
  render(){
    this.element.render();
  }

}