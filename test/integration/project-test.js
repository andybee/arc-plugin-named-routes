const sandbox = require('@architect/sandbox')
const test = require('tape')
const { existsSync, readFileSync, rmSync } = require('fs')
const { join } = require('path')

const port = 6666
const cwd = join(process.cwd(), 'test', 'mock')
const manifestPath = join(cwd, 'src', 'shared', 'routes.json')

const reset = () => rmSync(manifestPath, { recursive: true, force: true })

/**
 * Ideally these tests would also exercise the watcher method
 * However, running / terminating the Sandbox in a child process is a bit onerous so let's consider it a TODO
 */
test('Start Sandbox', async t => {
  t.plan(1)
  reset()
  await sandbox.start({ cwd, port, quiet: true })
  t.pass('Started Sandbox')
})

test('Manifest created', async t => {
  t.plan(2)
  t.ok(existsSync(manifestPath), 'Found route manifest')
  const manifest = readFileSync(manifestPath).toString()
  const expectedManifestContent = {
    get: {
      a: '/a',
      b: '/b/:id',
      c: '/multi',
      d: '/multi',
      e: '/multi',
    },
    post: {
      a: '/a',
    },
    put: {
      b: '/c/:id',
    },
  }
  t.deepEqual(manifest, JSON.stringify(expectedManifestContent), 'Manifest contains expected entries')
})

test('Shut down Sandbox', async t => {
  t.plan(1)
  await sandbox.end()
  reset()
  t.pass('Shut down Sandbox')
})
