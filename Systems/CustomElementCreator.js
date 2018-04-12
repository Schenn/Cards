/**
 * Defines a custom element which can be created in html from a CardComponent module.
 *
 * A CustomElement's attributes match a provided Card Component
 * A CustomElement's tag comes from the Card Component "tag" property
 *
 * @todo Clean this up!!!
 */

function mergedElement(cardComponent, element){
  let observables = cardComponent.observableProperties;

  let instance = new cardComponent(element);

  /**
   *  In order to trigger render effects on the element for the particular component,
   *  we need to override the setter for the property with a reference to the render method.
   *  In order to ensure the original functionality is still applied, the setter is maintained as a callback
   *  The getter is just rebound as is, but the setter is overridden with a call to render after triggering the original setter.
   */

  /**
   * @todo Try to find another way to do this without replacing the property setter.
   */
  for(let prop of observables){
    // Lookup Setter and LookupGetter may end up being removed from a future version of ES,
    //  it still works for now and seems like it should for quite some time.
    let setCB = instance.__lookupSetter__(prop);
    let getCB = instance.__lookupGetter__(prop);

    // Remove the property from the instance object so that we can re-attach
    //  the getters and setters with a call to render.
    delete instance[prop];

    /**
     * Override the instance getters and setters for observable properties
     * This way, setting the property value from inside the component instance,
     *  or outside the component instance, will trigger the re-draw.
     */
    Object.defineProperty(instance, prop, {
      get: getCB.bind(instance),
      set: (val)=>{
        // Don't set the property to the same value multiple times.
        if(instance[prop] !== val){
          // Call the original setter
          setCB.bind(instance)(val);
          // Re-render the component.
          element.render();
        }
      }
    });
  }

  return instance;
}


// A simple counter to correlate instance private properties with instances.
// todo: Find a better way to manage this, such as Symbols.
let uniqueIds = 0;

/**
 * Define the unique particulars of a custom element using a related card component class as a guide.
 *
 * @param cardComponent CardComponent class
 * @param id
 * @returns {CustomElement}
 */
function scopedCustomElement (cardComponent, id){

  let observables = cardComponent.observableProperties;
  let componentMap = {};

  /**
   * The CustomElement class is a semi-dynamic class used to create Custom HTML Elements.
   *
   *  It uses the new Custom Elements API which is available in chrome and coming soon to firefox.
   *  It uses the benefits of js scoping to provide a semi-unique class for each unique card component.
   *
   *  When a new element is instantiated, the associated component is instantiated as well.
   *    The component has read-only access to the element via the element property.
   *
   *    If the associated component has reactive properties, those getters and setters are replaced
   *      with references to the elements render method in addition to the original get and set methods.
   *
   *    The associated card template has an event triggered on it which informs
   *      the card of the component instance so that the card can communicate with it later in the applications process.
   *
   *  -- The recommended Flow --
   *  The Application Controls -> Cards which controls -> Components which control their own inner public and private data states.
   *  A card can tell a component to change its property, but not the system.
   *
   *  Sometimes a card will operate in conjunction with other cards.
   *    For example, an authentication card may want to check scroll positions of data cards to ensure the user has actually read the content.
   *    In these situations, use either the Messaging System or traditional Events.
   *
   *  The Messaging System allows for remote operation of public methods and properties, while events are for the component to evaluate functionality internally.
   *
   *  @todo Add a Messaging System
   *  @todo Add ability to take in alternative Component Template from the existing innerHTML of the custom element when it's created.
   */
  return class CustomElement extends HTMLElement {
    constructor(){
      super();
      this.__id = (this.hasAttribute("__id")) ? this.getAttribute("__id") : id;
      componentMap[this.__id] = mergedElement(cardComponent, this);

      // Attach our shadow root and set the initial default slots.
      // @todo Find a way to provide alternative template here.
      this.attachShadow({mode: 'open'});
      this.shadowRoot.innerHTML = `
            <slot name="content"></slot>
            <slot name="parts"></slot>
      `;

      /**
       * Create a node to hold the associated Components template
       * @type {Element}
       */
      let temp = document.createElement("div");
      temp.innerHTML = componentMap[this.__id].template;
      let templateAsNode = temp.children[0].cloneNode(true);
      // Set the slot attribute on the top level node for the component to ensure it's added in the correct place.
      // @todo Can we drop the name and use a 'default' slot?
      templateAsNode.setAttribute("slot", "content");
      this.prepend(templateAsNode);

      componentMap[this.__id].render = ()=>{
        this.render();
      };

      let customAttributes = this.attributes;
      // For each attribute on this node, see if its a property of the associated Component.
      // If so, set the values from the defaults provided in this elements attributes.
      for(let i = customAttributes.length - 1; i >= 0; i--) {
        if(componentMap[this.__id].hasOwnProperty(customAttributes[i].name)){
          // Triggers a render call via the set override above.
          componentMap[this.__id][customAttributes[i].name] = customAttributes[i].value;
        }
      }
    }

    /**
     * Get the list of Observable Attributes for the Component.
     * @return {string[]|array}
     */
    static get observedAttributes() {
      return observables;
    }

    /**
     * Get the CardComponent Associated with this custom element.
     *
     * @return {CardComponent}
     */
    getComponent(){
      return componentMap[this.__id];
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
      // An Attribute on the element has changed.
      // If the attribute is mapped to a component property than update the matching property.
      if(componentMap[this.__id].hasOwnProperty(name) && observables.includes(name)){
        componentMap[this.__id][name] = current;
      }
    }

    /**
     * Triggered when this component's custom element is added to the DOM.
     *
     * Dispatches a Component Added event for the parent Card to pick up and do something with if needed.
     */
    connectedCallback(){

      this.render();
      let connectedEvent = new CustomEvent("ComponentAdded", {
        detail: {
          component: this.getComponent(),
          __id: this.__id
        }
      });
      this.parentNode.dispatchEvent(connectedEvent);
      componentMap[this.__id].onReady();
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
      componentMap[this.__id].onRemoved();
      delete componentMap[this.__id];
    }

    /**
     * Render the content of the component's custom element to the DOM.
     */
    render(){
      let temp = document.createElement("div");
      temp.innerHTML = componentMap[this.__id].template;
      temp.children[0].setAttribute("slot", "content");
      this.querySelector("[slot='content']").remove();
      this.prepend(temp.children[0].cloneNode(true));
    }

    /**
     * Search the component's custom element for a particular node using standard selector.
     *
     * @param {string} node
     * @return {NodeList}
     *
     * @todo Do we need this? Can't we access querySelectorAll from this element?
     */
    query(node){
      return super.querySelectorAll(node);
    }
  };

}

/**
 * Create a custom element class from a card Component
 *
 * @param cardComponent CardComponent child class
 * @param elementRegistry CustomElementRegistry from the dom or a polyfill.
 * @constructor
 */
export function CustomElementCreator(cardComponent, elementRegistry){
  // Create a specially scoped Custom Element Class for the provided component.
  let componentElementClass = scopedCustomElement(cardComponent, ++uniqueIds);
  // Register the Custom Element under the Component's Tag property.
  elementRegistry.define(cardComponent.tag, componentElementClass);
}