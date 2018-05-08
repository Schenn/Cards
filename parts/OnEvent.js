import {ScriptPart} from './ScriptPart.js';
import {_debounce} from '../utilities/_debounce';

let delay = 100;

/**
 * Trigger JS in response to an event on this element's parent node.
 *  on attribute - space separated list of events to trigger on.
 *
 */
export class OnEvent extends ScriptPart {

  constructor(){
    super();
    this.setAttribute("argument", "event");
  }

  /**
   * On initial connection, memoize and function wrap the inner text for the script.
   *
   * Then set the callback for any attached event.
   * Callback is attached to this element's parent node.
   *    It should still be in a component, but the event you're listening for will only be applied to the parent element.
   *    If you want the whole component to be the target of the listener, than have this element at the root of the component.
   * Callback will be scoped so that "this" is bound to the calling card.
   * event and component which triggered the event are passed into the callback.
   */
  connectedCallback(){
    super.connectedCallback();
    let events = this.getAttribute("on").split(" ");

    let self = this;
    this.cb = _debounce((e)=>{
      self.execute(e);
    }, delay);

    events.forEach((event)=>{
      this.parentNode.addEventListener(event, this.cb);
    });
  }

  /**
   * Detach the event listeners
   */
  disconnectedCallback(){
    let events = this.getAttribute("on").split(" ");
    events.forEach((event)=>{
      this.parentNode.removeEventListener(event, this.cb);
    });
  }
}