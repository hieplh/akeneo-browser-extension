import { useEffect, useState } from "react";

const sessionInputFamily = "input_family";
const tabConnectFamilyProductCurPage = "familyProductCurPage";

const colorFamilyProduct = "#90ee90";
const colorHiddenFamilyProduct = "#c6def3";

export default function FamilyProduct() {
  const [inputFamily, setInputFamily] = useState("");
  const [previousInputFamily, setPreviousInputFamily] = useState("");
  const [listFamily, setListFamily] = useState({});
  const [previousListFamily, setPreviousListFamily] = useState<{} | []>({});
  const [familyProduct, setFamilyProduct] = useState([]);
  const [familyHiddenProduct, setFamilyHiddenProduct] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [tabId, setTabId] = useState(0);
  const [page, setPage] = useState(0);
  const [locale, setLocale] = useState("");

  const fetchLocale = (session: any) => {
    if (session) {
      const sessionLocale =
        session.params.length > 0 ? session.params : "dataLocale=en_US";
      if (locale.length === 0 || !sessionLocale.includes(locale)) {
        setLocale(
          new URLSearchParams(sessionLocale).get("dataLocale") ?? "en_US"
        );
      }
    }
  };

  const fetchListFamily = () => {
    const port = chrome.tabs.connect(tabId, { name: "fetchListFamily" });
    port.postMessage({ input: inputFamily, page: page });
    port.onMessage.addListener((message, _) => {
      if (Array.isArray(message)) {
        setPreviousListFamily([]);
        return;
      }
      const arrJson = Object.values(message);
      const pairFamily = {};
      arrJson.forEach((json: any) => {
        const code = json.code;
        const value =
          Object.keys(json.labels).length > 0 && json.labels[locale]
            ? json.labels[locale]
            : `[${json.code}]`;
        pairFamily[code] = value;
      });
      setListFamily((e: any) => Object.assign(pairFamily, e));
    });
  };

  const fetchFamilyProduct = (input: string | null) => {
    chrome.tabs.sendMessage(tabId, "getSessionStorage", (session) => {
      if (session) {
        const result = session.data ? JSON.parse(session.data) : undefined;
        if (result!.data) {
          const data = [] as any;
          if (input === null) {
            result!.data.forEach((e: any) => {
              if (e.family === input) {
                data.push(e);
              }
            });
            setFamilyHiddenProduct(data);
            chrome.tabs
              .connect(tabId, { name: tabConnectFamilyProductCurPage })
              .postMessage({
                state: "hidden_family",
                data: data,
                color: colorHiddenFamilyProduct,
              });
          } else if (input.length > 0) {
            result!.data.forEach((e: any) => {
              if (
                e.family !== null &&
                e.family.toUpperCase() === input.toUpperCase()
              ) {
                data.push(e);
              }
            });
            setFamilyProduct(data);
            chrome.tabs
              .connect(tabId, { name: tabConnectFamilyProductCurPage })
              .postMessage({
                state: "family",
                data: data,
                color: colorFamilyProduct,
              });
          }
        }
      }
    });
  };

  const fetchTotalFamilyProduct = () => {
    const port = chrome.tabs.connect(tabId, {
      name: "fetchTotalFamilyProduct",
    });
    port.postMessage(
      Object.keys(listFamily).length > 0
        ? Object.keys(listFamily).find(
            (key) => listFamily[key] === inputFamily
          ) ?? inputFamily
        : inputFamily
    );
    port.onMessage.addListener((message, _) => {
      setTotalRecords(message.totalRecords);
    });
  };

  const reset = () => {
    chrome.tabs.sendMessage(tabId, "reset");
    setFamilyProduct([]);
    setTotalRecords(0);
    setPreviousListFamily({});
    chrome.storage.session.remove(sessionInputFamily);
  };

  const getKey = (input: string): string => {
    return Object.keys(listFamily).length > 0
      ? Object.keys(listFamily).find((key) => listFamily[key] === input) ??
          input
      : input;
  };

  const getLabel = (input: string): string => {
    return listFamily[input] ?? input;
  };

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      setTabId(tabs[0].id ?? 0);
    });
  }, []);

  useEffect(() => {
    if (tabId !== 0) {
      chrome.tabs.sendMessage(tabId, "reset");
      fetchFamilyProduct(null);
      chrome.tabs.sendMessage(tabId, "getSessionStorage", (session) => {
        fetchLocale(session);
      });
    }
  }, [tabId]);

  useEffect(() => {
    if (locale.length > 0) {
      chrome.storage.session.get(sessionInputFamily, (session) => {
        if (Object.keys(session).length > 0) {
          setPreviousInputFamily(session[sessionInputFamily]);
          setInputFamily(session[sessionInputFamily]);
        } else {
          fetchTotalFamilyProduct();
          setPage(1);
        }
      });
    }
  }, [locale]);

  useEffect(() => {
    if (inputFamily !== previousInputFamily) {
      if (page !== 1) {
        setPage(1);
      } else {
        fetchListFamily();
      }
    }
    if (inputFamily.length > 0) {
      setPreviousInputFamily(inputFamily);
      fetchFamilyProduct(null);
      fetchFamilyProduct(getLabel(inputFamily));
      fetchTotalFamilyProduct();
      chrome.storage.session.set({ [sessionInputFamily]: inputFamily });
    }
  }, [inputFamily]);

  useEffect(() => {
    if (page > 0) {
      if (!Array.isArray(previousListFamily)) {
        fetchListFamily();
      }
    }
  }, [page]);

  return (
    <table className="table align-middle">
      <tbody>
        <tr>
          <td
            className="text-start"
            style={{ backgroundColor: colorFamilyProduct }}
          >
            <label>Family {inputFamily} on this page</label>
          </td>
          <td style={{ backgroundColor: colorFamilyProduct }}>
            {familyProduct.length}
          </td>
        </tr>
        <tr>
          <td
            className="text-start"
            style={{ backgroundColor: colorHiddenFamilyProduct }}
          >
            <label>Family hidden on this page</label>
          </td>
          <td style={{ backgroundColor: colorHiddenFamilyProduct }}>
            {familyHiddenProduct.length}
          </td>
        </tr>
        <tr>
          <td className="text-start">
            <label>Total Family {inputFamily}</label>
          </td>
          <td>{totalRecords}</td>
        </tr>
        <tr>
          <td colSpan={2}>
            <div className="row row-cols-auto flex-row justify-content-evenly">
              <label htmlFor="family_product" className="my-auto fw-bold">
                Search{" "}
              </label>
              <input
                id="family_product"
                list="familylistOptions"
                className="form-control"
                style={{ width: "inherit" }}
                defaultValue={inputFamily}
                placeholder="Type family to search..."
                onChange={(e) => {
                  const value = e.target.value;
                  const key =
                    Object.keys(listFamily).length > 0
                      ? Object.keys(listFamily).find(
                          (key) => listFamily[key] === value
                        ) ?? value
                      : value;
                  reset();
                  setInputFamily(key);
                }}
              />
              <br />
              <div
                id="familylistOptions"
                className="overflow-y-auto mt-2"
                style={{ maxHeight: 200 }}
                onScroll={(e) => {
                  const { scrollHeight, scrollTop, clientHeight }: any =
                    e.target;
                  if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
                    setPage((e) => e + 1);
                  }
                }}
              >
                <ul className="text-start">
                  {Object.keys(listFamily).length > 0 &&
                    Object.entries(listFamily).map((e) => (
                      <li
                        key={e[0]}
                        role="button"
                        className="list-group-item"
                        onMouseEnter={(e) =>
                          ((e.target as HTMLDivElement).style.backgroundColor =
                            "#cccccc")
                        }
                        onMouseLeave={(e) =>
                          ((e.target as HTMLDivElement).style.backgroundColor =
                            "")
                        }
                        onClick={(e) => {
                          const div = e.target as HTMLDivElement;
                          const key = (div.firstChild as HTMLInputElement)
                            .value;
                          const text = div.textContent ?? "";
                          if (key !== inputFamily) {
                            reset();
                            (
                              document.getElementById(
                                "family_product"
                              ) as HTMLInputElement
                            ).value = text;
                            setInputFamily(key);
                          } else {
                            (
                              document.getElementById(
                                "family_product"
                              ) as HTMLInputElement
                            ).value = text;
                            fetchFamilyProduct(text);
                            fetchTotalFamilyProduct();
                          }
                        }}
                      >
                        <div className="text-wrap" style={{ minHeight: 30 }}>
                          <input type="hidden" value={e[0]} />
                          {e[1] as string}
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td colSpan={2}>
            <div className="row row-cols-auto flex-row justify-content-evenly">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  (
                    document.getElementById(
                      "family_product"
                    ) as HTMLInputElement
                  ).value = "";
                  reset();
                  setInputFamily("");
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
