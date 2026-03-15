const React = window.React;
const ReactDOM = window.ReactDOM;
const { useState, useEffect, useMemo } = React;

// ─── LAYOUT ENGINE ──────────────────────────────────────────────────────────
function layoutFlow(nodes, edges) {
  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = { ...n, children: [], parents: [] }; });
  edges.forEach(e => {
    if (nodeMap[e.from] && nodeMap[e.to]) {
      nodeMap[e.from].children.push(e.to);
      nodeMap[e.to].parents.push(e.from);
    }
  });
  const ranks = {};
  const visited = new Set();
  const queue = [{ id: nodes[0].id, rank: 0 }];
  while (queue.length) {
    const { id, rank } = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);
    ranks[id] = rank;
    (nodeMap[id]?.children || []).forEach(cid => {
      if (!visited.has(cid)) queue.push({ id: cid, rank: rank + 1 });
    });
  }
  const byRank = {};
  Object.entries(ranks).forEach(([id, r]) => {
    if (!byRank[r]) byRank[r] = [];
    byRank[r].push(id);
  });
  const NW = 190, NH = 90, GAP_X = 36, GAP_Y = 54;
  const pos = {};
  Object.entries(byRank).forEach(([r, ids]) => {
    const y = parseInt(r) * (NH + GAP_Y) + 40;
    const totalW = ids.length * NW + (ids.length - 1) * GAP_X;
    ids.forEach((id, i) => {
      pos[id] = { x: -(totalW / 2) + i * (NW + GAP_X), y, w: NW, h: NH };
    });
  });
  const allX = Object.values(pos).flatMap(p => [p.x, p.x + p.w]);
  const allY = Object.values(pos).flatMap(p => [p.y, p.y + p.h]);
  return {
    pos,
    svgW: Math.max(...allX) - Math.min(...allX) + 80,
    svgH: Math.max(...allY) + 50,
    offX: -Math.min(...allX) + 40
  };
}

// ─── SVG NODE ───────────────────────────────────────────────────────────────
function SvgNode({ node, p, selected, onClick, col }) {
  const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
  const lines = node.label.split("\n");
  const lineH = 14;

  const textNodes = lines.map((line, i) =>
    React.createElement("text", {
      key: i, x: cx,
      y: cy + (i - (lines.length - 1) / 2) * lineH,
      textAnchor: "middle", dominantBaseline: "middle",
      fill: "#fff", fontSize: 14,
      fontWeight: node.type === "start" || node.type === "end" ? "700" : "600",
      fontFamily: "'Nunito', sans-serif",
      style: { pointerEvents: "none" }
    }, line)
  );

  const gProps = {
    onClick: () => onClick(node),
    style: { cursor: node.checklist ? "pointer" : "default" }
  };

  if (node.type === "start") {
    return React.createElement("g", gProps,
      React.createElement("ellipse", {
        cx, cy, rx: p.w / 2 - 4, ry: p.h / 2 - 6,
        fill: col,
        stroke: selected ? "#fff" : "rgba(255,255,255,0.3)",
        strokeWidth: selected ? 2.5 : 1.5
      }),
      ...textNodes
    );
  }

  if (node.type === "end") {
    const endLines = lines.map((line, i) =>
      React.createElement("text", {
        key: i, x: cx,
        y: cy + (i - (lines.length - 1) / 2) * lineH,
        textAnchor: "middle", dominantBaseline: "middle",
        fill: col, fontSize: 13, fontWeight: "700",
        fontFamily: "'Nunito', sans-serif",
        style: { pointerEvents: "none" }
      }, line)
    );
    return React.createElement("g", gProps,
      React.createElement("rect", {
        x: p.x + 6, y: p.y + 6, width: p.w - 12, height: p.h - 12,
        rx: 20, fill: "#0a1a0a",
        stroke: col, strokeWidth: selected ? 3 : 2
      }),
      ...endLines
    );
  }

  if (node.type === "decision") {
    const pts = `${cx},${p.y + 4} ${p.x + p.w - 4},${cy} ${cx},${p.y + p.h - 4} ${p.x + 4},${cy}`;
    const dLines = lines.map((line, i) =>
      React.createElement("text", {
        key: i, x: cx,
        y: cy + (i - (lines.length - 1) / 2) * 13,
        textAnchor: "middle", dominantBaseline: "middle",
        fill: "#c8d8ff", fontSize: 13, fontWeight: "600",
        fontFamily: "'Nunito', sans-serif",
        style: { pointerEvents: "none" }
      }, line)
    );
    return React.createElement("g", gProps,
      React.createElement("polygon", {
        points: pts, fill: "#0f0f2a",
        stroke: selected ? "#90caf9" : "#3a5080",
        strokeWidth: selected ? 2.5 : 1.5
      }),
      ...dLines
    );
  }

  // action node
  const aLines = lines.map((line, i) =>
    React.createElement("text", {
      key: i, x: cx,
      y: cy + (i - (lines.length - 1) / 2) * 14,
      textAnchor: "middle", dominantBaseline: "middle",
      fill: "#ddd", fontSize: 13,
      fontFamily: "'Nunito', sans-serif",
      style: { pointerEvents: "none" }
    }, line)
  );

  return React.createElement("g", gProps,
    React.createElement("rect", {
      x: p.x + 3, y: p.y + 3, width: p.w - 6, height: p.h - 6, rx: 5,
      fill: selected ? "#0d1f0d" : "#111",
      stroke: node.checklist ? col : "#333",
      strokeWidth: selected ? 2.5 : 1.5
    }),
    node.checklist && React.createElement("rect", {
      x: p.x + p.w - 26, y: p.y + 3, width: 23, height: 15,
      rx: 3, fill: col, opacity: 0.85
    }),
    node.checklist && React.createElement("text", {
      x: p.x + p.w - 14, y: p.y + 12,
      textAnchor: "middle", fill: "#fff", fontSize: 12,
      fontFamily: "'Nunito', sans-serif", style: { pointerEvents: "none" }
    }, "list"),
    ...aLines
  );
}

