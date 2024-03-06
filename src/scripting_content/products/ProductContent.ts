const extension_url = "extension_url";
const extension_headers = "extension_headers";
const extension_method = "extension_method";
const extension_data = "extension_data";
const extension_params = "extension_params";
const extension_payload = "extension_payload";

let el = document.createElement("script");
el.src = chrome.runtime.getURL("scripts/product_script.js");
document.documentElement.appendChild(el);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "getSessionStorage") {
    const url = sessionStorage.getItem(extension_url);
    const headers = sessionStorage.getItem(extension_headers);
    const data = sessionStorage.getItem(extension_data);
    const params = sessionStorage.getItem(extension_params);
    const payload = sessionStorage.getItem(extension_payload);
    sendResponse({
      url: url,
      headers: headers,
      data: data,
      params: params,
      payload: payload,
    });
  }
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "singleCompleteVariants") {
    singleCompleteVariants(port);
  }
  if (port.name === "fetchAllSingleCompleteVariants") {
    fetchAllSingleCompleteVariants(port);
  }
});

const singleCompleteVariants = (port: chrome.runtime.Port) => {
  port.onMessage.addListener((message, port) => {
    message.singleCompleteVariants.forEach((id) => {
      const xpathStatement = `//div[@id='container']//div[@class='content']//table/tbody//tr[contains(td[@data-column='identifier'], '${id}')]`;
      const trElement = document.evaluate(
        xpathStatement,
        document.body,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue as HTMLTableRowElement;
      switch (message.state) {
        case "change_background":
          trElement.style.backgroundColor = "#90ee90";
          break;
        case "reset":
          trElement.style.backgroundColor = "";
          break;
        default:
          break;
      }
    });
  });
};

const fetchAllSingleCompleteVariants = (port: chrome.runtime.Port) => {
  port.onMessage.addListener((message, internalPort) => {
    const method = sessionStorage.getItem(extension_method) ?? "POST";
    var headers = JSON.parse(sessionStorage.getItem(extension_headers)!) ??  { "Content-Type": "application/x-www-form-urlencoded" };
    const params = sessionStorage.getItem(extension_params) ?? "";
    const payload = new URLSearchParams(sessionStorage.getItem(extension_payload) ?? "");
    payload.set("product-grid[_pager][_page]", "1");
    const url = (sessionStorage.getItem(extension_url) ?? "") + (params.length > 0 ? `?${params}` : "");

    fetchSingleCompleteVariants(url, headers, method, payload);
  });
};

const fetchSingleCompleteVariants = (url: string, headers: any, method: string, payload: any) => {
  fetch(url, { body: payload.toString(), method: method, headers: headers })
  .then((res) => {
    res
      .json()
      .then((res) => {
        if (url.includes("/datagrid/product-grid/load")) {
          res = JSON.parse(decodeURIComponent(res.data));
        }

        responseSingleCompleteVariants("processSingleCompleteVariants", res);
        if  (res.data.length > 0) {
          payload.set("product-grid[_pager][_page]", Number(payload.get("product-grid[_pager][_page]")) + 1);
          fetchSingleCompleteVariants(url, headers, method, payload);
        }
      })
      .catch((err) => {
        console.log(
          "fetchAllSingleCompleteVariants | res.json() | error: ",
          err
        );
      });
  })
  .catch((err) => {
    console.log("fetchAllSingleCompleteVariants | error: ", err);
  });
}

const responseSingleCompleteVariants = (name: string, data: any) => {
  chrome.runtime.connect({ name: name }).postMessage(data);
};
