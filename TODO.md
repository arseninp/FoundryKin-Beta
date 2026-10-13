# TODO

- [x] v0.8.21 interface step 1 written to main (Create placeholder, FINDER title, pack metadata pill, split card bubbles, red border for edited blocks).
- [ ] Fix the minor interface defects found while checking v0.8.21 (list pending from the project owner).
- [x] v0.8.22 removed the model 2D view from the interface: card fallback, editor 2D/3D toggle, #fb canvas and hint. Drawing canvases remain. A failed 3D card preview stays blank.
- [ ] Delete the now unreachable setFb/drawFb code together with legacy index.html during the editor rewrite (it is not worth patching).
- [ ] Rewrite editor using explicit modules; replace legacy index.html and remove runtime string patches.
- [ ] Editor layout/help, brush sizes 1-8, HSV/history, vanilla reset: separate reviewed steps.
