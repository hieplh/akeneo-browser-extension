setInterval(() => {
  chrome.storage.session.clear();
}, 60 * 1000);