import {Observation} from '../utilities/Observation.js';
import {ScriptPart} from './ScriptPart.js';

let unique = 0;

/**
 * Property Observer monitors it's parent component's attributes for changes and when
 *  a matching change is detected, it triggers an appropriate callback on the Card which
 *  added the Property Observer to the component.
 *
 * @todo Is there any way to identify the inner text of this element as js for IDEs?
 *      Or, should we use a script tag as a child and grab the text from that?
 *      Maybe once custom-elements are more fully implemented, we can extend the script tag.
 *      For now, one can only create new elements, not extend existing classical elements.
 */
export class PropertyObserver extends ScriptPart {

  static get tag(){
    return 'property-observer';
  }

  constructor(){
    super();
    this.setAttribute("argument", "value");
    this[this._].observers = null;
  }

  /**
   * When connected to the DOM, start observing the parent component's attributes
   *  for the changes specified in the data-onchange attribute of this node.
   *
   *  Callback is bound to the context of the containing card (as that's where the callbacks should be)
   *  New Property Value is passed into the callback function under the "value" argument.
   *  Component is passed as the "component" argument. (So that the changed component is identifiable)
   *
   *  Best Use Case is to identify a card function to trigger when a property is changed,
   *      not writing out complex functionality inside the element.
   */
  connectedCallback(){
    let property = this.getAttribute("property");

    this.setAttribute("argument", property);

    super.connectedCallback();
    let comp = this.parentComponent();
    // REQUIRED

    // Trigger the callback on attribute change.
    this[this._].observers = new Observation();
    this[this._].observers.onAttributeChange(property, (val)=>{
      // Bind the callback function to the parent card before calling.
      this.execute(val);
    });
    this[this._].observers.observe(comp);
  }

  disconnectedCallback(){
    this[this._].observers.disconnect();
    delete this[this._].observers;
  }
}