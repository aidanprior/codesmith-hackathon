// on load -> put an outline around every container,
// listen for "click" events (do those even exist?)
//      on click, query selector :hover and get the element under the mouse
//          show style for current element
//          remove all other outlines.
//      listen for arrow key events and adjust the positioning based on the direction

let showOutlines = true;
function toggleOutlines() {
  console.log('within toggle outlines');
  document
    .querySelectorAll('*')
    .forEach(
      (element) =>
        (element.style.outline = showOutlines ? '1px red solid' : 'none')
    );
  showOutlines = !showOutlines;
}

chrome.runtime.onMessage.addListener(function (request) {
  if (request === 'toggleOutlines') toggleOutlines();
});

let selectedElement;
let backgroundStorage; // used to put the same background color back after the user deselects
document.addEventListener('dblclick', (event) => {
  const underMouse = document.elementFromPoint(event.clientX, event.clientY);
  if (underMouse) {
    if (selectedElement)
      selectedElement.style.backgroundColor = backgroundStorage; // revert old selected element to its original background

    selectedElement = underMouse; // remember this element to be reverted later
    backgroundStorage = underMouse.style.backgroundColor; // remember the elements background to be reverted later
    underMouse.style.backgroundColor = '#ec94fb';
  }
});
