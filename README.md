# Cards - Component Architecture Responsive Design System

##Flow

 Import the Cards app

 Register any app components with Cards
  - Cards then creates custom elements for each component and performs the
      initial pre-render of the component node.

 Give Cards the root dom node to use
  - As Cards are added, they are appended to the provided dom node

 Register any (all) of the App Cards.
   - As a Card is added, its html template is appended to the dom.
     - By virtue of being added to the dom, the app components are instantiated.
     - The Card is then given a reference to the component nodes that were created
     - The Card can listen for events on its component nodes, or,
         utilize the public methods and properties for those components to do work.
 
   - A Card is NOT a custom element.  It is a container for components. Components are custom elements.
   - A Card must extend from the abstract Card class and implement the -required- functions.
   - A Card must have a function that returns a string which represents how it displays its content.
       (e.g. <div><componentA /><componentB /></div>
   - A Card must have only one individual root node in its template.
   - Cards provides a messaging system to the cards on the page.
       If a Card absolutely has to do something with another card (such as analytics tracking)
       Then send a message.  If the message is valid, the system will trigger the callback in the message.
 
 Card components may be ajaxable by attaching an Ajax tool component in its constructor.

##NOTES
  Components come in different types
   - Card Components
       - Used to contain reactive data (data which updates it's render on change)
       - Used to render content in a typical dom page
       - Do not care about what other components may be adjacent to it.
       - Do not care about what card it is attached to
       - Can fire events from its own node to inform registered listeners about a specific update
       - Have public properties which can be referenced by their parent Card
       - Can contain Tool Components
       - Component HTML should not be kept in reference if its going to change.
           - e.g. If a component uses an if - else decision in its template to show one element or another,
             than external references to those elements will be lost as the dom is updated.
       - After the template renders, the html nodes it uses are kept in a reference cache for quicker updating.
       - It is very important, obviously, that the template returns proper html.
       - Is contained in a Card which determines where to render the component content relative to its other components.
       - No Generic HTML components.  A Card Component IS CONVERTED INTO a Custom HTML Element. It cannot conflict with standard HTML.
         -  e.g. No "Div" component. You can use divs in your templates of course, but cannot overwrite or extend the functionality of the Div.
       - Be Smart - You don't always need a Component when HTML in the Card will work fine.
 
 
   - Tool Components
       - Modules which can be added to a Card Component to extend their utility.
       - May use Private Properties to keep valuable data protected.
           Such as ajax tokens, or random seeds.
           Private Properties may be static variables or references to a weakmap->id connection. Depends on the tool.
       - Tool Module exports an accessor function that is appended to the passed in Card Component.
       - Contain No Rendering ability.
       - Should only provide some utilitarian type of work, such as performing ajax connections, filtering lists, etc
       - Can be assigned to a Card as well as a Card Component
 
   - Observable Components
       - A proxy around a private Component Object
       - Is a public or private Property of a Card Component
       - Requires callbacks to trigger on set calls.
       - For more complex objects which need to trigger Card Component effects,
           such as re-rendering the Card Component when a property of the Observable Component changes,
             or performing a reactive operation that will then update a Component Property.
       - Think Component - Stand alone collection of properties and methods.
           Should be reusable between Card Components and Cards
           As an observable, its only promise is to fire callbacks.
 
   - Style Components
       - Extends from the Observable Component which calibrates it's properties from the styles associated with the Card or Card Component.
         - For example, a site may have multiple resolution breakpoints that cause the style of the Card or Component to change.
           When those values change, the Style Component triggers callbacks.
         - Needs a Node to watch for changes on.
         - Listens for resize events to deterministically trigger the callback.

  Cards
 
   - Contains a number of Components which provide the ui and ux the Card needs to do work
   - Has public and or private properties
   - Has an HTML template to identify its Card Component structure.
     - HTML Template requires a root node to apply the Card Components to.
       - Root Node cannot be the same root as the Cards application. Sorry/NotSorry
   - Should be preservable in a document store.
   - Does not share its component references.
   - Can either be Extended from the Card Class, or,
       a generic instance of the Card can be used instead. (requires a html template)
   - Can use Tool and Observable Components in addition to Card Components to perform non-rendered work.
   - Can access the public properties of its internal components for setting or getting, but does not that access.
   - Listens for Messages from the Card system.
     - Messages can come from -
       - The application which has implemented Cards
       - Other Cards
       - Callbacks and Events
     - Messages are similar to Events
       - Strings, arguments, and expectations of a response if possible.
       - You use a Message to ask a Card to do something, or to get information from a Card,
           not as a response to a Card doing something internally.  That's an Event.
     - Eliminates need for scoping, hoisting, and dependency injections.
     - Messaging is the only way to get the component property values outside of the Card itself.
       - Allows the Card to choose how to handle those requests individually,
           though the Card abstract class onMessage function will act as a Passthrough by default.
   - Can mutate their html templates after being instantiated due to either logical decisions, function references or property changes.
     - When the template is changed, the entire Card is redrawn and connections to components are re-established.
       - If a component is removed from the template, it is no longer usable by the Card and is destroyed.
       - If you don't want to destroy the Component, hide it with styling instead.
       - If a component was removed, then re-added, it will be re-added in its initial state.
           However if the card stored the values from the component before it was destroyed, it can then reset them.
           Since, in this situation, a Component will be added, then updated,
               it is a good idea to use default values that don't jar the user.
  - It may be better to use the Card's HTML than create a Component for some things. It depends on the need.
  - Components should really only be used if you need a piece of html that will
     automagically handle rendering updates if it's properties change, or,
     if the piece of html must be exactly the same for the associated data in the majority of cases.
 
  - The system will only -add- Card derived classes to the application root.
  - Do not expect arbitrary html to be preserved if its inside the application root node.
  - Card's can also just use a generic HTML template with no components.
     This is how you add reusable static content blocks to the page, such as a nav menu or social media plugins.
 
 - Application will only work on Chrome by default as of - 3/6/18, however it can work in FF if a user enables a specific setting.
 - IE is in discussion still with Custom Elements, meaning it may be some time before they work with IE.
 - FF 59+ will not require the setting for the app to work.
 - Works in generic mobile browsers for some reason.
 