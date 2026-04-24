export function processData(data) {
  const validEdges = [];
  const invalidEntries = [];
  const duplicateEdges = [];

  const seenEdges = new Set();
  const childParent = new Map();

  // 1. Validation
  for (let raw of data) {
    if (!raw || typeof raw !== "string") {
      invalidEntries.push(raw);
      continue;
    }

    let entry = raw.trim();

    const match = /^[A-Z]->[A-Z]$/.test(entry);

    if (!match) {
      invalidEntries.push(raw);
      continue;
    }

    const [parent, child] = entry.split("->");

    if (parent === child) {
      invalidEntries.push(raw);
      continue;
    }

    // duplicate check
    if (seenEdges.has(entry)) {
      if (!duplicateEdges.includes(entry)) {
        duplicateEdges.push(entry);
      }
      continue;
    }

    seenEdges.add(entry);

    // multi-parent case
    if (childParent.has(child)) continue;

    childParent.set(child, parent);
    validEdges.push([parent, child]);
  }

  // Build graph
  const graph = {};
  const nodes = new Set();

  for (let [p, c] of validEdges) {
    if (!graph[p]) graph[p] = [];
    graph[p].push(c);
    nodes.add(p);
    nodes.add(c);
  }

  // Find roots
  const children = new Set(validEdges.map(e => e[1]));
  let roots = [...nodes].filter(n => !children.has(n));

  // If no root → cycle
  if (roots.length === 0) {
    roots = [Array.from(nodes).sort()[0]];
  }

  const visited = new Set();
  const hierarchies = [];
  let totalTrees = 0;
  let totalCycles = 0;
  let maxDepth = 0;
  let largestRoot = "";

  function dfs(node, path) {
    if (path.has(node)) return { cycle: true };

    path.add(node);

    let children = graph[node] || [];
    let subtree = {};
    let depth = 1;

    for (let child of children) {
      let res = dfs(child, new Set(path));

      if (res.cycle) return { cycle: true };

      subtree[child] = res.tree;
      depth = Math.max(depth, 1 + res.depth);
    }

    return { tree: subtree, depth };
  }

const allNodes = Array.from(nodes).sort();
const visitedGlobal = new Set();

function markVisited(n) {
  if (visitedGlobal.has(n)) return;
  visitedGlobal.add(n);
  for (let child of graph[n] || []) {
    markVisited(child);
  }
}

for (let node of allNodes) {
  if (visitedGlobal.has(node)) continue;

  let res = dfs(node, new Set());

  markVisited(node);

  if (res.cycle) {
    hierarchies.push({
      root: node,
      tree: {},
      has_cycle: true
    });
    totalCycles++;
  } else {
    hierarchies.push({
      root: node,
      tree: { [node]: res.tree },
      depth: res.depth
    });

    totalTrees++;

    if (
      res.depth > maxDepth ||
      (res.depth === maxDepth && node < largestRoot)
    ) {
      maxDepth = res.depth;
      largestRoot = node;
    }
  }
}

  return {
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges: duplicateEdges,
    summary: {
      total_trees: totalTrees,
      total_cycles: totalCycles,
      largest_tree_root: largestRoot
    }
  };
}