// ─── SVG EDGE ───────────────────────────────────────────────────────────────
function SvgEdge({ edge, pos }) {
  const f = pos[edge.from], t = pos[edge.to];
  if (!f || !t) return null;
  const fx = f.x + f.w / 2, fy = f.y + f.h - 3;
  const tx = t.x + t.w / 2, ty = t.y + 3;
  const my = (fy + ty) / 2;
  const d = `M${fx},${fy} C${fx},${my} ${tx},${my} ${tx},${ty}`;
  const lx = (fx + tx) / 2, ly = my;
  return React.createElement("g", null,
    React.createElement("path", {
      d, fill: "none", stroke: "#2a2a4a",
      strokeWidth: 1.5, markerEnd: "url(#arr)"
    }),
    edge.label && React.createElement("rect", {
      x: lx - 26, y: ly - 9, width: 52, height: 14,
      rx: 3, fill: "#080818", opacity: 0.9
    }),
    edge.label && React.createElement("text", {
      x: lx, y: ly + 1, textAnchor: "middle",
      fill: "#6677aa", fontSize: 12,
      fontFamily: "'Nunito', sans-serif"
    }, edge.label)
  );
}

// ─── CHECKLIST DRAWER ───────────────────────────────────────────────────────
function Drawer({ node, onClose, col }) {
  const [checked, setChecked] = useState({});
  if (!node || !node.checklist) return null;
  const done = Object.values(checked).filter(Boolean).length;
  const total = node.checklist.length;

  return React.createElement("div", {
    style: {
      position: "fixed", right: 0, top: 0, bottom: 0, width: 340,
      background: "#0a0a0a", borderLeft: `2px solid ${col}`,
      display: "flex", flexDirection: "column", zIndex: 200,
      boxShadow: "-8px 0 32px rgba(0,0,0,0.7)",
      fontFamily: "'Nunito', sans-serif"
    }
  },
    // Header
    React.createElement("div", {
      style: { padding: "16px 18px 12px", borderBottom: "1px solid #1e1e1e", background: "#0d0d0d" }
    },
      React.createElement("div", {
        style: { display: "flex", justifyContent: "space-between", alignItems: "center" }
      },
        React.createElement("span", {
          style: { color: col, fontSize: 13, fontWeight: 700, letterSpacing: 1 }
        }, "ACTION ITEMS"),
        React.createElement("button", {
          onClick: onClose,
          style: {
            background: "none", border: "none", color: "#777",
            cursor: "pointer", fontSize: 26, lineHeight: 1, padding: "0 4px"
          }
        }, "X")
      ),
      React.createElement("div", {
        style: { color: "#ddd", fontSize: 15, fontWeight: 700, marginTop: 8, lineHeight: 1.5 }
      }, node.label.replace(/\n/g, " ")),
      React.createElement("div", {
        style: { marginTop: 10, height: 3, background: "#1e1e1e", borderRadius: 2 }
      },
        React.createElement("div", {
          style: {
            height: "100%", width: `${total ? (done / total) * 100 : 0}%`,
            background: col, borderRadius: 2, transition: "width 0.25s"
          }
        })
      ),
      React.createElement("div", {
        style: { color: "#555", fontSize: 12, marginTop: 4 }
      }, `${done} / ${total} complete`)
    ),
    // Items
    React.createElement("div", {
      style: { flex: 1, overflowY: "auto", padding: "8px 18px 40px" }
    },
      node.checklist.map((item, i) =>
        React.createElement("div", {
          key: i,
          onClick: () => setChecked(c => ({ ...c, [i]: !c[i] })),
          style: {
            display: "flex", gap: 11, padding: "9px 0",
            borderBottom: "1px solid #141414", cursor: "pointer",
            opacity: checked[i] ? 0.4 : 1, alignItems: "flex-start"
          }
        },
          React.createElement("div", {
            style: {
              width: 16, height: 16, flexShrink: 0, marginTop: 2,
              border: `1.5px solid ${checked[i] ? col : "#3a3a3a"}`,
              borderRadius: 3, background: checked[i] ? col : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center"
            }
          },
            checked[i] && React.createElement("span", {
              style: { color: "#000", fontSize: 13, fontWeight: 900, lineHeight: 1 }
            }, "v")
          ),
          React.createElement("span", {
            style: {
              color: checked[i] ? "#444" : "#bbb", fontSize: 14, lineHeight: 1.65,
              textDecoration: checked[i] ? "line-through" : "none"
            }
          }, item)
        )
      )
    )
  );
}

