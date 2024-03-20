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

  if (message === "reset") {
    reset();
  }
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "variantProductCurPage") {
    variantProductCurPage(port);
  }

  if (port.name === "fetchAllVariantProducts") {
    fetchAllVariantProducts(port);
  }

  if (port.name === "fetchTotalStatus") {
    fetchTotalStatus(port);
  }

  if (port.name === "statusProductCurPage") {
    statusProductCurPage(port);
  }

  if (port.name === "fetchListFamily") {
    fetchListFamily(port);
  }

  if (port.name === "fetchTotalFamilyProduct") {
    fetchTotalFamilyProduct(port);
  }

  if (port.name === "familyProductCurPage") {
    familyProductCurPage(port);
  }

  if (port.name === "fetchTotalCompleteProduct") {
    fetchTotalCompleteProduct(port);
  }

  if (port.name === "completeProductCurPage") {
    completeProductCurPage(port);
  }

  if (port.name === "fetchTotalCreatedProduct") {
    fetchTotalCreatedProduct(port);
  }

  if (port.name === "createdProductCurPage") {
    createdProductCurPage(port);
  }

  if (port.name === "fetchTotalQualityScoreProduct") {
    fetchTotalQualityScoreProduct(port);
  }

  if (port.name === "qualityScoreProductCurPage") {
    qualityScoreProductCurPage(port);
  }
});

const reset = () => {
  const xpathStatement =
    "//div[@id='container']//div[@class='content']//table/tbody";
  const tbody = document.evaluate(
    xpathStatement,
    document.body,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue as HTMLTableRowElement;
  if (tbody !== null) {
    tbody.childNodes.forEach((tr: any) => {
      tr.style.backgroundColor = "";
    });
  }
};

const getExtensionMetric = (): any => {
  const url = sessionStorage.getItem(extension_url) ?? "";
  var headers = JSON.parse(sessionStorage.getItem(extension_headers)!) ?? {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  const method = sessionStorage.getItem(extension_method) ?? "POST";
  const params = sessionStorage.getItem(extension_params) ?? "";
  const payload = sessionStorage.getItem(extension_payload) ?? "";
  const data = sessionStorage.getItem(extension_data) ?? "";

  return {
    url: url,
    headers: headers,
    method: method,
    params: params,
    payload: payload,
    data: data,
  };
};

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
    const metric = getExtensionMetric();
    const method = metric.method;
    var headers = metric.headers;
    const params = metric.params;
    const payload = new URLSearchParams(metric.payload);
    payload.set("product-grid[_pager][_page]", "1");
    const url = metric.url + (params.length > 0 ? `?${params}` : "");

    fetchVariantProduct(url, headers, method, payload, message);
  });
};

const fetchVariantProduct = (
  url: string,
  headers: any,
  method: string,
  payload: any,
  message: any
) => {
  fetch(url, { body: payload.toString(), method: method, headers: headers })
    .then((res) => {
      res
        .json()
        .then((res) => {
          if (url.includes("/datagrid/product-grid/load")) {
            res = JSON.parse(decodeURIComponent(res.data));
          }

          if (res.data.length > 0) {
            payload.set(
              "product-grid[_pager][_page]",
              Number(payload.get("product-grid[_pager][_page]")) + 1
            );
            responseVariantProduct(
              "processVariantProduct",
              res,
              url,
              headers,
              method,
              payload,
              message
            );
          }
        })
        .catch((err) => {
          console.log("fetchVariantProduct | res.json() | error: ", err);
        });
    })
    .catch((err) => {
      console.log("fetchVariantProduct | error: ", err);
    });
};

const responseVariantProduct = (
  name: string,
  data: any,
  url: string,
  headers: any,
  method: string,
  payload: any,
  message: any
) => {
  chrome.runtime.sendMessage(
    { name: name, data: data, input: message },
    (_) => {
      setTimeout(
        () => fetchVariantProduct(url, headers, method, payload, message),
        250
      );
    }
  );
};

