var minify = require("./minify");
var assert = require("assert");

describe("minify", function () {
  var glsl1 = "void main () { float abcdef = 1.000; }";
  var expect1 = "void main(){float abcdef=1.;}";

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
  it("should refuse invalid glsl", function () {
    assert.throws(function () {
      console.log(minify({ "glsl": "void main () { float a = 10.0" }));
    });
    assert.throws(function () {
      console.log(minify({ "glsl": "void main () { float a = 10.0 }" }));
    });
    /*
    // FIXME this is not working:
    assert.throws(function () {
      console.log(minify({ "glsl": "void main () { float a = 10; }" }));
    });
    assert.throws(function () {
      console.log(minify({ "glsl": "void main () { int a = 10.2; }" }));
    });
    */
  });
  it("should preserve the uniforms", function () {
    var minified = minify({ "glsl": "uniform vec2 foobar; void main () { float abcdef = 1.000; }" });
    assert.notEqual(minified.glsl.indexOf("foobar"), -1, "foobar is still present.");
  });
  it("should not collide when using uniforms called 'a' or 'b'", function () {
    var minified = minify({ "glsl": "uniform vec2 a; uniform vec2 foobar; uniform vec2 b; void main () { int foo = 42; int i = 42; }" });
    console.log(minified);
    assert.equal(minified.glsl.indexOf("int a"), -1, "There was no rename of int variable");
    assert.equal(minified.glsl.indexOf("int b"), -1, "There was no rename of int variable");
  });
});
