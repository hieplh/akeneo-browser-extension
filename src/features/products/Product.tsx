import { useState, Suspense, lazy } from "react";

const FamilyProduct = lazy(() => import("./filters/FamilyProduct"));
const StatusProduct = lazy(() => import("./filters/StatusProduct"));
const CompleteProduct = lazy(() => import("./filters/CompleteProduct"));
const CreatedProduct = lazy(() => import("./filters/CreatedProduct"));
const VariantProduct = lazy(() => import("./filters/VariantProduct"));
const QualityScoreProduct = lazy(() => import("./filters/QualityInsightScoreProduct"));

export default function Product() {
  const [filter, setFilter] = useState(0);

  const displayFilter = (value: number) => {
    setFilter(value);
  };

  const buttonEnable = (value: number): string => {
    if (filter === value) {
      return "btn btn-secondary";
    } else {
      return "btn btn-outline-secondary";
    }
  }

  return (
    <div style={{ minWidth: 350 }} className="container text-center">
      <div className="row row-cols-auto flex-row justify-content-evenly gy-2 mt-1 mb-2">
        <button type="button" className={`col ${buttonEnable(1)} text-black`} onClick={() => displayFilter(1)}>Family</button>
        <button type="button" className={`col ${buttonEnable(2)} text-black`} onClick={() => displayFilter(2)}>Status</button>
        <button type="button" className={`col ${buttonEnable(3)} text-black`} onClick={() => displayFilter(3)}>Complete</button>
        <button type="button" className={`col ${buttonEnable(4)} text-black`} onClick={() => displayFilter(4)}>Created</button>
        <button type="button" className={`col ${buttonEnable(5)} text-black`} onClick={() => displayFilter(5)}>Variant products</button>
        <button type="button" className={`col ${buttonEnable(6)} text-black`} onClick={() => displayFilter(6)}>Quality score</button>
      </div>
      <div>
        <Suspense fallback={<p>Loading...</p>}>
          {(() => {
            switch (filter) {
              case 1:
                return <FamilyProduct />
              case 2:
                return <StatusProduct />
              case 3:
                return <CompleteProduct />
              case 4:
                return <CreatedProduct />
              case 5:
                return <VariantProduct />;
              case 6:
                return <QualityScoreProduct />;
              default:
                return <p>Select button above to using this feature</p>;
            }
          })()}
        </Suspense>
      </div>
    </div>
  );
}