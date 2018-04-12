// All parts should be imported.
import {PropertyInput} from './PropertyInput.js';
import {PropertyObserver} from './PropertyObserver.js';

/**
 * Register the default parts which may be applied to a component.
 * @param {CustomElementRegistry} elementRegistry
 *
 * @todo Move this to the Cards Class and change this export to the normal list of content.
 */
export const registerParts = function(elementRegistry){
  elementRegistry.define("property-input", PropertyInput);
  elementRegistry.define("property-observer", PropertyObserver);
};

