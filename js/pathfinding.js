/* Dijkstra pathfinding visualizer on a grid with draggable walls. */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const gridEl = $("grid");
  const COLS = 31, ROWS = 15;
  let walls = new Set(), running = false, drawing = false, erasing = false;

  const key = (r, c) => `${r},${c}`;
  const start = () => ({ r: 0, c: 0 });
  const goal = () => ({ r: ROWS - 1, c: COLS - 1 });

  function build() {
    gridEl.innerHTML = "";
    gridEl.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const d = document.createElement("div");
      d.className = "cell"; d.dataset.r = r; d.dataset.c = c;
      gridEl.appendChild(d);
    }
    paint();
  }

  function paint(visited = new Set(), path = new Set()) {
    const s = start(), g = goal();
    for (const cell of gridEl.children) {
      const r = +cell.dataset.r, c = +cell.dataset.c, k = key(r, c);
      cell.className = "cell";
      if (r === s.r && c === s.c) cell.classList.add("start");
      else if (r === g.r && c === g.c) cell.classList.add("end");
      else if (path.has(k)) cell.classList.add("path");
      else if (visited.has(k)) cell.classList.add("visit");
      else if (walls.has(k)) cell.classList.add("wall");
    }
  }

  function dijkstra() {
    const s = start(), g = goal();
    const dist = new Map([[key(s.r, s.c), 0]]);
    const prev = new Map(), visitedOrder = [];
    const pq = [[0, s.r, s.c]];
    const seen = new Set();
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    while (pq.length) {
      pq.sort((a, b) => a[0] - b[0]);
      const [, r, c] = pq.shift();
      const k = key(r, c);
      if (seen.has(k) || walls.has(k)) continue;
      seen.add(k); visitedOrder.push(k);
      if (r === g.r && c === g.c) break;
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= ROWS || nc >= COLS) continue;
        const nk = key(nr, nc);
        if (walls.has(nk) || seen.has(nk)) continue;
        const nd = dist.get(k) + 1;
        if (nd < (dist.get(nk) ?? Infinity)) { dist.set(nk, nd); prev.set(nk, k); pq.push([nd, nr, nc]); }
      }
    }
    const path = new Set();
    let cur = key(g.r, g.c);
    if (seen.has(cur)) { while (cur && cur !== key(s.r, s.c)) { path.add(cur); cur = prev.get(cur); } }
    return { visitedOrder, path };
  }

  function run() {
    if (running) return;
    running = true; $("pf-run").disabled = true;
    const { visitedOrder, path } = dijkstra();
    $("pf-status").textContent = "searching…";
    const speed = Number($("pf-speed").value);
    const delay = Math.max(4, 120 - speed);
    const visited = new Set();
    let i = 0;
    const timer = setInterval(() => {
      const burst = Math.max(1, Math.floor(visitedOrder.length / 60));
      for (let b = 0; b < burst && i < visitedOrder.length; b++, i++) visited.add(visitedOrder[i]);
      paint(visited);
      $("pf-visited").textContent = visited.size;
      if (i >= visitedOrder.length) {
        clearInterval(timer);
        paint(visited, path);
        $("pf-length").textContent = path.size ? path.size : "unreachable";
        $("pf-status").textContent = path.size ? "path found ✓" : "no path ✗";
        running = false; $("pf-run").disabled = false;
      }
    }, delay);
  }

  function randomWalls(p = 0.24) {
    walls = new Set();
    const s = start(), g = goal();
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if ((r === s.r && c === s.c) || (r === g.r && c === g.c)) continue;
      if (Math.random() < p) walls.add(key(r, c));
    }
    $("pf-visited").textContent = "0"; $("pf-length").textContent = "–"; $("pf-status").textContent = "idle";
    paint();
  }

  gridEl.addEventListener("pointerdown", (e) => {
    const t = e.target.closest(".cell"); if (!t || running) return;
    const k = key(+t.dataset.r, +t.dataset.c);
    const s = start(), g = goal();
    if (k === key(s.r, s.c) || k === key(g.r, g.c)) return;
    drawing = true; erasing = walls.has(k);
    erasing ? walls.delete(k) : walls.add(k);
    paint(); gridEl.setPointerCapture(e.pointerId);
  });
  gridEl.addEventListener("pointerover", (e) => {
    if (!drawing || running) return;
    const t = e.target.closest(".cell"); if (!t) return;
    const k = key(+t.dataset.r, +t.dataset.c);
    erasing ? walls.delete(k) : walls.add(k);
    paint();
  });
  window.addEventListener("pointerup", () => (drawing = false));

  $("pf-run").addEventListener("click", run);
  $("pf-maze").addEventListener("click", () => randomWalls());
  $("pf-clear").addEventListener("click", () => { walls = new Set(); paint(); $("pf-status").textContent = "idle"; });
  build();
})();
