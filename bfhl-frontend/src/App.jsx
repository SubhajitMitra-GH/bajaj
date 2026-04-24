import { useState } from "react";
import "./App.css";

export default function App() {
  const [input, setInput] = useState(
`["A->B","A->C","B->D","C->E","E->F",
"X->Y","Y->Z","Z->X",
"P->Q","Q->R",
"G->H","G->H","G->I",
"hello","1->2","A->"]`
  );

  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setData(null);

    try {
      const parsed = JSON.parse(input);

      const res = await fetch("http://localhost:3000/bfhl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: parsed }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setData(json);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app">
      <h1>Hierarchy Builder</h1>

      {/* INPUT */}
      <div className="input-box">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={handleSubmit}>Submit</button>
      </div>

      {error && <div className="error">{error}</div>}

      {data && (
        <>
          {/* SUMMARY */}
          <div className="summary">
            <div>
              <span>Trees</span>
              <h3>{data.summary.total_trees}</h3>
            </div>
            <div>
              <span>Cycles</span>
              <h3>{data.summary.total_cycles}</h3>
            </div>
            <div>
              <span>Largest Root</span>
              <h3>{data.summary.largest_tree_root}</h3>
            </div>
          </div>

          {/* TREE CARDS */}
          <div className="grid">
            {data.hierarchies.map((h, i) => (
              <div className="card" key={i}>
                <h3>Root: {h.root}</h3>

                {h.has_cycle ? (
                  <p className="cycle">⚠ Cycle detected</p>
                ) : (
                  <>
                    <Tree node={h.tree[h.root]} />
                    <p className="depth">Depth: {h.depth}</p>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* BADGES */}
          <div className="badge-section">
            <h4>Invalid Entries</h4>
            <div className="badges">
              {data.invalid_entries.map((x, i) => (
                <span key={i} className="badge red">{x}</span>
              ))}
            </div>
          </div>

          <div className="badge-section">
            <h4>Duplicate Edges</h4>
            <div className="badges">
              {data.duplicate_edges.map((x, i) => (
                <span key={i} className="badge yellow">{x}</span>
              ))}
            </div>
          </div>

          {/* 🔥 RAW JSON OUTPUT */}
          <div className="json-box">
            <h2>Raw JSON Response</h2>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        </>
      )}
    </div>
  );
}

function Tree({ node }) {
  if (!node) return null;

  return (
    <div className="tree">
      {Object.entries(node).map(([key, val]) => (
        <div key={key}>
          <div className="node">{key}</div>
          <Tree node={val} />
        </div>
      ))}
    </div>
  );
}