import moment from "moment";
import { useEffect, useState } from "react";

const sessionInputDate = "input_date";
const localInputFormatDate = "input_format_date";
const formatDate = {
  ddmmyyyy: "DD/MM/yyyy",
  dmmyyyy: "D/MM/yyyy",
  ddmyyyy: "DD/M/yyyy",
  dmyyyy: "D/M/yyyy",
  ddmmyy: "DD/MM/yy",
  dmmyy: "D/MM/yy",
  ddmyy: "DD/M/yy",
  dmyy: "D/M/yy",

  mmddyyyy: "MM/DD/yyyy",
  mmdyyyy: "MM/D/yyyy",
  mddyyyy: "M/DD/yyyy",
  mdyyyy: "M/D/yyyy",
  mmddyy: "MM/DD/yy",
  mmdyy: "MM/D/yy",
  mddyy: "M/DD/yy",
  mdyy: "M/D/yy",

  yyyymmdd: "yyyy-MM-DD",
};

export default function CreatedProduct() {
  const [tabId, setTabId] = useState(0);
  const [inputDate, setInputDate] = useState<Date | undefined>(undefined);
  const [inputFormatDate, setInputFormatDate] = useState([
    "mmddyyyy",
    formatDate.mmddyyyy,
  ]);
  const [createdProducts, setCreatedProducts] = useState([]);
  const [totalCreatedProducts, setTotalCreatedProducts] = useState(0);

  const fetchCreatedProducts = (dateFormat: string) => {
    chrome.tabs.sendMessage(tabId, "getSessionStorage", (session) => {
      const result = session.data ? JSON.parse(session.data) : undefined;
      if (result!.data) {
        const data = [] as any;
        result.data.forEach((e: any) => {
          if (e.created === moment(inputDate).format(dateFormat)) {
            data.push(e);
          }
        });
        setCreatedProducts(data);
        chrome.tabs
          .connect(tabId, { name: "createdProductCurPage" })
          .postMessage(data);
      }
    });
  };

  const fetchTotalCreatedProducts = () => {
    const port = chrome.tabs.connect(tabId, {
      name: "fetchTotalCreatedProduct",
    });
    port.postMessage(moment(inputDate).format(formatDate.yyyymmdd));
    port.onMessage.addListener((message, _) => {
      setTotalCreatedProducts(message.totalRecords);
    });
  };

  const reset = () => {
    chrome.tabs.sendMessage(tabId, "reset");
    chrome.storage.session.remove(sessionInputDate);
    setInputDate(undefined);
    setCreatedProducts([]);
    setTotalCreatedProducts(0);
    setInputFormatDate(["mmddyyyy", formatDate.mmddyyyy]);
    (document.getElementById("created_product") as HTMLInputElement).value = "";
  };

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      const tabId = tabs[0].id ?? 0;
      setTabId(tabId);
      chrome.tabs.sendMessage(tabId, "reset");
    });

    chrome.storage.session.get(sessionInputDate, (session) => {
      if (Object.keys(session).length > 0) {
        setInputDate(session[sessionInputDate]);
      }
    });

    chrome.storage.local.get(localInputFormatDate, (local) => {
      if (Object.keys(local).length > 0) {
        setInputFormatDate(local[localInputFormatDate]);
      }
    });
  }, []);

  useEffect(() => {
    if (inputDate) {
      fetchCreatedProducts(inputFormatDate[1]);
      fetchTotalCreatedProducts();
    }
  }, [inputDate]);

  return (
    <table className="table align-middle">
      <tbody>
        <tr>
          <td className="text-start">
            <label>
              Created Products{" "}
              {inputDate &&
                `on ${moment(inputDate).format(inputFormatDate[1])}`}
            </label>
          </td>
          <td>{Object.keys(createdProducts).length}</td>
        </tr>
        <tr>
          <td className="text-start">
            <label>
              Total Created Products{" "}
              {inputDate &&
                `on ${moment(inputDate).format(inputFormatDate[1])}`}
            </label>
          </td>
          <td>{totalCreatedProducts}</td>
        </tr>
        <tr>
          <td colSpan={2}>
            <div className="row">
              <div className="my-auto text-start w-25">
                <label htmlFor="created_product" className="fw-bold">
                  Search{" "}
                </label>
              </div>
              <div className="w-75">
                <input
                  id="created_product"
                  className="form-control"
                  type="date"
                  onChange={(e) => setInputDate(new Date(e.target.value))}
                />
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td colSpan={2}>
            <div className="row">
              <div className="my-auto text-start w-25">
                <label htmlFor="format_date" className="fw-bold">
                  Format Date of Akeneo
                </label>
              </div>
              <div className="w-75 my-auto">
                <select
                  id="format_date"
                  value={inputFormatDate[0]}
                  className="form-select"
                  data-toggle="tooltip"
                  data-html="true"
                  title="Select date format of Akeneo to make tools works exactly"
                  onChange={(e) => {
                    const newFormat = [
                      e.target.value,
                      formatDate[e.target.value],
                    ];
                    fetchCreatedProducts(newFormat[1]);
                    setInputFormatDate(newFormat);
                    chrome.storage.local.set({
                      [localInputFormatDate]: newFormat,
                    });
                  }}
                >
                  {Object.keys(formatDate).map((e: any) => (
                    <option value={e}>{formatDate[e]}</option>
                  ))}
                </select>
                <small className="text-muted">Default: MM/DD/yyyy</small>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td colSpan={3}>
            <div className="row row-cols-auto flex-row justify-content-evenly">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={reset}
              >
                Reset
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
