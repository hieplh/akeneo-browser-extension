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
    setStatus("")
    setData([]);
    setTotalStatus(0);
  };

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      setTabId(tabs[0].id ?? 0);
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
      reset();
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
          <td className="text-start">Status {status} on this page</td>
          <td>{data.length}</td>
        </tr>
        <tr>
          <td className="text-start">Total Status {status}</td>
          <td>{totalStatus}</td>
        </tr>
        <tr>
          <td colSpan={2}>
            <div className="row row-cols-auto flex-row justify-content-evenly">
              <button
                type="button"
                className={
                  status === constantStatusDisable
                    ? "btn btn-danger"
                    : "btn btn-outline-danger"
                }
                onClick={() => setStatus(constantStatusDisable)}
              >
                Disable
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {reset(); setStatus("")}}
              >
                Reset
              </button>
              <button
                type="button"
                className={
                  status === constantStatusEnable
                    ? "btn btn-success"
                    : "btn btn-outline-success"
                }
                onClick={() => setStatus(constantStatusEnable)}
              >
                Enable
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
