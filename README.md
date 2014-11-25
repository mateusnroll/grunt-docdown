# grunt-docdown

> Generate documentation from markdown files

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-docdown --save
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-docdown');
```

## The "docdown" task

### Overview
In your project's Gruntfile, add a section named `docdown` to the data object passed into `grunt.initConfig()`. Use the `files` object to point to your documentation folder. You can see a sample folder at `test/fixtures/content`.

```js
grunt.initConfig({
  docdown: {
      default_options: {
        options: {
          assets: 'test/fixtures/assets'
        },
        files: [{
          expand: true,
          cwd: 'test/fixtures/content',
          src: '**/*.*',
          dest: 'tmp/'
        }]
      }
    },
});
```

### Options

#### options.assets
Type: `String`
Required: `Yes`

The folder that holds you asset files. You can use the files in `test/fixtures/assets` as a base and build your own theme.

## Release History
_(Nothing yet)_
