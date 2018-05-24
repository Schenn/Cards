import {Part} from './Part.js';

let unique = 0;

/**
 * This class allows the developer to add context specific scoped javascript to the html on their page.
 *
 * This class should be extended from for better functionality as something needs to know when to actually call the function.
 * This only prepares the function. Your App should execute it when its appropriate.
 *
 * argument attribute - the name of the argument to pass into the scope of the script part element.
 *
 * @todo Use spread to fill out the arguments for the Function creation. Thus allowing any number of custom arguments instead of one.
 */
export class ScriptPart extends Part {
  static get tag(){
    return 'script-part';
  }

  constructor(){
    super();
    this._ = Symbol(`ScriptPart${unique++}`);
    this[this._] = null;
  }

  /**
   * Get the memoized function.
   * @return {*}
   */
  get script(){
    return this[this._];
  }

  /**
   * Has the script been prepared as a function yet?
   *
   * @return {boolean}
   */
  scriptReady(){
    return this[this._] !== null;
  }

  /**
   * Convert the innertext of the
   * @param {null | string} scriptArg
   */
  makeScript(scriptArg = null){
    if(this.scriptReady()){
      return;
    }

    /** Get the inner text of this node, convert it to a function and erase the innertext value.
     *  While not a great practice, the benefit to doing Function like this instead of "eval"
     *    is the ability to control the context and scope of the function script.
     */
    let script = this.innerText;
    // If there's no custom argument to use, don't prepare the function to expect one.
    if(scriptArg === null){
      this[this._] = Function("component", script);
    } else {
      this[this._] = Function(scriptArg, "component", script);
    }

    // Clear the innertext as it shouldn't actually render.
    this.innerText = '';
  }

  /**
   * You should call this with super.connectedCallback to prepare the script.
   */
  connectedCallback(){
    if(!this.scriptReady()){
      this.makeScript(this.getAttribute("argument"));
    }
  }

  /**
   * Run the context scoped script
   *
   * @param {*} argument
   */
  execute(argument){
    let comp = this.parentComponent();
    let card = comp.card;
    let cb = this.script.bind(card);
    if(this.getAttribute("argument") !== null){
      cb(argument, comp.component);
    } else {
      cb(comp);
    }

  }
}