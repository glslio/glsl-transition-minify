var minify = require("./minify");
var assert = require("assert");

describe("minify", function () {
  var glsl1 = "void main () { float abcdef = 1.000; }";
  var expect1 = "void main(){float a=1.;}";
  it("should minify simple GLSL code", function () {
    assert.equal(minify({ "glsl": glsl1 }).glsl, expect1);
  });
  it("should preserve the given JSON", function () {
    var minified = minify({ "glsl": glsl1, "name": "myname", "foo": "bar", "universe": 42 });
    assert.equal(minified.name, "myname");
    assert.equal(minified.foo, "bar");
    assert.equal(minified.universe, 42);
    assert.equal(Object.keys(minified).length, 4, "The minified have 4 keys");
  });
});
