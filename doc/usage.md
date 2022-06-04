<!-- {% raw %} -->

# Usage

Include the dynamic vector graphic library in your html page:

```html
<script src="https://unpkg.com/dynamic-vector-graphics/dist/dvg.min.js"></script>
```

Either create the graphic by providing an existing svg element from the DOM:

```js
const elem = document.getElementById('mysvg')
const graphic = new dvg.DVG(elem)
```

Or provide a container element and provide a URL to the svg file to load:

```js
const elem = document.getElementById('container')
const graphic = new dvg.DVG(elem, { svg: './graphic.svg' })
```

Use the `update()`method to pass data to the graphic as desired. Can be a CSV string:

```js
graphic.update(csv)
```

Or can be a data structure:

```js
graphic.update({
  values: [
    ['A', 'B', 'C'],
    [1, 2, 3],
  ],
  columns: ['Character', 'Number'],
})
```

See the [examples page](./examples/) for demonstrations of various ways to instatiate dynamic graphics and apply data.

<!-- {% endraw %} -->
