/**
 * @todo Observation Collections below should be weakmaps to automatically free memory and invalid references.
 * @todo Cleanup
 */

/**
 * MutationObservers in memory
 * @type {{}}
 */
let observations = {};

/**
 * Option Objects for the Mutation Objects in memory or yet to be instanced.
 * @type {{}}
 */
let observationOptions = {};

/**
 * The related Callbacks to call when a MutationObserver is triggered.
 * @type {{}}
 */
let callbacks = {};

/**
 *
 * @type {number}
 */
let uniqueObservationId = 0;

/**
 * An Observation prepares a Mutation Observer's initializing options and connects
 *  a mutation observer to a callback.
 *
 *  Generic enough to be used on any element, but Cards primarily uses this in the PropertyObserver
 *      to watch for attribute changes on a component element.
 *
 * @todo Add an optional param to debounce the mutation callbacks.
 * @todo Add a child list change filter so that the callback is only triggered when the childlist passes the filter.
 *        -- onComponentReady seems like a good place for this. When a card hears the creation of a component it can apply a ChildListFilterComponent to the observer.
 *            -- onReady should be a definable attribute of any custom-element. Regardless if its a Card, CardComponent, or Part.
 * @todo Attribute "old" and "new" attributes should be observed independently so that some attribute callbacks can specify that they want the original value over the new.
 *
 */
export class Observation {

  constructor(){
    // Assign a unique ID to this observation and prepare the collections.
    this.__id = ++uniqueObservationId;
    observations[this.__id] = new MutationObserver((m)=>{this.onMutation(m);});
    observationOptions[this.__id] = {};
    callbacks[this.__id] = {};
  }

  /**
   * Get the MutationObserver Options being used by this Observation.
   * @return {*}
   */
  get options(){
    return observationOptions[this.__id];
  }

  /**
   * Tell the Observation to watch for the changes on child nodes of the target,
   *  in addition to the target itself.
   */
  includeChildren(){
    observationOptions[this.__id].subtree = true;
  }

  /**
   * Add a callback to trigger when an observed attribute is changed.
   *
   * For performance reasons, as long as the observation is responding to an attribute change, it will use the attribute filter option.
   *  This means you can't listen to "any" attribute change, only the specific ones assigned via this function.
   *
   * @param {string} att The attribute name being changed.
   * @param {function} callback The callback to fire
   * @param {boolean} useOriginal Whether or not to use the values from before the change event or after.
   */
  onAttributeChange(att, callback, useOriginal = false){
    if(typeof observationOptions[this.__id].attributes === "undefined"){
      observationOptions[this.__id].attributes = true;
      observationOptions[this.__id].attributeFilter = [];
    }
    observationOptions[this.__id].attributeOldValue = useOriginal;
    observationOptions[this.__id].attributeFilter.push(att);
    callbacks[this.__id][att] = callback;
  }

  /**
   * Add a callback to trigger if a child is added to the target.
   *
   * Note - If the Child was a CardComponent, than it's onConnect and onDisconnect function will also be called which triggers a callback on its card parent.
   * You should NOT watch for children of Cards, but rather, children of components or normal dom nodes.
   *
   * @param {function} callback
   */
  onChildAdded(callback){
    observationOptions[this.__id].childList = true;
    callbacks[this.__id].onChildAdded = callback;
  }

  /**
   * Add a callback to trigger if a child is removed from the target.
   *
   * Note - If the Child was a CardComponent, than it's onConnect and onDisconnect function will also be called which triggers a callback on its card parent.
   * You should NOT watch for child changes for a whole card, but rather, the children of components or a set of normal dom nodes.
   *
   * @param {function} callback
   */
  onChildRemoved(callback){
    observationOptions[this.__id].childList = true;
    callbacks[this.__id].onChildRemoved = callback;
  }

