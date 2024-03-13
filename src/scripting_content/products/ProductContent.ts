const extension_url = "extension_url";
const extension_headers = "extension_headers";
const extension_method = "extension_method";
const extension_data = "extension_data";
const extension_params = "extension_params";
const extension_payload = "extension_payload";

let el = document.createElement("script");
el.src = chrome.runtime.getURL("scripts/product_script.js");
document.documentElement.appendChild(el);

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
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
  if (port.name === "variantProductCurPage") {
    variantProductCurPage(port);
  }

  if (port.name === "fetchAllVariantProducts") {
    fetchAllVariantProducts(port);
  }
});

const variantProductCurPage = (port: chrome.runtime.Port) => {
  port.onMessage.addListener((message, _) => {
    message.variantProductCurPage.forEach((value: string) => {
      const xpathStatement = `//div[@id='container']//div[@class='content']//table/tbody//tr[td[@data-column='label' and .='${value}']]`;
      const trElement = document.evaluate(
        xpathStatement,
        document.body,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue as HTMLTableRowElement;
      if (trElement !== null) {
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
      }
    });
  });
};

const fetchAllVariantProducts = (port: chrome.runtime.Port) => {
  port.onMessage.addListener((message, _) => {
    const method = sessionStorage.getItem(extension_method) ?? "POST";
    var headers = JSON.parse(sessionStorage.getItem(extension_headers)!) ??  { "Content-Type": "application/x-www-form-urlencoded" };
    const params = sessionStorage.getItem(extension_params) ?? "";
    const payload = new URLSearchParams(sessionStorage.getItem(extension_payload) ?? "");
    payload.set("product-grid[_pager][_page]", "1");
    const url = (sessionStorage.getItem(extension_url) ?? "") + (params.length > 0 ? `?${params}` : "");

    fetchVariantProduct(url, headers, method, payload, message);
  });
};

const fetchVariantProduct = (url: string, headers: any, method: string, payload: any, message: any) => {
  fetch(url, { body: payload.toString(), method: method, headers: headers })
  .then((res) => {
    res
      .json()
      .then((res) => {
        if (url.includes("/datagrid/product-grid/load")) {
          res = JSON.parse(decodeURIComponent(res.data));
        }

        if (res.data.length > 0) {
          payload.set("product-grid[_pager][_page]", Number(payload.get("product-grid[_pager][_page]")) + 1);
          responseVariantProduct("processVariantProduct", res, url, headers, method, payload, message);
        }
      })
      .catch((err) => {
        console.log(
          "fetchVariantProduct | res.json() | error: ",
          err
        );
      });
  })
  .catch((err) => {
    console.log("fetchVariantProduct | error: ", err);
  });
}

const responseVariantProduct = (name: string, data: any, url: string, headers: any, method: string, payload: any, message: any) => {
  chrome.runtime.sendMessage({ name: name, data: data, input: message}, (_) => {
    setTimeout(() => fetchVariantProduct(url, headers, method, payload, message), 250);
  });
};
