'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.docdown = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  default_options: function(test) {
    test.expect(6);

    // #1
    var actualCssStyle   = grunt.file.read('tmp/assets/css/style.css'),
        expectedCssStyle = grunt.file.read('test/expected/assets/css/style.css');
    test.equal(actualCssStyle, expectedCssStyle, 
      'should copy the stylesheet');

    // #2
    var actualScript   = grunt.file.read('tmp/assets/script/main.js'),
        expectedScript = grunt.file.read('test/expected/assets/script/main.js');
    test.equal(actualScript, expectedScript, 
      'should copy the script');

    // #3
    var actualFirstItemFirstFile   = grunt.file.read('tmp/first-item/first-item-first-file.html'),
        expectedFirstItemFirstFile = grunt.file.read('test/expected/first-item/first-item-first-file.html');
    test.equal(actualFirstItemFirstFile, expectedFirstItemFirstFile, 
      'should generate the first file');

    // #4
    var actualFirstItemSecondFile   = grunt.file.read('tmp/first-item/first-item-second-file.html'),
        expectedFirstItemSecondFile = grunt.file.read('test/expected/first-item/first-item-second-file.html');
    test.equal(actualFirstItemSecondFile, expectedFirstItemSecondFile, 
      'should generate the second file');

    // #5
    var actualFirstItemAsset   = grunt.file.read('tmp/first-item/spiderman.gif'),
        expectedFirstItemAsset = grunt.file.read('test/expected/first-item/spiderman.gif');
    test.equal(actualFirstItemAsset, expectedFirstItemAsset, 
      'should copy the first item asset');

    // #6
    var actualSecondItem   = grunt.file.read('tmp/second-item.html'),
        expectedSecondItem = grunt.file.read('test/expected/second-item.html');
    test.equal(actualSecondItem, expectedSecondItem, 
      'should generate the second item');

    test.done();
  }
};
