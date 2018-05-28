/**
 * Abstract Card Class
 *
 * Extend from this class to create a Card based Custom Element.
 *
 * At its' root, "Cards" represents two things
 *  -  Component Architecture Responsive Design System
 *  -  A collection of loosely, optionally connected content containers which self-describe
 *       their components and establish any reactive effect which should take place in addition
 *       to the component's internal functionality.
 *
 * A Card is a custom element which serves a larger purpose than a component and requires components to work.
 *  The Card's template structure declares what components should be created,
 *    what the initial values for the component properties should be,
 *    what parts should be applied to which components to extend their capability without
 *      changing the components themselves.
 *    Any other HTML that should be in it's structure.
 *
 * An example of a Card might be a Blog Post Node. Something which has a title Component,
 *    a content component, an author component, some additional HTML, and gives access to the user
 *      to update those values if the user has permission.
 *
 * Card's don't have Observable Properties.
 *  They only have two non-observed properties which are meant to be overridden,
 *    the static tag and the instance template.
 * Cards should use Components to manage other properties
 *  That doesn't mean you shouldn't give your Card any Attributes.
 *  Just understand that there isn't anything currently in the app that will provide a benefit to doing so.
 *
 * @abstract
 * @todo Slot an optional style element. Thus allowing the Card to manage the styles of its components
 */
export class Card extends HTMLElement {
  /**
   * The static property "tag" defines what string to use as the tag name for the card.
   *    Custom Element Tags must contain at least one '-' character in their tag.
   * @abstract
   * @return {string}
   * @throws If not overridden.
   */
  static get tag(){
    // Override with child class.
    throw "Tag Property MUST be overridden by child class.";
  }

  /**
   * The instance templates are tracked non-statically in order to allow custom-elements
   *    to be updated independently of each other.
   *
   *  @abstract
   *  @return {string}
   *  @throws If not overridden.
   */
  get template(){
    // Override with child class
    throw "Template Property MUST be overridden by child class.";
  }

  constructor(){
    super();
  }

  /**
   * Callback triggered when the Card is added to a DOM.
   *
   * Sets up event listeners to grab component events.
   */
  connectedCallback(){
    this.addEventListener("ComponentReady", (component)=>{
      this.onComponentReady(component);
    }, {
      once: true,
      capture: true
    });

    this.addEventListener("ComponentRemoved", (component)=>{
      this.onComponentRemoved(component);
    });
    this.render();
  }

  /**
   * Callback triggered when the Card is REMOVED from the DOM
   *
   * Can be overridden by your child class, but is not required unless you need to perform work during destruction.
   *
   * @todo Remove any timeouts, event listeners, etc which are being managed by this Card element and it's component children.
   *
   * @override
   */
  disconnectedCallback(){

  }

  /**
   * Get a (or all if there are multiple) component child of this card.
   *   Since Components are elements, we can get any child components using query selector all for the component elements.
   *
   * @param {string} query The tag name, css or attribute selector query to use.
   * @returns {NodeList}
   */
  getComponent(query){
    //
    return this.querySelectorAll(query);
  }

  /**
   * Set the card's inner html content to it's template string.
   *
   * Won't do anything if the card's template is empty | null | undefined
   */
  render(){
    if(this.template.trim() !== '' &&
        this.template !== null &&
        typeof this.template !== 'undefined'
    ){
      this.innerHTML = this.template;
    }
  }

  /**
   * As components become available to the Card, they are passed into this function.
   *
   * Override this function to do 'something' when a component is ready.
   *  Check the components tag or unique id to determine which component it is.
   *  Or you can do an instanceof check if you don't need that level of specificity.
   *
   * @param {Component} component The component instance.
   * @abstract
   */
  onComponentReady(component){

  }

  /**
   * When a Component is removed from the Card Dom, they are passed into this function.
   *  Check the components tag or unique id to determine which component it is.
   *  Or you can do an instanceof check if you don't need that level of specificity.
   *
   * @param {Component} component The Card Component Instance.
   * @abstract
   */
  onComponentRemoved(component){

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