// ─── FLOW DIAGRAM ───────────────────────────────────────────────────────────
function FlowDiagram({ levelData }) {
  const [sel, setSel] = useState(null);
  const { nodes, edges } = levelData.flow;
  const col = levelData.color;
  const { pos, svgW, svgH, offX } = useMemo(() => layoutFlow(nodes, edges), [levelData.level, levelData.label]);

  return React.createElement("div", {
    style: { display: "flex", height: "100%", overflow: "hidden" }
  },
    React.createElement("div", {
      style: { flex: 1, overflow: "auto", padding: "8px 0" }
    },
      React.createElement("svg", {
        width: svgW, height: svgH,
        style: { display: "block", margin: "0 auto" }
      },
        React.createElement("defs", null,
          React.createElement("marker", {
            id: "arr", markerWidth: 7, markerHeight: 7,
            refX: 5, refY: 3, orient: "auto"
          },
            React.createElement("path", { d: "M0,0 L0,6 L7,3 z", fill: "#2a2a4a" })
          )
        ),
        React.createElement("g", { transform: `translate(${offX},0)` },
          edges.map((e, i) => React.createElement(SvgEdge, { key: i, edge: e, pos })),
          nodes.map(n => React.createElement(SvgNode, {
            key: n.id, node: n,
            p: pos[n.id] || { x: 0, y: 0, w: 190, h: 90 },
            selected: sel?.id === n.id, col,
            onClick: nd => setSel(nd.checklist ? (sel?.id === nd.id ? null : nd) : null)
          }))
        )
      )
    ),
    sel && sel.checklist && React.createElement(Drawer, {
      node: sel, onClose: () => setSel(null), col
    })
  );
}

// ─── LOADING / ERROR STATES ─────────────────────────────────────────────────
function Loading() {
  return React.createElement("div", {
    style: {
      flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
      color: "#444", fontSize: 15, fontFamily: "'Nunito', sans-serif"
    }
  }, "Loading scenario...");
}

function ErrorState({ message }) {
  return React.createElement("div", {
    style: {
      flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
      color: "#7a0000", fontSize: 15, fontFamily: "'Nunito', sans-serif",
      padding: 24, textAlign: "center"
    }
  }, message);
}


