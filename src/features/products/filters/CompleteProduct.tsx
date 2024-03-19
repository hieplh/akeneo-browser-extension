import { useEffect, useState } from "react";

const sessionInputComplete = "input_complete";
const sessionCompleteness = "completeness";

const totalCompleteProduct = -1;
const completedProduct = 1;
const uncompletedProduct = 2;

const tabConnectCompleteProductCurPage = "completeProductCurPage";

const colorCompleteProduct = "#90ee90";
const colorNullCompleteProduct = "#c6def3";

export default function CompleteProduct() {
  const [tabId, setTabId] = useState(0);
  const [completeness, setCompleteness] = useState<number | undefined>(
    undefined
  );
  const [inputComplete, setInputComplete] = useState<number | undefined>(
    undefined
  );
  const [totalCompleteness, setTotalCompleteness] = useState(0);
  const [nullCompleteProducts, setNullCompleteProducts] = useState({});
  const [completeProducts, setCompleteProducts] = useState({});

  const fetchCompleteProduct = (input: number | null) => {
    chrome.tabs.sendMessage(tabId, "getSessionStorage", (session) => {
      if (session) {
        const result = session.data ? JSON.parse(session.data) : undefined;
        if (result!.data) {
          const data = [] as any;
          result!.data.forEach((e: any) => {
            if (e.completeness === input) {
              data.push(e);
            }
          });
          if (input === null) {
            setNullCompleteProducts(data);
          } else {
            setCompleteProducts(data);
          }

          chrome.tabs
            .connect(tabId, { name: tabConnectCompleteProductCurPage })
            .postMessage({
              data: data,
              color:
                input === null
                  ? colorNullCompleteProduct
                  : colorCompleteProduct,
            });
        }
      }
    });
  };

  const reset = () => {
    (document.getElementById("complete_product") as HTMLInputElement).value = "";
    chrome.storage.session.remove(sessionInputComplete);
    chrome.tabs.sendMessage(tabId, "reset");
    setCompleteProducts({});
    setNullCompleteProducts({});
    setCompleteness(totalCompleteProduct);
    setInputComplete(undefined);
  };

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      setTabId(tabs[0].id ?? 0);
    });
  }, []);

  useEffect(() => {
    if (tabId) {
      chrome.tabs.sendMessage(tabId, "reset");
      chrome.storage.session.get(sessionInputComplete, (session) => {
        if (Object.keys(session).length > 0) {
          setInputComplete(session[sessionInputComplete]);
        } else {
          fetchCompleteProduct(null);
        }
      });
      chrome.storage.session.get(sessionCompleteness, (session) => {
        if (Object.keys(session).length > 0) {
          setCompleteness(session[sessionCompleteness]);
        } else {
          setCompleteness(totalCompleteProduct);
        }
      });
    }
  }, [tabId]);

  useEffect(() => {
    if (typeof inputComplete === "number") {
      chrome.tabs.sendMessage(tabId, "reset");
      chrome.storage.session.set({ [sessionInputComplete]: inputComplete });
      fetchCompleteProduct(inputComplete);
      fetchCompleteProduct(null);
    }
  }, [inputComplete]);

  useEffect(() => {
    if (completeness) {
      chrome.storage.session.set({ [sessionCompleteness]: completeness });
      const port = chrome.tabs.connect(tabId, {
        name: "fetchTotalCompleteProduct",
      });
      port.postMessage(completeness);
      port.onMessage.addListener((message, _) => {
        setTotalCompleteness(message.totalRecords);
      });
    }
  }, [completeness]);

  return (
    <>
      <table className="table align-middle">
        <tbody>
          <tr>
            <td
              className="text-start"
              style={{ backgroundColor: colorCompleteProduct }}
            >
              <label>
                Complete {typeof inputComplete === 'number' && `${inputComplete}%`} on this page
              </label>
            </td>
            <td style={{ backgroundColor: colorCompleteProduct }}>
              {Object.keys(completeProducts).length}
            </td>
          </tr>
          <tr>
            <td
              className="text-start"
              style={{ backgroundColor: colorNullCompleteProduct }}
            >
              <label>Complete N/A on this page</label>
            </td>
            <td style={{ backgroundColor: colorNullCompleteProduct }}>
              {Object.keys(nullCompleteProducts).length}
            </td>
          </tr>
          <tr>
            <td colSpan={2}>
              <div className="row">
                <div className="my-auto text-start w-25">
                  <label htmlFor="complete_product" className="fw-bold">
                    Search{" "}
                  </label>
                </div>
                <div className="w-75">
                  <input
                    id="complete_product"
                    type="number"
                    min={0}
                    max={100}
                    className="form-control text-end"
                    defaultValue={inputComplete}
                    placeholder="Type 0-100 to search..."
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value && Number(value) >= 0 && Number(value) <= 100) {
                        setInputComplete(Number(value));
                      }
                    }}
                  />
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <table className="table align-middle">
        <tbody>
          <tr>
            <td colSpan={3}>
              <div className="row row-cols-auto flex-row justify-content-between">
                <label className="my-auto">
                  Total{" "}
                  {completeness === completedProduct
                    ? "completed"
                    : completeness === uncompletedProduct
                    ? "uncompleted"
                    : "all"}{" "}
                  products
                </label>
                <span>{totalCompleteness}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={2} className="text-start">
              <label className="my-auto fw-bold">Complete</label>
            </td>
            <td>
              <div
                className="row row-cols-auto flex-row justify-content-evenly"
                style={{ width: "max-content" }}
              >
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="complete_all"
                    name="complete"
                    value={totalCompleteProduct}
                    checked={completeness === totalCompleteProduct}
                    onClick={() => setCompleteness(totalCompleteProduct)}
                  />
                  <label className="form-check-label" htmlFor="complete_all">
                    All
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="complete_no"
                    name="complete"
                    value={uncompletedProduct}
                    checked={completeness === uncompletedProduct}
                    onClick={() => setCompleteness(uncompletedProduct)}
                  />
                  <label className="form-check-label" htmlFor="complete_no">
                    No
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="complete_yes"
                    name="complete"
                    value={completedProduct}
                    checked={completeness === completedProduct}
                    onClick={() => setCompleteness(completedProduct)}
                  />
                  <label className="form-check-label" htmlFor="complete_yes">
                    Yes
                  </label>
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
    </>
  );
}
