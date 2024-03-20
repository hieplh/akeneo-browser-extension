import { useEffect, useState } from "react";

const sessionInputQualityScore = "input_quality_score";
const qualityScore = {
  1: "A",
  2: "B",
  3: "C",
  4: "D",
  5: "E",
};
const colorQualityScoreProduct = "#90ee90";
const colorNullQualityScoreProduct = "#c6def3";

export default function QualityInsightScoreProduct() {
  const [tabId, setTabId] = useState(0);
  const [inputQualityScore, setInputQualityScore] = useState<
    number | undefined
  >(undefined);
  const [qualityScoreProducts, setQualityScoreProducts] = useState([]);
  const [nullQualityScoreProducts, setNullQualityScoreProducts] = useState([]);
  const [totalQualityScoreProducts, setTotalQualityScoreProducts] = useState(0);

  const fetchQualityScoreProduct = (input: string) => {
    chrome.tabs.sendMessage(tabId, "getSessionStorage", (session) => {
      if (session) {
        const result = session.data ? JSON.parse(session.data) : undefined;
        if (result!.data) {
          const data = [] as any;
          result!.data.forEach((e: any) => {
            if (e.data_quality_insights_score === input) {
              data.push(e);
            }
          });
          if (input === "N/A") {
            setNullQualityScoreProducts(data);
          } else {
            setQualityScoreProducts(data);
          }

          chrome.tabs
            .connect(tabId, { name: "qualityScoreProductCurPage" })
            .postMessage({
              data: data,
              color:
                input === "N/A"
                  ? colorNullQualityScoreProduct
                  : colorQualityScoreProduct,
            });
        }
      }
    });
  };

  const fetchTotalQualityScoreProduct = () => {
    const port = chrome.tabs.connect(tabId, {
      name: "fetchTotalQualityScoreProduct",
    });
    port.postMessage(inputQualityScore);
    port.onMessage.addListener((message, _) => {
      setTotalQualityScoreProducts(message.totalRecords);
    });
  };

  const reset = () => {
    chrome.tabs.sendMessage(tabId, "reset");
    setInputQualityScore(undefined);
    setQualityScoreProducts([]);
    setNullQualityScoreProducts([]);
    setTotalQualityScoreProducts(0);
    chrome.storage.session.remove(sessionInputQualityScore);
  };

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      setTabId(tabs[0].id ?? 0);
    });
  }, []);

  useEffect(() => {
    if (tabId !== 0) {
      if (tabId) {
        chrome.tabs.sendMessage(tabId, "reset");
        chrome.storage.session.get(sessionInputQualityScore, (session) => {
          if (Object.keys(session).length > 0) {
            setInputQualityScore(session[sessionInputQualityScore]);
          } else {
            fetchQualityScoreProduct("N/A");
            (
              document.getElementById("quality_score") as HTMLInputElement
            ).value = "";
          }
        });
      }
    }
  }, [tabId]);

  useEffect(() => {
    if (inputQualityScore) {
      chrome.tabs.sendMessage(tabId, "reset");
      fetchQualityScoreProduct("N/A");
      fetchQualityScoreProduct(qualityScore[inputQualityScore]);
      fetchTotalQualityScoreProduct();
      chrome.storage.session.set({
        [sessionInputQualityScore]: inputQualityScore,
      });
    }
  }, [inputQualityScore]);

  return (
    <table className="table align-middle">
      <tbody>
        <tr>
          <td
            className="text-start"
            style={{ backgroundColor: colorQualityScoreProduct }}
          >
            <label>
              Quality Score{" "}
              {inputQualityScore && qualityScore[inputQualityScore]} on this
              page
            </label>
          </td>
          <td style={{ backgroundColor: colorQualityScoreProduct }}>
            {qualityScoreProducts.length}
          </td>
        </tr>
        <tr>
          <td
            className="text-start"
            style={{ backgroundColor: colorNullQualityScoreProduct }}
          >
            <label>Quality N/A on this page</label>
          </td>
          <td style={{ backgroundColor: colorNullQualityScoreProduct }}>
            {nullQualityScoreProducts.length}
          </td>
        </tr>
        <tr>
          <td className="text-start">
            <label>
              Total Quality Score{" "}
              {inputQualityScore && qualityScore[inputQualityScore]}
            </label>
          </td>
          <td>{totalQualityScoreProducts}</td>
        </tr>
        <tr>
          <td colSpan={2} className="text-start">
            <div className="row">
              <div className="my-auto text-start w-25">
                <label htmlFor="quality_score" className="fw-bold">
                  Search{" "}
                </label>
              </div>
              <div className="w-75">
                <select
                  id="quality_score"
                  value={inputQualityScore}
                  className="form-select"
                  onChange={(e) => setInputQualityScore(Number(e.target.value))}
                >
                  {Object.keys(qualityScore).map((e: any) => (
                    <option value={e}>{qualityScore[e]}</option>
                  ))}
                </select>
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
                    document.getElementById("quality_score") as HTMLInputElement
                  ).value = "";
                  reset();
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
