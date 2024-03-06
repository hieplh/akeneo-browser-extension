import { useEffect, useState } from "react";

export default function ProductFilters() {
  const [tabId, setTabId] = useState(0);
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState("");
  const [data, setData] = useState<{}>({});
  const [params, setParams] = useState("");
  const [payload, setPayload] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [singleCompleteVariants, setSingleCompleteVariants] = useState<
    string[]
  >([]);
  const [totalSingleCompleteVariants, setTotalSingleCompleteVariants] =
    useState(0);

  const countAllSingleCompleteVariants = () => {
    chrome.storage.session.get("total_single_complete_variants", (session) => {
      if (Object.keys(session).length > 0) {
        setTotalSingleCompleteVariants(session.total_single_complete_variants);
      } else {
        chrome.tabs
          .connect(tabId, { name: "fetchAllSingleCompleteVariants" })
          .postMessage("");
      }
    });
  };

  const highlightSingleCompleteVariants = () => {
    chrome.tabs.connect(tabId, { name: "singleCompleteVariants" }).postMessage({
      state: "change_background",
      singleCompleteVariants: singleCompleteVariants,
    });
  };

  const unhighlightSingleCompleteVariants = () => {
    chrome.tabs.connect(tabId, { name: "singleCompleteVariants" }).postMessage({
      state: "reset",
      singleCompleteVariants: singleCompleteVariants,
    });
  };

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      const tabId = tabs[0].id ?? 0;
      setTabId(tabId);

      chrome.runtime.onConnect.addListener((port) => {
        if (port.name === "processSingleCompleteVariants") {
          port.onMessage.addListener((message, port) => {
            message.data.forEach((item: any) => {
              if (
                !Array.isArray(item.complete_variant_products) &&
                item.complete_variant_products.total === 1 &&
                item.complete_variant_products.complete === 1
              ) {
                setTotalSingleCompleteVariants((e) => e + 1);
              }
            });
          });
        }
      });

      chrome.tabs.sendMessage(tabId, "getSessionStorage", (session) => {
        const result = session.data ? JSON.parse(session.data) : undefined;
        const url = session!.url ?? "";
        const headers = session!.headers ?? "";
        const data = result!.data ?? {};
        const params = session!.params ?? "";
        const payload = session!.payload ?? "";
        const totalRecords = result!.totalRecords ?? 0;

        setUrl(url);
        setHeaders(headers);
        setData(data);
        setParams(params);
        setPayload(payload);
        setTotalRecords(totalRecords);
      });
    });
  }, []);

  useEffect(() => {
    if (Object.keys(data).length !== 0) {
      const tmp = [] as string[];
      (data as any).forEach((item: any) => {
        if (
          !Array.isArray(item.complete_variant_products) &&
          item.complete_variant_products.total === 1 &&
          item.complete_variant_products.complete === 1
        ) {
          tmp.push(item.identifier);
        }
      });
      setSingleCompleteVariants(tmp);
      countAllSingleCompleteVariants();
    }
  }, [data]);

  useEffect(() => {
    if (totalSingleCompleteVariants > 0) {
      chrome.storage.session.get(
        "total_single_complete_variants",
        (session: any) => {
          chrome.storage.session.set({
            total_single_complete_variants: totalSingleCompleteVariants,
          });
        }
      );
    }
  }, [totalSingleCompleteVariants]);

  useEffect(() => {
    if (singleCompleteVariants.length !== 0) {
      highlightSingleCompleteVariants();
    }
  }, [singleCompleteVariants]);

  return (
    <table className="table align-middle" style={{ width: 200 }}>
      <tbody>
        <tr>
          <th scope="row">Variant products 1/1 on this page</th>
          <td>{singleCompleteVariants.length}</td>
        </tr>
        <tr>
          <th scope="row">Variant products 1/1 on all pages</th>
          <td>{totalSingleCompleteVariants}</td>
        </tr>
        <tr>
          <th scope="row">Total Products</th>
          <td>{totalRecords}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td>
            <button type="button" onClick={highlightSingleCompleteVariants}>
              Hightlight
            </button>
          </td>
          <td>
            <button type="button" onClick={unhighlightSingleCompleteVariants}>
              Reset
            </button>
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
