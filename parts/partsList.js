// All parts should be imported.
import {PropertyInput} from './PropertyInput.js';
import {PropertyObserver} from './PropertyObserver.js';
import {OnEvent} from './OnEvent.js';
import {ScriptPart} from './ScriptPart.js';

/**
 * Register the default parts which may be applied to a component.
 * @param {CustomElementRegistry} elementRegistry
 **/
export const partsList = [
  PropertyInput,
  PropertyObserver,
  ScriptPart,
  OnEvent
];

