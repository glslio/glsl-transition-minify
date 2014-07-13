glsl-transition-minify [![Build Status](https://travis-ci.org/glslio/glsl-transition-minify.svg?branch=master)](https://travis-ci.org/glslio/glsl-transition-minify)
===

Minify a GLSL Transition.

As a Module
---

```sh
npm install glsl-transition-minify
```

```javascript
var minify = require("glsl-transition-minify");
var minifiedStream = minify(process.stdin);
minifiedStream.pipe(process.stdout);
```

As a Command Line
---

```sh
npm install -g glsl-transition-minify
```

**CLI usage**

```sh
cat transition.glsl | glsl-transition-minify > minified.glsl
```

or alternatively:
```sh
glsl-transition-minify -i transition.glsl -o minified.glsl
```

**Server usage**

```sh
glsl-transition-minify -s 10101
```

then in another shell:

```sh
curl -X POST -d 'void main () { float abcdef = 1.000; }' http://localhost:10101/compile

# value returned:
void main(){float a=1.;}
```

