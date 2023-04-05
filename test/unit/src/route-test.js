const test = require('tape')
const proxyquire = require('proxyquire')

let manifestExists = true
const fs = {
  readFileSync: () => {
    if (!manifestExists) {
      throw new Error()
    }
    return JSON.stringify({
      get: {
        a: '/a',
        b: '/b/:id',
      },
      post: {
        a: '/a',
      },
      put: {
        b: '/c/:id',
      },
    })
  }
}
const route = proxyquire('../../../route', { fs })

test('Set up env', t => {
  t.plan(1)
  t.ok(route, 'Router helper found')
})

test('Helper returns correct path', t => {
  t.plan(7)
  manifestExists = true
  let path = route('a')
  t.equal(path, '/a', 'Returned path')
  path = route('a', { query: 'test' })
  t.equal(path, '/a?query=test', 'Returned path with query string')
  path = route('b', { id: 123 })
  t.equal(path, '/b/123', 'Returned path with parameter value')
  path = route('b', { id: 123, query: 'test' })
  t.equal(path, '/b/123?query=test', 'Returned path with parameter value and query string')
  path = route('post', 'a')
  t.equal(path, '/a', 'Returned path with method')
  path = route('put', 'b', { id: 123 })
  t.equal(path, '/c/123', 'Returned path with method and parameter value')
  path = route('GET', 'b', { id: 123 })
  t.equal(path, '/b/123', 'Returns path with alternatively cased method')
})

test('Throws if manifest not found', t => {
  t.plan(1)
  manifestExists = false
  t.throws(() => {
    route('a')
  }, 'Route helper throws error if manifest not found')
})

test('Throws if route not found', t => {
  t.plan(1)
  manifestExists = false
  t.throws(() => {
    route('c')
  }, 'Route helper throws error if route not found')
})

test('Throws if parameter value not supplied', t => {
  t.plan(1)
  manifestExists = true
  t.throws(() => {
    route('b')
  }, 'Route helper throws error if route parameter not supplied')
})
