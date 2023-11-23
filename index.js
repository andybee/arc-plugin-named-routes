const fs = require('fs/promises')
const path = require('path')
const { updater } = require('@architect/utils')

const externalPrefix = 'external.'

async function buildManifest ({ arc, inventory, stage = 'testing' }) {
  const update = updater('named-routes')

  update.start('Building route manifest...')

  // build the manifest object
  const manifest = arc.http
    // remove routes defined as an array (without params, cannot have names)
    .filter(route => !Array.isArray(route))
    // convert key/value entry in to an object that's easier to work with
    .map(route => ({ ...Object.entries(route)[0][1], path: Object.entries(route)[0][0] }))
    // ignore routes with no name
    .filter(({ name }) => name !== undefined)
    // reduce the routes in to an object
    .reduce(
      (routes, route) => {
        const { path, method: rawMethod, name: nameOrNames } = route
        const names = Array.isArray(nameOrNames) ? nameOrNames : [ nameOrNames ]
        if (names.some(name => name.startsWith(externalPrefix))) {
          throw new Error('Cannot define internal named route with `${externalPrefix}` prefix')
        }
        const method = rawMethod.toLowerCase() // ensure methods are case insensitive
        const additions = names.reduce(
          (accumulator, name) => {
            if (routes[method]?.[name] !== undefined) {
              throw new TypeError(`Duplicate route name ("${name}") + method (${method})`)
            }
            return { ...accumulator, [name]: path }
          },
          {},
        )
        return { ...routes, [method]: { ...routes[method], ...additions } }
      },
      {},
    )

  // append any external routes
  arc['named-routes']?.forEach(({ [stage]: externalStageRoutes = {} }) => {
    manifest.any = {
      ...manifest.any,
      ...Object.entries(externalStageRoutes).reduce(
        (routes, [ key, value ]) => ({ ...routes, [`${externalPrefix}${key}`]: value }),
        {},
      ),
    }
  })

  // write the manifest to file in /shared directory
  const manifestPath = path.resolve(inventory.inv._project.cwd, 'src/shared/routes.json')
  await fs.mkdir(path.dirname(manifestPath), { recursive: true })
  await fs.writeFile(manifestPath, JSON.stringify(manifest))

  update.done('Route manifest built')
}

module.exports = {
  // run on Sandbox (re)start, also capture updates to app.arc
  sandbox: {
    start: buildManifest,
  },
  // run prior to deployment
  deploy: {
    start: buildManifest,
  },
}