// ─── ABOUT MODAL ─────────────────────────────────────────────────────────────
function AboutModal({ onClose }) {
  return React.createElement("div", {
    style: {
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20
    },
    onClick: onClose
  },
    React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: 8,
        maxWidth: 560, width: "100%", maxHeight: "80vh",
        display: "flex", flexDirection: "column",
        fontFamily: "'DM Mono', monospace"
      }
    },
      React.createElement("div", {
        style: {
          padding: "16px 20px 12px", borderBottom: "1px solid #1a1a1a",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }
      },
        React.createElement("span", {
          style: { fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: 2 }
        }, "ABOUT"),
        React.createElement("button", {
          onClick: onClose,
          style: {
            background: "none", border: "none", color: "#666",
            cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "0 4px"
          }
        }, "X")
      ),
      React.createElement("div", {
        style: { padding: "16px 20px 24px", overflowY: "auto", lineHeight: 1.8 }
      },
        React.createElement("div", {
          style: { fontSize: 14, fontWeight: 700, color: "#e0e0e0", marginBottom: 12 }
        }, "Crisis Preparedness Framework"),
        React.createElement("p", {
          style: { fontSize: 11, color: "#888", marginBottom: 16 }
        }, "An open-source, community-maintained decision framework for Indian nationals abroad. Interactive flowcharts with five threat levels covering decision trees, action checklists, and guidance for both the person abroad and their support network in India."),
        React.createElement("div", {
          style: { fontSize: 10, color: "#555", marginBottom: 6, letterSpacing: 1 }
        }, "WHY IT EXISTS"),
        React.createElement("p", {
          style: { fontSize: 11, color: "#888", marginBottom: 16 }
        }, "The Gulf crisis of February 2026 put over 8 million Indians in an active conflict zone. Most harm comes not from the crisis itself but from acting on wrong information at the wrong time. This project started as a personal resource and became a framework when the need proved structural."),
        React.createElement("div", {
          style: { fontSize: 10, color: "#555", marginBottom: 6, letterSpacing: 1 }
        }, "WHAT IT IS NOT"),
        React.createElement("p", {
          style: { fontSize: 11, color: "#888", marginBottom: 16 }
        }, "Not official government guidance. Not legal or medical advice. Not a news source. Not a substitute for calling your embassy."),
        React.createElement("div", {
          style: { fontSize: 10, color: "#555", marginBottom: 6, letterSpacing: 1 }
        }, "⚠️ SOCIAL MEDIA CAVEAT"),
        React.createElement("p", {
          style: { fontSize: 11, color: "#888", marginBottom: 8 }
        }, "WhatsApp and X/Twitter are alerting mechanisms — NOT sources of truth. Never act on social media alone."),
        React.createElement("p", {
          style: { fontSize: 11, color: "#888", marginBottom: 16 }
        }, "In a crisis: Embassy call > Embassy website > Official MEA statement > Everything else. This tool is also just one source — submit corrections via GitHub."),
        React.createElement("div", {
          style: { fontSize: 10, color: "#555", marginBottom: 8, letterSpacing: 1 }
        }, "LINKS"),
        React.createElement("div", {
          style: { display: "flex", flexDirection: "column", gap: 6 }
        },
          [
            ["GitHub", "https://github.com/arvindkandhare/expat-safety-flowchart"],
            ["Contributing", "https://github.com/arvindkandhare/expat-safety-flowchart/blob/main/CONTRIBUTING.md"],
            ["README", "https://github.com/arvindkandhare/expat-safety-flowchart/blob/main/README.md"],
            ["Blog", "https://sweet-kandy.blogspot.com"],
            ["MEA India", "https://mea.gov.in"],
            ["MADAD Portal", "https://madad.gov.in"]
          ].map(([label, url]) =>
            React.createElement("a", {
              key: label, href: url, target: "_blank", rel: "noopener noreferrer",
              style: {
                color: "#6699cc", fontSize: 11, textDecoration: "none",
                display: "flex", justifyContent: "space-between"
              }
            },
              React.createElement("span", null, label),
              React.createElement("span", { style: { color: "#444" } }, url.replace("https://", ""))
            )
          )
        ),
        React.createElement("div", {
          style: {
            marginTop: 20, paddingTop: 16, borderTop: "1px solid #1a1a1a",
            fontSize: 9.5, color: "#444", lineHeight: 1.6
          }
        }, "Not affiliated with the Government of India or the Ministry of External Affairs. All information should be verified with your nearest Indian Embassy before acting.")
      )
    )
  );
}

