/* Sorting visualizer: emits compare/swap steps, animates bars + live trace. */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const barsEl = $("bars"), traceEl = $("sort-trace");

  let values = [], running = false, timer = null;

  function shuffled(n) {
    const a = Array.from({ length: n }, (_, i) => i + 1);
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function render(high = {}) {
    barsEl.innerHTML = "";
    const max = values.length || 1;
    values.forEach((v, i) => {
      const d = document.createElement("div");
      d.className = "bar" + (high.done ? " done" : high.swap && high.swap.includes(i) ? " swap" : high.cmp && high.cmp.includes(i) ? " cmp" : "");
      d.style.height = `${(v / max) * 100}%`;
      d.title = String(v);
      barsEl.appendChild(d);
    });
  }

  function stepsFor(algo, a) {
    // Each step: {type:'cmp'|'swap', i, j, text}
    const steps = [];
    let comps = 0, swaps = 0;
    const cmp = (i, j) => { comps++; steps.push({ type: "cmp", i, j, text: `compare a[${i}]=${a[i]} vs a[${j}]=${a[j]}` }); };
    const swp = (i, j) => { swaps++; [a[i], a[j]] = [a[j], a[i]]; steps.push({ type: "swap", i, j, text: `swap a[${i}] ↔ a[${j}]` }); };
    const set = (i, v) => { swaps++; a[i] = v; steps.push({ type: "swap", i, j: i, text: `write a[${i}] ← ${v}` }); };

    if (algo === "bubble") {
      for (let n = a.length; n > 1; n--)
        for (let i = 0; i < n - 1; i++) { cmp(i, i + 1); if (a[i] > a[i + 1]) swp(i, i + 1); }
    } else if (algo === "insertion") {
      for (let i = 1; i < a.length; i++) {
        let j = i;
        while (j > 0) { cmp(j - 1, j); if (a[j - 1] > a[j]) { swp(j - 1, j); j--; } else break; }
      }
    } else if (algo === "quick") {
      const qs = (lo, hi) => {
        if (lo >= hi) return;
        const pivot = a[hi]; let p = lo;
        for (let k = lo; k < hi; k++) { cmp(k, hi); if (a[k] < pivot) { if (k !== p) swp(k, p); p++; } }
        if (p !== hi) swp(p, hi);
        qs(lo, p - 1); qs(p + 1, hi);
      };
      qs(0, a.length - 1);
    } else {
      const aux = a.slice();
      const ms = (lo, hi) => {
        if (hi - lo < 2) return;
        const mid = (lo + hi) >> 1;
        ms(lo, mid); ms(mid, hi);
        let i = lo, j = mid, k = lo;
        while (i < mid && j < hi) { cmp(i, j); aux[k++] = a[i] <= a[j] ? a[i++] : a[j++]; }
        while (i < mid) aux[k++] = a[i++];
        while (j < hi) aux[k++] = a[j++];
        for (let t = lo; t < hi; t++) set(t, aux[t]);
      };
      ms(0, a.length);
    }
    return { steps, comps, swaps };
  }

  function stop() { running = false; clearInterval(timer); $("sort-run").disabled = false; }

  function run() {
    if (running) return;
    const algo = $("sort-algo").value;
    const work = values.slice();
    const { steps, comps, swaps } = stepsFor(algo, work);
    $("sort-comps").textContent = comps;
    $("sort-swaps").textContent = swaps;
    $("sort-status").textContent = `running ${algo}… (${steps.length} steps)`;
    traceEl.innerHTML = "";
    running = true; $("sort-run").disabled = true;
    const speed = Number($("sort-speed").value); // 1..100
    const delay = Math.max(8, 320 - speed * 3);
    let k = 0;
    timer = setInterval(() => {
      const burst = Math.max(1, Math.floor(values.length / 24));
      for (let b = 0; b < burst && k < steps.length; b++, k++) {
        const s = steps[k];
        if (s.type === "cmp") { const t = values[s.i], u = values[s.j]; void t; void u; }
        // replay onto live array by re-deriving: easiest is to apply swap steps only
        if (s.type === "swap") {
          if (s.text.startsWith("write")) values[s.i] = Number(s.text.split("←")[1]);
          else { const t = values[s.i]; values[s.i] = values[s.j]; values[s.j] = t; }
        }
        render(s.type === "cmp" ? { cmp: [s.i, s.j] } : { swap: [s.i, s.j] });
        const li = document.createElement("li");
        li.className = s.type;
        li.innerHTML = `<b>${s.type.toUpperCase()}</b> ${s.text}`;
        traceEl.appendChild(li);
      }
      traceEl.scrollTop = traceEl.scrollHeight;
      if (k >= steps.length) { render({ done: true }); $("sort-status").textContent = `sorted ✓ (${comps} comparisons, ${swaps} writes)`; stop(); }
    }, delay);
  }

  function reset() { stop(); values = shuffled(Number($("sort-size").value)); $("sort-size-val").textContent = $("sort-size").value; $("sort-status").textContent = "idle"; $("sort-comps").textContent = "0"; $("sort-swaps").textContent = "0"; traceEl.innerHTML = ""; render({}); }

  $("sort-run").addEventListener("click", run);
  $("sort-shuffle").addEventListener("click", reset);
  $("sort-reset").addEventListener("click", reset);
  $("sort-size").addEventListener("input", reset);
  reset();
  window.__algoSort = { reset, run };
})();
