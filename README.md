# Cards - Component Architecture Responsive Design System

##Flow

 Import the Cards app

 Register any app components with Cards
  - Cards then creates custom elements for each component and performs the
      initial shadow-dom build for the element.

 Register any (all) of the App Cards.
   - A Card is a custom element which acts as a container for components. Components are blended into custom elements.
   - A Card must extend from the abstract Card class and implement the -required- functions.
   - A Card must have a template which is applied to it inner html.
       (e.g. <div><componentA /><componentB /></div>
   - The Card Node acts as the cards root node.

 Update your dom with the high level view of your application.  <-- This may not be required. I haven't tried a setup where the DOM starts with unregistered elements.
 
 That high level view is the structure which defines where and how individual cards are located on your page.
 Each CARD is responsible for controlling how its components are structured relative to each other and provides additional 
 functionality by appending "parts" to those components.  
 
 A part can add script events to a component, or it can provide the user with the means to do work on the connected component.
 Parts are how Cards extend the functionality of a component without requiring the developer to retool the component.
  
 This is due to my rule #1 for this library - 
        Components MUST be Components. Meaning they should not care HOW they are accessed. 
        They provide a self-contained block of functionality with methods and properties which cause internal effects but has no bearing on the environment that the component is in.

 Meaning that the component should not care if the requests for work come from external scripts or internal effects. It should not care how the requests come in, only respond to them when they do.
 Components public properties and methods are how the outside world interacts with the components internal world.
 Parts are used by Cards to provide additional, reusable, reliable means for driving those interactions.
 
 For Example - A color selector only cares that it has a valid color and knows how to convert the color into useable values. 
 It doesn't care 'how' it gets the color value, whether it comes from a color wheel or an input element or a function call.
 So, the Color Picker Card would have a Color Selector component and a color wheel component. The Color Picker Card would then
 add an on-event part to the color wheel component which listens for the click event, gets the color value from the event, and
 passes the value to the color selector component.
 When the color selector component's color value is changed, it's rendered background color automagically changes to the selected color. 
  
 Another Example - A Playing Card is technically a component.  It has a pretty static template which is dependant on it's properties. 
 It doesn't "do" anything except hide it's internal value state and choose to show its front or back side.
 A Deck would be a "CARD" which contains a number of playing card components.  The "Deck" card would be responsible for telling the right card to reveal itself at the right time, as well
 as communicating with other Deck cards about transferring playing card components. 
 The Deck would use parts to control some of that communication with the playing card components.
 
 - Application will only work on Chrome by default as of - 3/6/18, however it can work in FF if a user enables a specific setting.
    - dom.webcomponents.enabled and dom.webcomponents.customelements.enabled to true
 - Edge is working on an implementation of Custom Elements still (5/11/18).
 - FF 61+ will not require the setting for the app to work. (Scheduled for release 6/26/18)
 - Opera, Opera Mobile, and Safari support autonomous custom elements, which is the type of elements CARDS uses.
 