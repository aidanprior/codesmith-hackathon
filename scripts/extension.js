async function sendToActiveTab(type, request) {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  chrome.tabs.sendMessage(tab.id, { type: type, data: request });
}

const editor = document.getElementById('css-editor');
const positioning = document.getElementById('positioning');
const units = document.getElementById('units');
const unitScale = document.getElementById('unit-scale');

document
  .getElementById('outline-toggle')
  .addEventListener('click', () => sendToActiveTab('outlines'));

document.getElementById('params-submission').addEventListener('click', () =>
  sendToActiveTab('params', {
    positioning: positioning.value,
    unit: units.value,
    scale: unitScale.value,
  })
);

document.getElementById('style-submission').addEventListener('click', () => {
  const styleObj = {};
  const regex = /(.+):\s(.+);/g;
  for (const [_, key, value] of editor.value.matchAll(regex)) {
    styleObj[key] = value;
  }
  sendToActiveTab('style', styleObj);
});

document.getElementById('copy-css').addEventListener('click', async () => {
  await navigator.clipboard.writeText(editor.value);
});

chrome.runtime.onMessage.addListener(function (styleData) {
  editor.textContent = '';
  for (const [key, value] of Object.entries(styleData)) {
    editor.textContent += `${key}: ${value};\n`;
  }
});

let port;
(async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  port = chrome.tabs.connect(tab.id, { name: 'sidePanelStatus' }); // should probably use this port for other messages, and manage ports for each tab.
  port.postMessage({ sidePanelOpened: true });
})();