  /**
   * Watch the node for text content changes.
   *
   * This is slightly different than watching for an attribute change.
   *  If this is used, than an additional observer will be set up to watch the text node of the target node.
   *
   * @param {function} callback
   * @param {boolean} useOriginal Whether or not to pass the original text content when the text is changed.
   */
  onTextChanged(callback, useOriginal = false){
    observationOptions[this.__id].characterData = true;
    observationOptions[this.__id].characterDataOldValue = useOriginal;

    callbacks[this.__id].onTextChanged = callback;
  }

  /**
   * Apply the currently constructing Mutation Observer and its associated options to observe a target node.
   *
   * Use this method to start watching a node for changes.
   *
   * @param {HTMLElement} node
   * @todo Use spread to clean this up.
   */
  observe(node){
    let textOpts = {};
    let nodeOpts = {};

    // If the MutationObserver should watch the text node of the target...
    // Character Data Mutation Observation only works on the data value from the text node.
    if(observationOptions[this.__id].characterData) {
      textOpts.characterData = true;
      // Use a false option for this value creates a hiccup. It should either be true or absent.
      if(observationOptions[this.__id].characterDataOldValue){
        textOpts.characterDataOldValue = observationOptions[this.__id].characterDataOldValue;
      }

      if(observationOptions[this.__id].subtree){
        textOpts.subtree = true;
      }
      // Observe the text data of the first (and presumably only) child of the node
      // @todo Instead of assuming its the first and only child, find the first text node in the element contents.
      observations[this.__id].observe(node.firstChild, textOpts);
    }

    // If the Mutation Observer should watch the attributes or child list of the target.
    if(observationOptions[this.__id].attributes || observationOptions[this.__id].childList){
      if(observationOptions[this.__id].subtree){
        nodeOpts.subtree = true;
      }
      if(observationOptions[this.__id].attributes){
        nodeOpts.attributes = true;
        // Use a false option for this value creates a hiccup. It should either be true or absent.
        if(observationOptions[this.__id].attributeOldValue) {
          nodeOpts.attributeOldValue = observationOptions[this.__id].attributeOldValue;
        }

        nodeOpts.attributeFilter = observationOptions[this.__id].attributeFilter;
      }
      if(observationOptions[this.__id].childList){
        nodeOpts.childList = true;
      }

      observations[this.__id].observe(node, nodeOpts);
    }
  }

  onAttributeMutation(mutation){
    let att = mutation.attributeName;
    // If there's a callback to trigger for this attribute mutation.
    if(typeof callbacks[this.__id][att] !== "undefined"){
      let val = observationOptions[this.__id].attributeOldValue ?
          mutation.oldValue :
          mutation.target.getAttribute(att);

      callbacks[this.__id][att](val);
    }
  }

  onChildListMutation(mutation){
    // If a child was added to the node
    if(typeof callbacks[this.__id].onChildAdded !== "undefined" &&
        mutation.addedNodes.length > 0){
      callbacks[this.__id].onChildAdded(mutation.addedNodes);
    }
    // If a child was removed from the node.
    if(typeof callbacks[this.__id].onChildRemoved !== "undefined" &&
        mutation.removedNodes.length > 0){
      callbacks[this.__id].onChildRemoved(mutation.removedNodes);
    }
  }

  onTextMutation(mutation){
    if(typeof callbacks[this.__id].onTextChanged !== "undefined"){
      let val = observationOptions[this.__id].characterDataOldValue ?
          mutation.oldValue :
          mutation.target.data;
      callbacks[this.__id].onTextChanged(val);
    }
  }

  /**
   * The intermediate callback between this observation and the intended callback.
   * Triggered when the Mutation Observer reports a mutation event.
   *
   * @param {NamedNodeMap} mutationList
   * @todo Allow for individual attributes to use old or new values.
   */
  onMutation(mutationList){
    // Usually only one but can contain more if js was delayed.
    for(let mutation of mutationList){
      // If the mutation is an attribute mutation
      if(mutation.type === "attributes"){
        this.onAttributeMutation(mutation);
        // Else if a child was added or removed to the Node.
      } else if(mutation.type === "childList"){
        this.onChildListMutation(mutation);
      } else if(mutation.type === "characterData") {
        this.onTextMutation(mutation);
      }
    }
  }

}