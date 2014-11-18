/*
 * grunt-docdown
 * https://github.com/mateusnroll/grunt-docdown
 *
 * Copyright (c) 2014 mateusnroll
 * Licensed under the MIT license.
 */

'use strict';
var marked     = require('marked');
var async      = require('async');
var handlebars = require('handlebars');
var _          = require('underscore');

module.exports = function(grunt) {

  grunt.registerMultiTask('docdown', 'Generate documentation from markdown files', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({}),
        done    = this.async(),
        files   = this.files;

    var indexTemplatePath      = options.assets+'/templates/index.hbs',
        indexTemplate,
        navigationTemplatePath = options.assets+'/templates/navigation.hbs',
        navigationTemplate,
        navigationHtml;

    async.series([
      // Instanciate templates and stuff
      function(callback) {
        if (!grunt.file.exists(indexTemplatePath)) {
          grunt.log.warn(indexTemplatePath+' not found');
          return done(false); }
        if (!grunt.file.exists(navigationTemplatePath)) {
          grunt.log.warn(navigationTemplatePath+' not found');
          return done(false); } 

        indexTemplate      = handlebars.compile(grunt.file.read(indexTemplatePath));
        navigationTemplate = handlebars.compile(grunt.file.read(navigationTemplatePath));

        callback(null, 'templates');
      },

      // Create navigation
      function(callback) {
        createNavigation(files, function(navStructure){
          navigationHtml = navigationTemplate(navStructure);
          callback(null, 'navigation');
        });
      },

      // Create files
      function(callback) {
        async.each(files,
          function(file, cb) {
            var markdownSource = file.src
            .filter(function(filepath) {
              if (!grunt.file.exists(filepath)) {
                grunt.log.warn('Source file "' + filepath + '" not found.');
                return false;
              } 
              else return true;
            })
            .map(function(filepath) {
              return grunt.file.read(filepath);
            });
            markdownSource = marked(markdownSource[0]);
          
            var html = indexTemplate({title: 'Test'});
                html = html.replace('<#content>', markdownSource);
                html = html.replace('<#navigation>', navigationHtml);

            updateNaming(file, function(fileDestination){
              grunt.file.write(fileDestination, html);
              grunt.log.writeln('File "' + fileDestination + '" created.');
              cb();
            });
          },

          function(error) {
            return callback(null, 'files');
          }
        );
      }

    ],function(err, results){});

  });

};

var createNavigation = function (files, callback) {
  var navigation = [];
  var destinationName = files[0].orig.dest;

  async.each(files, 
  
  function(file, callback){
    updateNaming(file, 
      function(filepath){
      filepath = filepath.replace(destinationName, '');

      if(filepath.indexOf('/') > 0) {
        // is nested
        var filepathArray = filepath.split('/');

        // looks for an already existing parent
        var parent = _.find(navigation, function(target){
          return target.title = nameFromSlug(filepathArray[0]);
        });

        // parent found, push to it
        if (parent !== undefined)
          parent.files.push({title:nameFromSlug(filepathArray[1]), href:filepath});

        // no parent found, create it
        else
          navigation.push({
            title: nameFromSlug(filepathArray[0]),
            files: [
              {title: nameFromSlug(filepathArray[1]), href: filepath}
            ]
          });

      }

      else
        navigation.push({title:nameFromSlug(filepath), href:filepath});

      return callback();
    });
  },

  function(err){
    console.log(navigation);
    return callback(navigation);
  }
  );
}

var updateNaming = function(file, callback) {
  var pattern = new RegExp(/[/]*[0-9]*_/g);
  var fileName = file.dest;

  fileName = fileName.replace(pattern, '/');
  fileName = fileName.replace('.md', '.html');

  callback(fileName);
}

var nameFromSlug = function(string) {
  var name = string;

  name = name.replace(/-/g, ' ');
  name = name.replace('.html', '');
  name = name.charAt(0).toUpperCase() + name.slice(1);

  return name;
}