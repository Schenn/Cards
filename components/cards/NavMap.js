import {CardComponent} from './CardComponent.js';

class NavEvent extends CustomEvent {
  constructor(url){
    super('nav', {detail:{url:url}});
  }
}

export class NavMap extends CardComponent {
  static get tag(){
    return "nav-map";
  }

  static get observableProperties(){
    return ['navmap'];
  }

  constructor(element){
    super(element);
    let navList = this.navmap;

    this.navList = (!navList) ? [] :navList.split(",");
  }

  /**
   * @return {*|String|string}
   */
  get useevent(){
    return this.getAttribute("useevent");
  }

  get navmap(){
    return this.getAttribute("navmap");
  }

  set navmap(map){
    this.navList = map.split(',');
  }

  get template(){
    let template = '<nav>';

    this.navList.forEach((node)=>{
      if(node.trim() !== ''){
        let nodeData = node.split(":");
        template += `<a href="${nodeData[1]}">${nodeData[0].trim()}</a>`;
      }
    });

    template += '</nav>';
    return template;
  }

  /**
   * Add a link to the nav map.
   * @param {string} label
   * @param {string} url
   */
  addLink(label, url){
    this.navmap += `, ${label}:${url}`;
  }

  /**
   * Replaces the default action of the anchor tag with a 'nav' event.
   */
  onReady(){
    if(this.useevent){
      this.element.querySelectorAll('a').forEach((a)=>{
        a.addEventListener('click', (e)=>{
          e.preventDefault();
          e.stopPropagation();

          this.element.dispatchEvent(new NavEvent(e.target.getAttribute('href')));
          return false;
        });

      });
    }

  }

}