const fetchTotalStatus = (port: chrome.runtime.Port) => {
  port.onMessage.addListener((message, port) => {
    const metric = getExtensionMetric();
    const method = metric.method;
    var headers = metric.headers;
    const params = metric.params;
    const payload = new URLSearchParams(metric.payload);
    payload.set("product-grid[_pager][_page]", "1");
    payload.set(
      "product-grid[_filter][enabled][value]",
      message === "Enable" ? "1" : "0"
    );
    const url = metric.url + (params.length > 0 ? `?${params}` : "");

    fetch(url, {
      body: payload.toString(),
      method: method,
      headers: headers,
    }).then((res) => {
      res.json().then((res) => {
        if (url.includes("/datagrid/product-grid/load")) {
          res = JSON.parse(res.data);
        }

        if (res.data.length > 0) {
          port.postMessage(res.totalRecords);
        }
      });
    });
  });
};

const statusProductCurPage = (port: chrome.runtime.Port) => {
  port.onMessage.addListener((message, _) => {
    message.data.forEach((e: any) => {
      const xpathStatement = `//div[@id='container']//div[@class='content']//table/tbody//tr[td[@data-column='label' and .='${e.label}']]`;
      const trElement = document.evaluate(
        xpathStatement,
        document.body,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue as HTMLTableRowElement;
      if (trElement !== null) {
        switch (message.state) {
          case "highlight":
            switch (e.enabled) {
              case true:
                trElement.style.backgroundColor = "#90ee90";
                break;
              case false:
                trElement.style.backgroundColor = "#ffbac0";
                break;
            }
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

const fetchListFamily = (port: chrome.runtime.Port) => {
  port.onMessage.addListener((message, port) => {
    const metric = getExtensionMetric();
    const headers = metric.headers;

    const url = "/configuration/rest/family/";
    const sessionParams = new URLSearchParams(metric.params);
    const params = new URLSearchParams();
    params.set("options[expanded]", "0");
    params.set("options[limit]", "20");
    params.set("options[page]", message.page ? message.page.toString() : "1");
    params.set(
      "options[locale]",
      sessionParams.get("dataLocale") !== null
        ? sessionParams.get("dataLocale")!
        : "en_US"
    );
    params.set("search", message.input ?? "");

    fetch(url + "?" + params.toString(), {
      headers: headers,
      method: "GET",
    }).then((res: Response) => {
      res.json().then((data: any) => {
        port.postMessage(data);
      });
    });
  });
};

const fetchTotalFamilyProduct = (port: chrome.runtime.Port) => {
  port.onMessage.addListener((message, port) => {
    const metric = getExtensionMetric();
    const method = metric.method;
    const headers = metric.headers;
    const params = metric.params;
    const payload = new URLSearchParams(metric.payload);
    payload.set("product-grid[_pager][_page]", "1");
    payload.set(
      "product-grid[_filter][family][value][0]",
      message.startsWith("[") && message.endsWith("]")
        ? message.substring(1, message.length - 1)
        : message
    );
    payload.set("product-grid[_filter][family][type]", "in");
    const url = metric.url + (params.length > 0 ? `?${params}` : "");

    fetch(url, {
      body: payload.toString(),
      headers: headers,
      method: method,
    }).then((res) => {
      res.json().then((res: any) => {
        if (url.includes("/datagrid/product-grid/load")) {
          res = JSON.parse(res.data);
        }
        port.postMessage(res);
      });
    });
  });
};

const familyProductCurPage = (port: chrome.runtime.Port) => {
  port.onMessage.addListener((message, _) => {
    message.data.forEach((e: any) => {
      const xpathStatement = `//div[@id='container']//div[@class='content']//table/tbody//tr[td[@data-column='label' and .='${e.label}']]`;
      const trElement = document.evaluate(
        xpathStatement,
        document.body,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue as HTMLTableRowElement;
      if (trElement !== null) {
        trElement.style.backgroundColor = message.color;
      }
    });
  });
};

const fetchTotalCompleteProduct = (port: chrome.runtime.Port) => {
  port.onMessage.addListener((message, _) => {
    const metric = getExtensionMetric();
    const method = metric.method;
    const headers = metric.headers;
    const params = metric.params;
    const payload = new URLSearchParams(metric.payload);
    payload.set("product-grid[_pager][_page]", "1");
    if (message === 1 || message === 2) {
      payload.set(
        "product-grid[_filter][completeness][value]",
        message.toString()
      );
    }
    const url = metric.url + (params.length > 0 ? `?${params}` : "");

    fetch(url, {
      body: payload.toString(),
      headers: headers,
      method: method,
    }).then((res) => {
      res.json().then((res: any) => {
        if (url.includes("/datagrid/product-grid/load")) {
          res = JSON.parse(res.data);
        }
        port.postMessage(res);
      });
    });
  });
};

const completeProductCurPage = (port: chrome.runtime.Port) => {
  port.onMessage.addListener((message, _) => {
    message.data.forEach((e: any) => {
      const xpathStatement = `//div[@id='container']//div[@class='content']//table/tbody//tr[td[@data-column='label' and .='${e.label}']]`;
      const trElement = document.evaluate(
        xpathStatement,
        document.body,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue as HTMLTableRowElement;
      if (trElement !== null) {
        trElement.style.backgroundColor = message.color;
      }
    });
  });
};

const fetchTotalCreatedProduct = (port: chrome.runtime.Port) => {
  port.onMessage.addListener((message, _) => {
    const metric = getExtensionMetric();
    const method = metric.method;
    const headers = metric.headers;
    const params = metric.params;
    const payload = new URLSearchParams(metric.payload);
    payload.set("product-grid[_pager][_page]", "1");
    payload.set(
      "product-grid[_filter][created][value][start]",
      message
    );
    payload.set(
      "product-grid[_filter][created][value][end]",
      message
    );
    const url = metric.url + (params.length > 0 ? `?${params}` : "");

    fetch(url, {
      body: payload.toString(),
      headers: headers,
      method: method,
    }).then((res) => {
      res.json().then((res: any) => {
        if (url.includes("/datagrid/product-grid/load")) {
          res = JSON.parse(res.data);
        }
        port.postMessage(res);
      });
    });
  });
};

const createdProductCurPage = (port: chrome.runtime.Port) => {
  port.onMessage.addListener((message, _) => {
    message.forEach((e: any) => {
      const xpathStatement = `//div[@id='container']//div[@class='content']//table/tbody//tr[td[@data-column='label' and .='${e.label}']]`;
      const trElement = document.evaluate(
        xpathStatement,
        document.body,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue as HTMLTableRowElement;
      if (trElement !== null) {
        trElement.style.backgroundColor = "#90ee90";
      }
    });
  });
};

const fetchTotalQualityScoreProduct = (port: chrome.runtime.Port) => {
  port.onMessage.addListener((message, _) => {
    const metric = getExtensionMetric();
    const method = metric.method;
    const headers = metric.headers;
    const params = metric.params;
    const payload = new URLSearchParams(metric.payload);
    payload.set("product-grid[_pager][_page]", "1");
    payload.set(
      "product-grid[_filter][data_quality_insights_score][value][0]",
      message
    );
    const url = metric.url + (params.length > 0 ? `?${params}` : "");

    fetch(url, {
      body: payload.toString(),
      headers: headers,
      method: method,
    }).then((res) => {
      res.json().then((res: any) => {
        if (url.includes("/datagrid/product-grid/load")) {
          res = JSON.parse(res.data);
        }
        port.postMessage(res);
      });
    });
  });
};

const qualityScoreProductCurPage = (port: chrome.runtime.Port) => {
  port.onMessage.addListener((message, _) => {
    message.data.forEach((e: any) => {
      const xpathStatement = `//div[@id='container']//div[@class='content']//table/tbody//tr[td[@data-column='label' and .='${e.label}']]`;
      const trElement = document.evaluate(
        xpathStatement,
        document.body,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue as HTMLTableRowElement;
      if (trElement !== null) {
        trElement.style.backgroundColor = message.color;
      }
    });
  });
};
