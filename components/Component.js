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
 * @abstract Component must be extended to be used.
 **/
export class Component {
  /**
   * @override This property MUST be overwritten
   * @return string The HTML tag to use.  Note - CustomElement Requires that custom html tags have at least 1 "-" symbol.
   * @throws if not implemented
   */
  static get tag(){
    throw "Tag Property must be replaced by child class.";
  }

  /**
   * @override This property MUST be overwritten
   * @return array of properties which should trigger the component element to re-render when they change.
   * @throws if not implemented
   */
  static get observableProperties(){
    throw "Observable Properties Getter must be replaced by child class.";
  }

  /**
   * Give the instance access to the static getter.
   * @returns {array}
   */
  get observableProperties(){
    return this.constructor.observableProperties;
  }

  /**
   * Override this getter to provide this card's shadow dom with a style node.
   *
   * @return {string}
   */
  get style(){
    return ``;
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
    this._ = Symbol(`${this.constructor.tag}`);
    this[this._] = {element: element};
    if(new.target === Component){
      console.log("Throw an error! Cannot instantiate abstract class.");
    }
  }

  /**
   * Get the Custom Element for the Component
   *
   * @returns {Proxy}
   */
  get element(){
    return this[this._].element;
  }

  /**
   * Get a provided attribute from this component's custom element
   *
   * @param {string} att
   * @return {*|String|string}
   */
  getAttribute(att){
    return this.element.getAttribute(att);
  }

  /**
   * Set an attribute on this component's custom element.
   *
   * @param {string} att
   * @param {*} value
   */
  setAttribute(att, value){
    this.element.setAttribute(att, value);
  }

  /**
   * Get all Parts of a given type.
   *
   * @param {string} type The Tag for the part to find.
   * @return {NodeList}
   */
  getParts(type){
    return this.element.querySelector("[slot='parts']").querySelectorAll(type);
  }

  /**
   * Pass through any requests to re-render to the components Element.
   */
  render(){
    this.element.render();
  }

}