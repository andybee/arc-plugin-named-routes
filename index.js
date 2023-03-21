const fs = require('fs/promises')
const path = require('path')
const { updater } = require('@architect/utils')

async function buildManifest ({ arc, inventory }) {
  const update = updater('named-routes')

  update.start('Building route manifest...')

  const namedRoutes = arc.http
    .filter(route => !Array.isArray(route))
    .reduce((routes, route) => {
      const [ path, { method: rawMethod, name } ] = Object.entries(route)[0]
      const method = rawMethod.toLowerCase()

      if (routes[method]?.[name] !== undefined) {
        throw new TypeError(`Duplicate route name ("${name}") + method (${method})`)
      }

      return { ...routes, [method]: { ...routes[method], [name]: path } }
    }, {})

  const manifestPath = path.resolve(inventory.inv._project.cwd, 'src/shared/routes.json')
  await fs.mkdir(path.dirname(manifestPath), { recursive: true })
  await fs.writeFile(manifestPath, JSON.stringify(namedRoutes))

  update.done('Route manifest built')
}

module.exports = {
  sandbox: {
    start: buildManifest,
  },
  deploy: {
    start: buildManifest,
  },
}