// ─── APP ────────────────────────────────────────────────────────────────────
function App() {
  const [registry, setRegistry] = useState([]);
  const [checklists, setChecklists] = useState({});
  const [scenarioId, setScenarioId] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [activeLevel, setActiveLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAbout, setShowAbout] = useState(false);

  // Load checklists on mount
  useEffect(() => {
    fetch("checklists/index.json")
      .then(r => r.json())
      .then(data => {
        const promises = data.checklists.map(id =>
          fetch(`checklists/${id}.json`)
            .then(r => r.json())
            .catch(() => null)
        );
        return Promise.all(promises);
      })
      .then(lists => {
        const checklistMap = {};
        lists.forEach(list => {
          if (list && list.id) checklistMap[list.id] = list.items;
        });
        setChecklists(checklistMap);
      })
      .catch(() => {
        // Checklists are optional - don't block if they fail to load
        console.warn("Could not load checklists. Falling back to inline checklists.");
      });
  }, []);

  // Load scenario registry on mount
  useEffect(() => {
    fetch("scenarios/index.json")
      .then(r => r.json())
      .then(data => {
        setRegistry(data);
        setScenarioId(data[0].id);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load scenario registry. Are you running from a web server?");
        setLoading(false);
      });
  }, []);

  // Load selected scenario JSON when scenarioId changes
  useEffect(() => {
    if (!scenarioId || !registry.length) return;
    const entry = registry.find(r => r.id === scenarioId);
    if (!entry) return;
    setScenario(null);
    setActiveLevel(null);
    setLoading(true);
    fetch(`scenarios/${entry.file}`)
      .then(r => r.json())
      .then(data => {
        setScenario(data);
        setActiveLevel(data.currentLevel);
        setLoading(false);
      })
      .catch(() => {
        setError(`Could not load scenario: ${entry.file}`);
        setLoading(false);
      });
  }, [scenarioId]);

  // Resolve checklists: merge checklistId references with inline checklists
  const levelData = useMemo(() => {
    const level = scenario?.levels?.find(l => l.level === activeLevel);
    if (!level) return null;

    // Clone the level and resolve checklist references in nodes
    const resolvedLevel = { ...level };
    if (resolvedLevel.flow && resolvedLevel.flow.nodes) {
      resolvedLevel.flow = {
        ...resolvedLevel.flow,
        nodes: resolvedLevel.flow.nodes.map(node => {
          // If node has checklistId and we have that checklist loaded, use it
          if (node.checklistId && checklists[node.checklistId]) {
            return { ...node, checklist: checklists[node.checklistId] };
          }
          // Otherwise keep the node as-is (inline checklist or no checklist)
          return node;
        })
      };
    }
    return resolvedLevel;
  }, [scenario, activeLevel, checklists]);

  return React.createElement("div", {
    style: {
      background: "#080808", height: "100%", display: "flex",
      flexDirection: "column", fontFamily: "'DM Mono','Courier New',monospace",
      overflow: "hidden"
    }
  },
    // Header
    React.createElement("div", {
      style: {
        background: "#0a0a0a", borderBottom: "1px solid #1a1a1a",
        padding: "12px 20px", flexShrink: 0
      }
    },
      React.createElement("div", {
        style: { display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }
      },
        React.createElement("div", null,
          React.createElement("div", {
            style: { fontSize: 9, letterSpacing: 3, color: "#444", marginBottom: 2 }
          }, "CRISIS PREPAREDNESS FRAMEWORK"),
          React.createElement("div", {
            style: { fontSize: 15, fontWeight: 700, color: "#e0e0e0" }
          }, "Indian Nationals Abroad")
        ),
        React.createElement("div", {
          style: { marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }
        },
          React.createElement("span", {
            style: { fontSize: 9, color: "#444", letterSpacing: 1 }
          }, "SCENARIO"),
          React.createElement("select", {
            value: scenarioId || "",
            onChange: e => setScenarioId(e.target.value),
            style: {
              background: "#111", border: "1px solid #2a2a2a", color: "#bbb",
              padding: "5px 10px", borderRadius: 4, fontSize: 11,
              fontFamily: "inherit", cursor: "pointer"
            }
          },
            registry.map(s =>
              React.createElement("option", { key: s.id, value: s.id }, s.label)
            ),
            React.createElement("option", { disabled: true }, "── contribute via GitHub PR ──")
          )
        ),
        React.createElement("button", {
          onClick: () => setShowAbout(true),
          style: {
            background: "none", border: "1px solid #2a2a2a", color: "#666",
            padding: "5px 12px", borderRadius: 4, fontSize: 11,
            fontFamily: "inherit", cursor: "pointer", letterSpacing: 1
          }
        }, "ABOUT")
      ),
      scenario && React.createElement("div", {
        style: { fontSize: 9.5, color: "#3a3a3a", marginTop: 5 }
      }, scenario.subtitle)
    ),

    // Disclaimer
    scenario && React.createElement("div", {
      style: {
        background: "#0e0900", borderBottom: "1px solid #241800",
        padding: "6px 20px", flexShrink: 0
      }
    },
      React.createElement("span", {
        style: { fontSize: 9, color: "#7a5520", letterSpacing: 0.3 }
      }, `! ${scenario.disclaimer}`)
    ),

    // Level tabs
    scenario && React.createElement("div", {
      style: {
        display: "flex", borderBottom: "1px solid #161616",
        flexShrink: 0, overflowX: "auto"
      }
    },
      scenario.levels.map(l => {
        const active = l.level === activeLevel;
        const current = l.level === scenario.currentLevel;
        return React.createElement("button", {
          key: l.level,
          onClick: () => setActiveLevel(l.level),
          style: {
            flex: "1 1 0", minWidth: 90, padding: "10px 6px",
            background: active ? l.color : "transparent",
            border: "none", borderRight: "1px solid #161616",
            cursor: "pointer", position: "relative", transition: "background 0.15s"
          }
        },
          current && React.createElement("div", {
            style: {
              position: "absolute", top: 3, right: 3,
              background: "#ffffff", borderRadius: 6,
              fontSize: 7, padding: "1px 4px", color: "#000",
              fontWeight: 700, fontFamily: "inherit", letterSpacing: 0.5
            }
          }, "NOW"),
          React.createElement("div", {
            style: {
              fontSize: 10, fontWeight: 900,
              color: active ? "#fff" : l.color, letterSpacing: 1
            }
          }, l.label),
          React.createElement("div", {
            style: {
              fontSize: 8.5,
              color: active ? "rgba(255,255,255,0.6)" : "#444",
              marginTop: 2
            }
          }, `L${l.level} - ${l.name}`)
        );
      })
    ),

    // Level context bar
    levelData && React.createElement("div", {
      style: {
        background: levelData.color, padding: "8px 20px",
        borderBottom: "1px solid #000", flexShrink: 0
      }
    },
      React.createElement("div", {
        style: { fontSize: 10.5, color: levelData.textColor, fontWeight: 700, marginBottom: 4 }
      }, levelData.description),
      React.createElement("div", {
        style: { display: "flex", gap: 20, flexWrap: "wrap" }
      },
        React.createElement("span", {
          style: { fontSize: 8.5, color: "rgba(255,255,255,0.5)" }
        },
          React.createElement("span", {
            style: { color: "rgba(255,255,255,0.3)" }
          }, "OFFICIAL: "),
          levelData.officialTrigger
        ),
        React.createElement("span", {
          style: { fontSize: 8.5, color: "rgba(255,255,255,0.5)" }
        },
          React.createElement("span", {
            style: { color: "rgba(255,255,255,0.3)" }
          }, "OBSERVABLE: "),
          levelData.observableTrigger
        )
      )
    ),

    // Main content
    loading && React.createElement(Loading),
    error && React.createElement(ErrorState, { message: error }),
    !loading && !error && levelData && React.createElement(FlowDiagram, {
      key: `${scenarioId}-${activeLevel}`,
      levelData
    }),

    // About modal
    showAbout && React.createElement(AboutModal, { onClose: () => setShowAbout(false) }),

    // Footer
    React.createElement("div", {
      style: {
        borderTop: "1px solid #141414", padding: "5px 20px",
        background: "#0a0a0a", display: "flex",
        justifyContent: "space-between", flexShrink: 0
      }
    },
      React.createElement("span", {
        style: { fontSize: 8.5, color: "#2a2a2a" }
      }, "Tap solid-border nodes to expand checklist"),
      React.createElement("span", {
        style: { fontSize: 8.5, color: "#2a2a2a" }
      }, "Open source - contribute scenarios via GitHub PR")
    )
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App, null));
