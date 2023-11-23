const { join } = require('path')
const { readFileSync } = require('fs')
const { stringify } = require('querystring')

module.exports = function route (...args) {
  let name
  let method
  let params = {}

  switch (args.length) {
  case 1:
    [ name ] = args
    break
  case 2:
    if (typeof args[1] === 'string') {
      [ method, name ] = args
    }
    else {
      [ name, params ] = args
    }
    break
  case 3:
    [ method, name, params ] = args
    break
  default:
    throw new TypeError('Invalid number of arguments')
  }

  const manifest = join(process.cwd(), 'node_modules', '@architect', 'shared', 'routes.json')
  let routes
  try {
    routes = JSON.parse(readFileSync(manifest).toString())
  }
  catch (error) {
    routes = {}
  }

  let url
  let rawPath = routes[method?.toLowerCase() || 'get']?.[name] || routes.any?.[name]
  if (rawPath === undefined) {
    throw new ReferenceError(`No route named "${name}"${method !== undefined ? ` for method ${method.toUpperCase()}` : ''}`)
  }
  if (name.startsWith('external.')) {
    url = new URL(rawPath)
    rawPath = url.pathname
  }

  let query = params
  const path = rawPath.replace(/:[^/]+/g, (match) => {
    const matchedKey = match.substring(1)
    const value = params[matchedKey]
    if (value === undefined) throw new ReferenceError(`No value for parameter "${matchedKey}" in "${rawPath}"`)
    query = Object.keys(query)
      .filter((key) => key !== matchedKey)
      .reduce((obj, key) => ({ ...obj, [key]: query[key] }), {})
    return value
  })

  if (name.startsWith('external.')) {
    url.pathname = path
    url.search = Object.keys(query).length > 0
      ? `?${stringify(query)}`
      : ''
    return url.toString()
  }

  return `${path}${Object.keys(query).length > 0
    ? `?${stringify(query)}`
    : ''}`
}
