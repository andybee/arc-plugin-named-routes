const buildManifest = require('./buildManifest')
const route = require('./route')

module.exports = {
  sandbox: { start: buildManifest },
  deploy: { start: buildManifest },
  route,
}
