import { useEffect, useState } from "react";

const sessionInputStatus = "input_status";

const constantStatusEnable = "Enable";
const constantStatusDisable = "Disable";

export default function StatusProduct() {
  const [status, setStatus] = useState("");
  const [data, setData] = useState([]);
  const [totalStatus, setTotalStatus] = useState(0);
  const [tabId, setTabId] = useState(0);

  const fetchData = () => {
    chrome.tabs.sendMessage(tabId, "getSessionStorage", (session) => {
      const result = session!.data ? JSON.parse(session.data) : undefined;
      if (result!.data) {
        const data = [] as any;
        const isEnable = status === constantStatusEnable ? true : false;
        result!.data.forEach((e: any) => {
          if (e.enabled === isEnable) {
            data.push(e);
          }
        });
        setData(data);
      }
    });
  };

  const fetchTotalStatus = () => {
    const port = chrome.tabs.connect(tabId, { name: "fetchTotalStatus" });
    port.postMessage(status);
    port.onMessage.addListener((message, _) => {
      setTotalStatus(message);
    });
  };

  const reset = () => {
    chrome.tabs.sendMessage(tabId, "reset");
    setStatus("");
    setData([]);
    setTotalStatus(0);
  };

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      const tabId = tabs[0].id ?? 0;
      setTabId(tabId);
      chrome.tabs.sendMessage(tabId, "reset");
    });

    chrome.storage.session.get(sessionInputStatus, (session) => {
      if (Object.keys(session).length > 0) {
        setStatus(session[sessionInputStatus]);
      } else {
        setStatus(constantStatusEnable);
      }
    });
  }, []);

  useEffect(() => {
    if (status.length > 0) {
      chrome.storage.session.set({ [sessionInputStatus]: status });
      fetchData();
      fetchTotalStatus();
    }
  }, [status]);

  useEffect(() => {
    if (data.length > 0) {
      chrome.tabs
        .connect(tabId, { name: "statusProductCurPage" })
        .postMessage({ state: "highlight", data: data });
    }
  }, [data]);

  return (
    <table className="table align-middle">
      <tbody>
        <tr>
          <td className="text-start">
            <label>Status {status} on this page</label>
          </td>
          <td>{data.length}</td>
        </tr>
        <tr>
          <td className="text-start">
            <label>Total Status {status}</label>
          </td>
          <td>{totalStatus}</td>
        </tr>
        <tr>
          <td colSpan={2}>
            <div className="row row-cols-auto flex-row justify-content-evenly">
              <div className="my-auto text-start w-25">
                <label htmlFor="complete_product" className="fw-bold">
                  Status
                </label>
              </div>
              <div className="w-75 row row-cols-auto flex-row justify-content-evenly">
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="status_disable"
                    name="status"
                    value={constantStatusDisable}
                    checked={status === constantStatusDisable}
                    onClick={() => {
                      reset();
                      setStatus(constantStatusDisable);
                    }}
                  />
                  <label className="form-check-label" htmlFor="status_disable">
                    Disable
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="status_enable"
                    name="status"
                    value={constantStatusEnable}
                    checked={status === constantStatusEnable}
                    onClick={() => {
                      reset();
                      setStatus(constantStatusEnable);
                    }}
                  />
                  <label className="form-check-label" htmlFor="status_enable">
                    Enable
                  </label>
                </div>
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
                onClick={() => {
                  reset();
                  setStatus("");
                }}
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
