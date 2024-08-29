document.getElementById('outline-toggle').addEventListener('click', () => {
  console.log('registered button press');
  (async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    chrome.tabs.sendMessage(tab.id, 'toggleOutlines');
  })();
});

// (async () => {
//   const [tab] = await chrome.tabs.query({
//     active: true,
//     lastFocusedWindow: true,
//   });
//   const response = await chrome.tabs.sendMessage(tab.id, 'toggleOutlines');
// })();
