// on load -> put an outline around every container,
// listen for "click" events (do those even exist?)
//      on click, query selector :hover and get the element under the mouse
//          show style for current element
//          remove all other outlines.
//      listen for arrow key events and adjust the positioning based on the direction
console.log('running content.js');
document
  .querySelectorAll('*')
  .forEach((element) => (element.style.outline = '1px red solid'));
