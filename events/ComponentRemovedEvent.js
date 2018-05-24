export class ComponentRemovedEvent extends CustomEvent {
  constructor(component){
    super('ComponentRemoved', {detail: {component: component}});
  }
}