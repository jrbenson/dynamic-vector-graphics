<!-- {% raw %} -->

This project provides a system that uses annotations on provided data and SVG file to create a dynamic vector graphic.

# Quick Start

Include the dynamic vector graphic library in your html page:

```html
<script src="https://unpkg.com/dynamic-vector-graphics/dist/dvg.min.js"></script>
```

Inject an SVG file into a container element:

```js
const elem = document.getElementById('container')
const graphic = new dvg.DVG(elem, {
  svg: './graphic.svg',
})
```

Use the `update()`method to pass data to the graphic:

```js
graphic.update({
  values: [
    ['A', 'B', 'C'],
    [1, 2, 3],
  ],
  columns: ['Character', 'Number {{0..100}}'],
})
```

# Documentation

[Usage](./doc/usage.md)<br/>
Various ways to intialize SVG files and proivde data updates.

[Demo Examples](./examples/)<br/>
Demonstration page showing the dynamic svg features in action.

[Editing SVG Files](./doc/svg-editing.md)<br/>
How to create SVGs appropriate for use with the Dynamic Vector Graphics system using common vector editors.

[SVG Annotation Syntax](./doc/svg-syntax.md)<br/>
Syntax needed for annotating the SVGs files.

[Data Annotation Syntax](./doc/data-syntax.md)<br/>
Syntax needed for annotating the headers of the data.

<!-- {% endraw %} -->
