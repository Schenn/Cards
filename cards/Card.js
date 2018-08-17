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
 * Card's don't have Observable Properties by default.
 *  They only have two non-observed properties which are meant to be overridden,
 *    the static tag and the instance template.
 * Cards should use Components to manage observable content
 *  That doesn't mean you shouldn't give your Card any Attributes.
 *  Just understand that there isn't anything currently in the app that will provide a benefit to doing so.
 *
 * @abstract
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
   *  You should override this property to set the template in your child class.
   *    However, you can also provide a template tag to the inner html of your child class.
   *    The contents of that tag will override the child's template.
   *
   *  @return {string}
   */
  get template(){
    return this[this._].template;
  }

  /**
   * Replace the current template
   *
   * @param {string} template The new template string
   */
  set template(template){
    this[this._].template = template;
  }

  /**
   * You can either override this property to provide a set style for the card,
   *  or you can add a style tag to the card's template.
   *
   * @return {string}
   */
  get style(){
    return this[this._].style;
  }

  /**
   * Set the shadow style for the card's custom element.
   *
   * @param {string} style
   */
  set style(style){
    this[this._].style = style;
    this.querySelector("style").innerHTML = style;
  }

  constructor(){
    super();

    this._ = Symbol(this.constructor.name);

    this[this._] = {
      template: ``,
      style: ``
    };


    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = `
        ${this.style}
        <slot name="content"></slot>
    `;
  }

  /**
   * Callback triggered when the Card is added to a DOM.
   *
   * Sets up event listeners to grab component events.
   */
  connectedCallback(){

    let template = this.querySelector("template");

    if(template){
      this.template = template.innerText;
      this.removeChild(template);
    }

    let style = this.querySelector("style");

    if(style){
      this.style = style.innerText;
      this.removeChild(style);
    }

    this.onConnected();
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
        this.template != null &&
        typeof this.template !== 'undefined'
    ){
      this.innerHTML = `
        <div slot="content">
            ${this.template}
        </div>
      `;
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
   * Called at the start of the connectedCallback method.
   * Allows you to capture relevant data from innerhtml before the template is set.
   */
  onConnected(){

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