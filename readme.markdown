# codebux

This program computes technical debt for node programs.

Lines of code are spent. You start at $100. You don't get any more codebux.

You lose codebux for:

* too much code
* too many deeply-nested expressions

Your codebux score doesn't stop at $0, it keeps going down into the negative
numbers.

# example

For instance codebux itself has a score of:

```
$ codebux ~/projects/codebux
+   100.00  # initial stipend
-     5.63  # index.js
-     1.94  # lib/complexity.js
—————————————————————————————————————————————————
+    92.42
```

other projects don't fare as well:

```
$ codebux ~/projects/node-browserify
+   100.00  # initial stipend
-    12.55  # index.js
-    34.91  # lib/wrap.js
-     0.33  # lib/wrappers.js
-   100.32  # lib/watch.js
—————————————————————————————————————————————————
-    48.12
```

# usage

```
usage: codebux [files or directories...]

Recursively trace the static require() dependency graph for every file or
directory provided.
```

# methods

``` js
var codebux = require('codebux')
```

## var s = codebux(file, cb)

Compute the codebux for file or directory entry point `file`. This file or
directory's dependency graph will be recursively traversed to compute the score.

At the end of the traversal, `cb(err, total)` fires with the final codebux
tally.

Returns an event emitter that you can latch onto for the specific scores for
each file along the way.

# events

## s.on('price', fucntion (price, desc) { ... })

Emitted when a price gets computed, including the description of the price.

## s.on('total', function (total) { ... })

Emitted with the running total every time a cost gets computed.

## s.on('file', function (price, file)

Emitted when a file's cost has been completely calculated.

# install

With [npm](http://npmjs.org), to get the bin script do:

```
npm install -g codebux
```

and to get the library do:

```
npm install codebux
```

# license

MIT
