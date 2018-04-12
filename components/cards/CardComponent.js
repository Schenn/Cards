import {Component} from '../Component.js';

/**
 * CardComponent is a class that provides the functionality unique to CardComponents
 *    which does not exist for other component types. (TBD)
 *
 * @todo Move the rendering and DOM related stuff to this class and out of Component.
 */
export class CardComponent extends Component {
  /**
   * Get the parts which match the provided type.
   *
   * @param {string} type
   * @return {NodeList}
   */
  getParts(type){
    return this.querySelector("[slot='parts']").querySelectorAll(type);
  }
}