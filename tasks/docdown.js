/*
 * grunt-docdown
 * https://github.com/mateusnroll/grunt-docdown
 *
 * Copyright (c) 2014 mateusnroll
 * Licensed under the MIT license.
 */

'use strict';
var marked      = require('marked');
var async       = require('async');
var handlebars  = require('handlebars');
var _           = require('underscore');
var frontMatter = require('yaml-front-matter');

var numberReplacePattern = new RegExp(/[/]*[0-9]*_/g);

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
        navigationHtml,
        assetsDestination      = this.files[0].orig.dest+'assets';

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
        grunt.log.writeln('\n-------\nCreating pages...');
        async.each(files,
          // Input file into template and create it
          function(file, cb) {
            var fileExtension = file.src[0].split('.');
            fileExtension = fileExtension[fileExtension.length-1];

            // If file is not markdown, just copy it as an asset
            if (fileExtension != "md") {
              grunt.file.copy(file.src[0], file.dest.replace(numberReplacePattern, '/'));
              grunt.log.writeln('Asset "' + file.dest.replace(numberReplacePattern, '/') + '" created.');
              return cb();
            }


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

            var page     = frontMatter.loadFront(markdownSource),
                pageHtml = marked(page.__content);

            var html = indexTemplate(page);
                html = html.replace('<#content>', pageHtml);
                html = html.replace('<#navigation>', navigationHtml);

            updateNaming(file, function(fileDestination){
              grunt.file.write(fileDestination, html);
              grunt.log.writeln('File  "' + fileDestination + '" created.');
              return cb();
            });
          },

          // Return the callback when completed
          function(error) {
            return callback(null, 'files');
          }
        );
      },

      // Copy asset files
      function(callback) {
        var assetsPattern     = [ options.assets+'/**/*{.js,.css}' ];

        grunt.log.writeln('\n-------\nCopying assets...');

        grunt.file.expand(assetsPattern).forEach(function(filepath){
          var destinationPath = assetsDestination+filepath.replace(options.assets, '');
          grunt.file.copy(filepath, destinationPath);
          grunt.log.writeln('Asset "' + destinationPath + '" created.');
        });
        
        callback(null, 'copy assets');
      }

    ],function(err, results){
      if(err) grunt.log.writeln('Something went wrong. Error:\n'+error);
      grunt.log.writeln('\n');
    });
  
    done();

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
    return callback(navigation);
  }
  );
}

var updateNaming = function(file, callback) {
  var fileName = file.dest;

  fileName = fileName.replace(numberReplacePattern, '/');
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