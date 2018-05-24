
export class ComponentAddedEvent extends CustomEvent {

  constructor(component){
    super('ComponentAdded', {
      detail: {component: component}
    });
  }
}