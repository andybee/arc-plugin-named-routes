const { join } = require('path')
const { readFileSync } = require('fs')
const { stringify } = require('querystring')

module.exports = function route (name, args = {}) {
  const manifest = join(process.cwd(), 'node_modules', '@architect', 'shared', 'routes.json')
  let routes
  try {
    routes = JSON.parse(readFileSync(manifest).toString())
  }
  catch (error) {
    routes = {}
  }

  const rawPath = routes[name]
  if (rawPath === undefined) {
    throw new ReferenceError(`No route named "${name}"`)
  }

  let query = args
  const path = rawPath.replace(/:[^/]+/g, (match) => {
    const matchedKey = match.substring(1)
    const value = args[matchedKey]
    if (value === undefined) throw new ReferenceError(`No value for parameter "${matchedKey}" in "${rawPath}"`)
    query = Object.keys(query)
      .filter((key) => key !== matchedKey)
      .reduce((obj, key) => ({ ...obj, [key]: query[key] }), {})
    return value
  })

  return `${path}${Object.keys(query).length > 0
    ? `?${stringify(query)}`
    : ''}`
}
