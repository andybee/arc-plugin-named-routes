## [`arc-plugin-named-routes`](https://www.npmjs.com/package/arc-plugin-named-routes)

> Named routes for Architect HTTP functions

## Install

Into your existing Architect project:

```sh
npm i arc-plugin-named-routes
```

Add the following to your Architect project manifest (usually `app.arc`):

```arc
@plugins
arc-plugin-named-routes
```

Then modify any [HTTP routes](https://arc.codes/docs/en/reference/project-manifest/http) you wish to name to the verbose format and add a `name`:

```arc
@http
/foo
  method get
  name foo
```

## Usage

Import the `route()` helper in to an HTTP function Lambda to use named routes:

```js
// src/http/get-index/index.js
const route = require('arc-plugin-named-routes/route')

exports.handler = async () => ({
  statusCode: 200,
  headers: {
    'content-type': 'text/html; charset=utf8'
  },
  body: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
      <a href="${route('foo')}">Foo</a>
    </body>
    </html>
  `,
})
```

You must pass path parameters to `route()` if they exist in the route's path:

```arc
@http
/foo/:id
  method get
  name foo
```

```js
route('foo', { id: 123 })

// returns: /foo/123
```

Any properties of the supplied object that do not match a path property are appended to the route in a query string:

```js
route('foo', { id: 123, bar: 'bar' })

// returns: /foo/123?bar=bar
```

You can use the same name for two or more routes as long as each route has a unique method. The helper function will default to `GET`. You can optionally supply an alternative method as the first argument:

```arc
@http
/foo/:id
  method get
  name foo
/bar
  method post
  name foo
```

```js
route('foo', { id: 123 })

// returns: /foo/123

route('get', 'foo', { id: 123 })

// returns: /foo/123

route('post', 'foo')

// returns: /bar
```

When refactoring routes, to ease migration you can define multiple names for a single route (assuming no duplication, as above):

```arc
@http
/foo
  method get
  name foo bar
```

```js
route('foo')

// returns: /foo

route('bar')

// returns: /foo
```

## Configuration

There is currently no additional configuration for this plugin.
