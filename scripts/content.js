// on load -> put an outline around every container,
// listen for "click" events (do those even exist?)
//      on click, query selector :hover and get the element under the mouse
//          show style for current element
//          remove all other outlines.
//      listen for arrow key events and adjust the positioning based on the direction
//

//global variables
let showOutlines = true;
let sidePanelOpen = false;
let selectedElement;
let backgroundStorage; // used to put the same background color back after the user deselects

let unit = 'rem';
let unitScale = 1;
let margin = false;
let positionStyle = 'relative';

function toggleOutlines() {
  document
    .querySelectorAll('*')
    .forEach(
      (element) =>
        (element.style.outline = showOutlines ? '1px red solid' : 'none')
    );
  showOutlines = !showOutlines;
}

function selectElement(underMouse) {
  if (selectedElement && selectedElement === underMouse) {
    // deselect the selected element
    selectedElement.style.backgroundColor = backgroundStorage;
    selectedElement = null;
    backgroundStorage = null;
    sendSelectedStyle(); // send an empty style to the extension
  } else if (underMouse) {
    if (selectedElement)
      selectedElement.style.backgroundColor = backgroundStorage; // revert old selected element to its original background
    selectedElement = underMouse; // set new selected Element
    backgroundStorage = underMouse.style.backgroundColor; // remember the elements background to be reverted later
    underMouse.style.backgroundColor = '#ec94fb'; //set background of selected element

    sendSelectedStyle(); // update the style to the extension
  }
}

function setMovementParams(params) {
  console.log(params);
  unit = params.unit;
  unitScale = Number(params.scale);
  margin = params.position === 'margin' ? true : margin;
  positionStyle =
    params.positioning === 'margin'
      ? positionStyle
      : params.position === 'current'
      ? selectedElement.style.position
      : params.positioning;
  console.log(positionStyle);
  selectedElement.style.position = positionStyle;
  sendSelectedStyle();
}

function changeStyleNumber(elementStyleProp, offset) {
  let currentVal = Number(elementStyleProp.replace(/[^0-9\-\.]+/, ''));
  // let currentUnit = elementStyleProp.replace(/[0-9\-\.]+/, '');

  currentVal = isNaN(currentVal) ? 0 : currentVal;
  // currentUnit = currentUnit === '' ? unit : currentUnit;

  return `${currentVal + unitScale * offset}${unit}`;
}

function sendSelectedStyle() {
  if (!selectedElement) {
    return chrome.runtime.sendMessage({});
  }
  const output = {};
  for (const prop in selectedElement.style) {
    if (
      Object.hasOwn(selectedElement.style, prop) &&
      !Number.isNaN(Number.parseInt(prop))
    ) {
      output[selectedElement.style[prop]] =
        selectedElement.style.getPropertyValue(selectedElement.style[prop]);
    }
  }
  chrome.runtime.sendMessage(output);
}

function editStyle(styleData) {
  for (const [prop, value] of Object.entries(styleData)) {
    selectedElement.style[prop] = value;
  }
}

document.addEventListener('dblclick', (event) => {
  if (!sidePanelOpen) return;
  const underMouse = document.elementFromPoint(event.clientX, event.clientY);
  selectElement(underMouse);
});

document.addEventListener('keydown', (e) => {
  if (!sidePanelOpen) return;
  const dirData = {
    KeyA: { dir: 'left', factor: -1, margin: 'marginLeft' },
    KeyW: { dir: 'top', factor: -1, margin: 'marginTop' },
    KeyD: { dir: 'left', factor: 1, margin: 'marginRight' },
    KeyS: { dir: 'top', factor: 1, margin: 'marginBottom' },
  }[e.code];

  if (!dirData) {
    return;
  }
  if (!selectedElement) {
    return;
  }
  if (!margin) {
    editStyle({
      position: positionStyle,
      [dirData.dir]: changeStyleNumber(
        selectedElement.style[dirData.dir],
        dirData.factor
      ),
    });
  } else {
    editStyle({
      [dirData.margin]: (selectedElement.style[dirData.dir] = changeStyleNumber(
        selectedElement.style[dirData.dir],
        dirData.factor
      )),
    });
  }

  sendSelectedStyle();
});

chrome.runtime.onConnect.addListener(function (port) {
  // a sidepanel has been opened
  if (port.name === 'sidePanelStatus') {
    console.log('side panel opened');
    sidePanelOpen = true;

    // handle messages from the sidepanel
    chrome.runtime.onMessage.addListener(function (request) {
      switch (request.type) {
        case 'outlines':
          console.log('setting outlines');
          toggleOutlines();
          break;
        case 'params':
          console.log('updating params');
          setMovementParams(request.data);
          break;
        case 'style':
          console.log('editing style');
          editStyle(request.data);
          break;
      }
    });
  }
  // what to do when side panel is closed
  port.onDisconnect.addListener(function (port) {
    if (port.name === 'sidePanelStatus') {
      sidePanelOpen = false;
      console.log('side panel closed');
      // unsetStyles
      showOutlines = false;
      if (selectedElement)
        selectedElement.style.backgroundColor = backgroundStorage;
      selectedElement = null;
      backgroundStorage = null;
      toggleOutlines();
    }
  });
});

// check if side panel is open on page load
// not working
// chrome.runtime.sendMessage('Are you there?', (response) => {
//   if (chrome.runtime.lastError) {
//     // console.log("side panel doesn't appear to be open");
//     sidePanelOpen = false;
//   } else {
//     // console.log('side panel appears to be open');
//     sidePanelOpen = true;
//   }
// });

//TODO-LIST
//  Make it look somewhat okay
//  catch "Uncaught (in promise) Error: Could not establish connection. Receiving end does not exist."
//  icons and a better name/title
//  fix: if sidePanel is already open when you load a new pager, or reload the current, you have to close the sidePanel and reopen to get funcitonality
