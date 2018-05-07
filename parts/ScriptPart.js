import {Part} from './Part';

let unique = 0;
let callbacks = new WeakMap();

/**
 * This class allows the developer to add context specific scoped javascript to the html on their page.
 *
 * This class should be extended from for better functionality as something needs to know when to actually call the function.
 * This only prepares the function. Your App should execute it when its appropriate.
 *
 * argument attribute - the name of the argument to pass into the scope of the script part element.
 */
export class ScriptPart extends Part {
  constructor(){
    super();
    this.__unique = ++unique;
  }

  get script(){
    return callbacks[this.__unique];
  }

  scriptReady(){
    return typeof callbacks[this.__unique] !== "undefined";
  }

  makeScript(scriptArg){
    // Get the script from the inner text of this element.
    let script = this.innerText;
    // Get the inner text of this node, convert it to a function and erase the innertext value.
    // While not a great practice, the benefit to doing Function like this instead of "eval"
    //  is the ability to control the context and scope of the function script.
    callbacks[this.__unique] = Function(scriptArg, "component", script);
    // Clear the innertext as it shouldn't render.
    this.innerText = '';
  }

  connectedCallback(){
    if(!this.scriptReady()){
      let scriptArg = this.getAttribute("argument");
      this.makeScript(scriptArg);
    }
  }

  execute(argument){
    let comp = this.parentComponent();
    let card = comp.card;
    let cb = this.script.bind(card);
    cb(argument, comp);
  }
}