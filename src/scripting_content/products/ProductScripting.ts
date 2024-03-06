(function () {
  const XHR = XMLHttpRequest.prototype;

  const open = XHR.open;
  const send = XHR.send;
  const setRequestHeader = XHR.setRequestHeader;

  XHR.open = function (this: any, method: string, url: string) {
    this._method = method;
    this._url = url;
    this._requestHeaders = {};
    this._startTime = new Date().toISOString();

    return open.apply(this, arguments as any);
  };

  XHR.setRequestHeader = function (this: any, header: string, value: string) {
    this._requestHeaders[header] = value;
    return setRequestHeader.apply(this, arguments as any);
  };

  XHR.send = function (
    this: any,
    postData?: Document | XMLHttpRequestBodyInit | null
  ) {
    this.addEventListener("load", function (this: any) {
      const arrUrl = this._url.split("?");
      const url = arrUrl[0];
      const params = arrUrl.length > 1 ? arrUrl[1] : "";
      if (url) {
        if (this.responseType !== "blob" && this.responseText) {
          try {
            if (
              url === "/datagrid/product-grid/load" ||
              url === "/datagrid/product-grid"
            ) {
              sessionStorage.setItem("extension_url", url);
              sessionStorage.setItem("extension_headers", JSON.stringify(this._requestHeaders));
              sessionStorage.setItem("extension_method", this._method);
              sessionStorage.setItem("extension_params", params);
              sessionStorage.setItem("extension_data", this.responseText);
              if (url === "/datagrid/product-grid/load") {
                sessionStorage.setItem("extension_data", JSON.parse(this.responseText).data);
              }
            }
          } catch (err) {
            console.log("Error in responseType try catch");
            console.log(err);
          }
        }

        if (postData) {
          if (typeof postData === "string") {
            const item = sessionStorage.getItem("extension_url");
            if (item === url) {
              sessionStorage.setItem("extension_payload", postData);
            }
          }
        }
      }
    });

    return send.apply(this, arguments as any);
  };
})();
