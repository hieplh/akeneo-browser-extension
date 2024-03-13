import { useState, Suspense, lazy } from "react";

const StatusProduct = lazy(() => import("./filters/StatusProduct"));
const VariantProduct = lazy(() => import("./filters/VariantProduct"));

export default function Product() {
  const [filter, setFilter] = useState(0);

  const displayFilter = (value: number) => {
    setFilter(value);
  };

  return (
    <div style={{ width: 350 }} className="container text-center">
      <div className="row row-cols-auto flex-row justify-content-evenly gy-2 my-1">
        <button type="button" className="col" onClick={() => displayFilter(1)}>Family</button>
        <button type="button" className="col" onClick={() => displayFilter(2)}>Status</button>
        <button type="button" className="col" onClick={() => displayFilter(3)}>Complete</button>
        <button type="button" className="col" onClick={() => displayFilter(4)}>Created</button>
        <button type="button" className="col" onClick={() => displayFilter(5)}>
          Variant products
        </button>
        <button type="button">Quality score</button>
      </div>
      <div>
        <Suspense fallback={<p>Loading...</p>}>
          {(() => {
            switch (filter) {
              case 2:
                return <StatusProduct />
              case 5:
                return <VariantProduct />;
              default:
                return <p>Select button above to using this feature</p>;
            }
          })()}
        </Suspense>
      </div>
    </div>
  );
}