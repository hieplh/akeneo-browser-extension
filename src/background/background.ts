setInterval(() => {
  chrome.storage.session.remove("total_variant_products");
}, 60 * 1000);