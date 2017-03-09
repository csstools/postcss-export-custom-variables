# PostCSS Export Custom Variables [<img src="https://postcss.github.io/postcss/logo.svg" alt="PostCSS Logo" width="90" height="90" align="right">][postcss]

[![NPM Version][npm-img]][npm-url]
[![Build Status][cli-img]][cli-url]
[![Windows Build Status][win-img]][win-url]
[![Gitter Chat][git-img]][git-url]

[PostCSS Export Custom Variables] lets you export [custom media queries], [custom
properties], [custom property sets], and [custom selectors] from CSS to
JavaScript.

```css
:root {
  --custom-size: 960px;
  --custom-styles: {
    color: black;
    background-color: white;
  }
}

@custom-media --custom-viewport (max-width: 30em);

@custom-selector :--custom-selector :hover, :focus;
```

By default, CSS is transformed into JSON:

```json
{
  "customSize": "960px",
  "customStyles": {
    "color": "black",
    "backgroundColor": "white"
  },
  "customViewport": "(max-width: 30em)",
  "customSelector": ":hover, :focus"
}
```

With a small adjustment, it may be transformed into JavaScript exports:

```js
require('postcss-export-custom-variables')({
  exporter: 'js',
  destination: 'css-vars-exports.js'
});
```

```js
export const customSize = "960px";
export const customStyles = { color: "black", backgroundColor: "white" };
export const customViewport = "(max-width: 30em)";
export const customSelector = ":hover, :focus";
```

With these variables synchronized to JavaScript, they may be used later by
something like `window.matchMedia()`, `document.querySelectorAll()`,
`element.style`, or `element.animate()`.

## Usage

Add [PostCSS Export Custom Variables] to your build tool:

```bash
npm install postcss-export-custom-variables --save-dev
```

#### Node

Use [PostCSS Export Custom Variables] to process your CSS:

```js
require('postcss-export-custom-variables').process(YOUR_CSS, { /* postcss options */ }, { /* plugin options */ });
```

#### PostCSS

Add [PostCSS] to your build tool:

```bash
npm install postcss --save-dev
```

Use [PostCSS Export Custom Variables] as a plugin:

```js
postcss([
  require('postcss-export-custom-variables')({ /* plugin options */ })
]).process(YOUR_CSS, /* postcss options */);
```

#### Gulp

Add [Gulp PostCSS] to your build tool:

```bash
npm install gulp-postcss --save-dev
```

Use [PostCSS Export Custom Variables] in your Gulpfile:

```js
gulp.task('css', () => gulp.src('./src/*.css').pipe(
  require('gulp-postcss')([
    require('postcss-export-custom-variables')({ /* plugin options */ })
  ])
).pipe(
  gulp.dest('.')
));
```

#### Grunt

Add [Grunt PostCSS] to your build tool:

```bash
npm install grunt-postcss --save-dev
```

Use [PostCSS Export Custom Variables] in your Gruntfile:

```js
grunt.loadNpmTasks('grunt-postcss');

grunt.initConfig({
  postcss: {
    options: {
      use: [
        require('postcss-export-custom-variables')({ /* options */ })
      ]
    },
    dist: {
      src: '*.css'
    }
  }
});
```

## Advanced Options

These options may be passed directly into the plugin.

```js
require('postcss-export-custom-variables')({ /* options */ });
```

#### destination

`destination` is the path where your JSON or JS Exports will be saved. By
default, it is the CSS source with an additional `.js` or `.json` extension.

#### variables

`variables` is the object your CSS variables are assigned to. This might be
used to pre-populate some unique set of custom properties. By default, it is a
new object.

#### exporter

`exporter` is the function used to export the whole object of custom variables.
The plugin will return this function, so Promises should be returned if
performing an asynchronous operation, such as writing to a file.

```js
{
  exporter: (variables, options, root) => {
    // variables: an object of all the variables collected
    // options: options passed into the plugin
    // root: the AST of CSS parsed by PostCSS

    // return new Promise();
  }
}
```

- If a `js` string is passed, the default JavaScript stringifier will be used.
- If a `json` string is passed, the default JSON stringifier will be used.

```js
{
  exporter: 'json'
}
```

### Custom Assigners

Use these custom assigners to determine how you would like to organize your
custom variables.

#### customMediaQueryAssigner

`customMediaQueryAssigner` is the function used to create an object from the
query and value of [custom media queries].

```js
{
  customMediaQueryAssigner: (name, queries, node) => {
    // name: name of the custom media query
    // queries: queries for the custom media query
    // node: PostCSS atrule for the custom media query

    // returns { name: queries }
  }
}
```

#### customPropertyAssigner

`customPropertyAssigner` is the function used to create an object from the
property and value of [custom properties].

```js
{
  customPropertyAssigner: (property, value, node) => {
    // property: name of the custom property
    // value: value of the custom property
    // node: PostCSS declaration for the custom property

    // returns { property: value };
  }
}
```

#### customPropertySetAssigner

`customPropertySetAssigner` is the function used to create an object from the
property and value of [custom property sets].

```js
{
  customPropertySetAssigner: (property, nodes, node) => {
    // property: name of the custom property set
    // nodes: array of all the children of the property set
    // node: PostCSS rule for the custom property set

    // returns { property: object_from_nodes };
  }
}
```

#### customSelectorAssigner

`customSelectorAssigner` is the function used to create an object from the
property and value of [custom selectors].

```js
{
  customSelectorAssigner: (property, selectors, node) => {
    // property: name of the custom selector
    // selectors: selectors for the custom selector
    // node: PostCSS atrule for the custom selector

    // returns { property: selectors };
  }
}
```

[npm-url]: https://www.npmjs.com/package/postcss-export-custom-variables
[npm-img]: https://img.shields.io/npm/v/postcss-export-custom-variables.svg
[cli-url]: https://travis-ci.org/jonathantneal/postcss-export-custom-variables
[cli-img]: https://img.shields.io/travis/jonathantneal/postcss-export-custom-variables.svg
[win-url]: https://ci.appveyor.com/project/jonathantneal/postcss-export-custom-variables
[win-img]: https://img.shields.io/appveyor/ci/jonathantneal/postcss-export-custom-variables.svg
[lic-url]: LICENSE.md
[lic-img]: https://img.shields.io/npm/l/postcss-export-custom-variables.svg
[log-url]: CHANGELOG.md
[log-img]: https://img.shields.io/badge/changelog-md-blue.svg
[git-url]: https://gitter.im/postcss/postcss
[git-img]: https://img.shields.io/badge/chat-gitter-blue.svg

[PostCSS Export Custom Variables]: https://github.com/jonathantneal/postcss-export-custom-variables
[PostCSS]: https://github.com/postcss/postcss
[Gulp PostCSS]: https://github.com/postcss/gulp-postcss
[Grunt PostCSS]: https://github.com/nDmitry/grunt-postcss
[custom media queries]: https://drafts.csswg.org/mediaqueries-5/#custom-mq
[custom properties]: https://drafts.csswg.org/css-variables/
[custom property sets]: http://tabatkins.github.io/specs/css-apply-rule/
[custom selectors]: https://drafts.csswg.org/css-extensions/#custom-selectors
