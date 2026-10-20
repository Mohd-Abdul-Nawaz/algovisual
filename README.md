# AlgoVisual

Interactive **sorting + Dijkstra pathfinding visualizer** — vanilla HTML/CSS/JS, zero dependencies, deploys as a static site (GitHub Pages / Netlify / Vercel).

Built by **Mohd Abdul Nawaz** · JavaScript · MIT

## Features

**Sorting tab** — Bubble, Insertion, Quick, Merge sort on 8–120 bars:
- live bars with compare (amber) / swap (red) / sorted (green) states
- running counters: comparisons + swaps/writes
- step-by-step trace log (`COMPARE a[i] vs a[j]`, `SWAP a[i] ↔ a[j]`)
- adjustable size + speed, shuffle/reset

**Pathfinding tab** — Dijkstra on a 31×15 grid:
- click/drag to draw or erase walls, start = top-left, target = bottom-right
- animated visited wave + final shortest path, visited count + path length
- random-wall generator, clear, speed control

## Run it

No build step — open the folder as-is:

```bash
# option 1: just open it
start index.html        # Windows
open index.html         # macOS

# option 2: serve it (recommended)
python -m http.server 8000
# → http://localhost:8000
```

## Deploy it

Push this folder to GitHub and enable **Settings → Pages → Deploy from branch** — done. Same folder deploys unchanged to Netlify/Vercel.

## Layout

```
AlgoVisual/
  index.html        # both panels
  css/style.css     # dark theme
  js/sorting.js     # 4 algorithms → step lists → animated replay
  js/pathfinding.js # Dijkstra + grid interaction
  js/main.js        # tab switching
```

## Skills demonstrated

Algorithm implementation from scratch (no libraries), complexity awareness (O(n²) vs O(n log n) visible live), interaction design — supports the **Puzzle Solver (Coding)** story: I don't just implement algorithms, I can explain and visualize them.
