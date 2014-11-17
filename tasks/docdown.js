/*
 * grunt-docdown
 * https://github.com/mateusnroll/grunt-docdown
 *
 * Copyright (c) 2014 mateusnroll
 * Licensed under the MIT license.
 */

'use strict';
var marked = require('marked');
var async = require('async');

module.exports = function(grunt) {

  grunt.registerMultiTask('docdown', 'Generate documentation from markdown files', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({});
    var done = this.async();


    createNavigation(this.files);

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      // Concat specified files.
      var src = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        // Read file source.
        return grunt.file.read(filepath);
      });
      
      src = marked(src[0]);

      f.dest = f.dest.replace('.md', '.html');

      grunt.file.write(f.dest, src);

      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });

};

var createNavigation = function (files, callback) {
  var pattern = new RegExp(/[/]*[0-9]*_/g);
  var navigationFiles = [];

  async.each(files, 
    function(file,callback){
      updateNaming(file.dest, 
        function(string){
          navigationFiles.push(string);
          callback();
        });
    },
    function(err){
      console.log(navigationFiles);
    }
  );
}

var updateNaming = function(string, callback) {
  var pattern = new RegExp(/[/]*[0-9]*_/g);
  callback(string.replace(pattern, '/').replace('.md', '.html'));
}