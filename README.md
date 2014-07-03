glsl-transition-minify
===

Minify a GLSL Transition.

As a Module
---

```sh
npm install glsl-transition-minify
```

```javascript
var minify = require("glsl-transition-minify");
var minified = minify({
  glsl: "...",
  name: "foo",
  ...
});
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

**Server usage**

```sh
glsl-transition-minify -s 10101
```

then in another shell:

```sh
curl -X POST -d '{ "glsl": "void main () { float abcdef = 1.000; }" }' http://localhost:10101/compile

# value returned:
{"glsl":"void main(){float a=1.;}"}
```


