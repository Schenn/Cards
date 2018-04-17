/**
 * A Part is a class that interacts with it's parent component's attributes.
 *
 * Parts give their declaring card the ability to interact and respond to a components attribute changes,
 *  even if that attribute isn't geared for callbacks or inputs, as long as it's an attribute on the
 *    component element it can be affected by a part.
 *
 * Some parts may only work with a parent components observable attributes,
 *  however, that is not the default nature of the part's functionality.
 *
 * A part sub-class must extend from this class.
 *
 * @abstract
 *
 * @see {PropertyInput} For details on how the Property Input Part works
 * @see {PropertyObserver} For details on how the Property Observer Part works.
 *
 * @todo - Give Part to have a "target" optional attribute.  Target specifies a selector to use for finding the parent component.
 */
export class Part extends HTMLElement {
  constructor(){
    super();
  }

  /**
   * Called when an attribute on the Part is changed.
   *
   * @param {string} name
   * @param {*} old
   * @param {*} current
   */
  attributeChangedCallback(name, old, current){
    // Do nothing. Part's shouldn't have effects when or if their attributes change.
  }

  /**
   * Called when the Part node is added to the DOM.
   */
  connectedCallback(){
    // Initial Render on Connect
    this.render();
  }

  /**
   * Called when the Part node is removed from the DOM.
   */
  disconnectedCallback(){
    // Specifically, do nothing. Ensure that pending timeouts are cleared.
  }

  /**
   * Get the Parent Component of this part.
   *
   * The Parent Component is the first parent node encountered which is identifiable as a custom element.
   *  The function uses the rule: "Custom Elements must use a dash in their tag name" to identify the element.
   *  The function may need to be updated if that requirement is dropped.
   *
   * @returns {HTMLElement} When the matching component's element is found. Null if not.
   */
  parentComponent(){
    let found = false;
    let parentComp = this.parentNode;
    while(!found ){
      // Don't go any further if we've somehow managed this. Stop the loop, the parent component is missing.
      if(parentComp.nodeName === "body"){
        break;
      }
      // If the current node we're looking at is not a custom node.
      if(parentComp.nodeName.indexOf("-") === -1){
        parentComp = parentComp.parentNode;
        continue;
      }

      // If we're here, than the current parentComp value is the closest parent custom element..
      found = true;
    }
    return (found) ? parentComp : null;
  }

  /**
   * Called by default when the Part is added to the dom.
   *
   * The child Part should override this function with it's content.
   *
   * This function is only called once by default, when the Part is added to the dom.
   *  If you want to add attributes and re-render on attribute changes, than
   *  your derived class needs to override the appropriate functions.
   *
   * @abstract
   * @throws if not overridden.
   */
  render(){
    throw `Cannot render an abstract part. You need to create your own custom part class. Invalid Tag: ${this.tagName}`;
  }
}