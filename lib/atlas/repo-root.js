// Where the repository root is, in a form the bundler leaves alone.
//
// Every module that reads a data file needs the repository root, and the
// obvious way to write it is `new URL('../../', import.meta.url)`. That works
// in Node and breaks the production build, because webpack treats
// `new URL(<literal>, import.meta.url)` as an asset reference and tries to
// resolve the literal as a module. A file resolves and gets bundled; a
// directory does not resolve at all, and the build fails with
// `Module not found: Can't resolve '../../'`.
//
// Computing the same URL through `fileURLToPath` is invisible to that
// analysis, because the argument is no longer a literal in the position the
// bundler inspects. The return value is still a URL ending in a slash, so
// every `new URL(relativePath, ROOT)` call site keeps working unchanged and
// nothing downstream has to know this happened.
//
// These files are read on the server only, at build time or in a route
// handler, so resolving against the real filesystem is correct. A module that
// needs to ship data to the browser should import the JSON instead.

import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

export function rootFrom(moduleUrl, up = '../..') {
  return pathToFileURL(resolve(dirname(fileURLToPath(moduleUrl)), up) + '/');
}
