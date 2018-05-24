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
 *            -- onReady should be a definable attribute of any custom-element. Regardless if its a Card, Component, or Part.
 * @todo Attribute "old" and "new" attributes should be observed independently so that some attribute callbacks can specify that they want the original value over the new.
 *
 */
export class Observation {

  constructor(){
    // Assign a unique ID to this observation and prepare the collections.
    this.__id = ++uniqueObservationId;
    this._ = Symbol(`Observation ${this.__id}`);
    this[this._] = {
      observations: new MutationObserver((m)=>{this.onMutation(m);}),
      options: {},
      callbacks: {}
    };
  }

  /**
   * Get the MutationObserver Options being used by this Observation.
   * @return {*}
   */
  get options(){
    return this[this._].options;
  }

  get textOptions(){
    let textOpts = {};

    textOpts.characterData = true;
    // Use a false option for this value creates a hiccup. It should either be true or absent.
    if(this.options.characterDataOldValue){
      textOpts.characterDataOldValue = this.options.characterDataOldValue;
    }

    // Firefox will not track the character data changes on the text node itself.
    // Instead, you need to listen for childList changes in addition to characterdata changes.
    // Then in the observation callback, intelligently decide if its a child list mutation or text mutation.
    // CharacterData callbacks in FF REQUIRE the data attribute of the text node to be set directly.

    // Chrome DOES use the CharacterData mutation if the innerText of the node changes and the observed element is the text node.

    // For best functionality, we have to listen to the whole subtree due to the many ways that the DOM changes
    //    text without triggering the setter.
    // This means you cannot listen for text changes on a parent and child separately unless you take great care to replace text content in a specific way.
    //      (Always using the textNode.data setter)

    //textOpts.subtree = true;

    return textOpts;
  }

  get nodeOptions(){
    let nodeOpts = {};
    if(this.options.subtree){
      nodeOpts.subtree = true;
    }
    if(this.options.attributes){
      nodeOpts.attributes = true;
      // Use a false option for this value creates a hiccup. It should either be true or absent.
      if(this.options.attributeOldValue) {
        nodeOpts.attributeOldValue = this.options.attributeOldValue;
      }

      nodeOpts.attributeFilter = this.options.attributeFilter;
    }
    if(this.options.childList){
      nodeOpts.childList = true;
    }
    return nodeOpts;
  }

  /**
   * Tell the Observation to watch for the changes on child nodes of the target,
   *  in addition to the target itself.
   */
  includeChildren(){
    this.options.subtree = true;
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
    if(typeof this.options.attributes === "undefined"){
      this.options.attributes = true;
      this.options.attributeFilter = [];
    }
    this.options.attributeOldValue = useOriginal;
    this.options.attributeFilter.push(att);
    this[this._].callbacks[att] = callback;
  }

  /**
   * Add a callback to trigger if a child is added to the target.
   *
   * Note - If the Child was a Component, than it's onConnect and onDisconnect function will also be called which triggers a callback on its card parent.
   * You should NOT watch for children of Cards, but rather, children of components or normal dom nodes.
   *
   * @param {function} callback
   */
  onChildAdded(callback){
    this.options.childList = true;
    this[this._].callbacks.onChildAdded = callback;
  }

  /**
   * Add a callback to trigger if a child is removed from the target.
   *
   * Note - If the Child was a Component, than it's onConnect and onDisconnect function will also be called which triggers a callback on its card parent.
   * You should NOT watch for child changes for a whole card, but rather, the children of components or a set of normal dom nodes.
   *
   * @param {function} callback
   */
  onChildRemoved(callback){
    this.options.childList = true;
    this[this._].callbacks.onChildRemoved = callback;
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
    this.options.characterData = true;
    this.options.characterDataOldValue = useOriginal;

    this[this._].callbacks.onTextChanged = callback;
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

    // If the MutationObserver should watch the text node of the target...
    // Character Data Mutation Observation only works on the data value from the text node.
    // To trigger the mutation, you must use the data setters on the text node itself.
    // If the observed node is NOT a text node, than it will automatically include all children of the element.

    if(this.options.characterData) {
      let textOpts = this.textOptions;
      if(node.nodeType !== Node.TEXT_NODE){
        textOpts.childList = true;
        textOpts.subtree = true;
      }
      this[this._].observations.observe(node, textOpts);
    }

    // If the Mutation Observer should watch the attributes or child list of the target.
    if(this.options.attributes || this.options.childList){
      this[this._].observations.observe(node, this.nodeOptions);
    }
  }

  onAttributeMutation(mutation){
    let att = mutation.attributeName;
    // If there's a callback to trigger for this attribute mutation.
    if(typeof this[this._].callbacks[att] !== "undefined"){
      let val = this.options.attributeOldValue ?
          mutation.oldValue :
          mutation.target.getAttribute(att);

      this[this._].callbacks[att](val);
    }
  }

  onChildListMutation(mutation){
    // If a child was added to the node
    if(typeof this[this._].callbacks.onChildAdded !== "undefined" &&
        mutation.addedNodes.length > 0){
      this[this._].callbacks.onChildAdded(mutation.addedNodes);
    }
    // If a child was removed from the node.
    if(typeof this[this._].callbacks.onChildRemoved !== "undefined" &&
        mutation.removedNodes.length > 0){
      this[this._].callbacks.onChildRemoved(mutation.removedNodes);
    }
  }

  onTextMutation(mutation){
    if(typeof this[this._].callbacks.onTextChanged !== "undefined"){
      let val;
      if(mutation.type === "childList"){
        val = this.options.characterDataOldValue ?
            mutation.removedNodes[0].data :
            mutation.addedNodes[0].data;
      } else if(mutation.type === "characterData") {
        val = this.options.characterDataOldValue ?
            mutation.oldValue :
            mutation.target.data;
      } else {
        console.log(mutation);
        throw "Unknown Mutation Type";
      }
      this[this._].callbacks.onTextChanged(val);
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
        if(mutation.addedNodes.length > 0 && mutation.addedNodes[0].nodeType === Node.TEXT_NODE) {
          this.onTextMutation(mutation);
        } else {
          this.onChildListMutation(mutation);
        }
      } else if(mutation.type === "characterData") {
        this.onTextMutation(mutation);
      }
    }
  }

  disconnect(){
    this[this._].observations.disconnect();
  }

}