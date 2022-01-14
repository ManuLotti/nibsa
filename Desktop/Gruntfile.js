var httpPlease, middlewares, proxy, serveStatic, url, sass;

url = require('url');

sass = require('node-sass');

proxy = require('proxy-middleware');

serveStatic = require('serve-static');

httpPlease = require('connect-http-please');

middlewares = require('./speed-middleware');

module.exports = function(grunt) {

  var accountName,
      config,
      environment,
      imgProxyOptions,
      name,
      pkg,
      portalHost,
      portalProxyOptions,
      results,
      _rewriteLocation,
      taskArray,
      taskName,
      tasks,
      verbose;

  pkg = grunt.file.readJSON('package.json');

  accountName = process.env.VTEX_ACCOUNT || pkg.accountName || 'basedevmkp';
  environment = process.env.VTEX_ENV || 'vtexcommercestable';
  verbose = grunt.option('verbose');
  imgProxyOptions = url.parse("https://" + accountName + ".vteximg.com.br/arquivos");
  imgProxyOptions.route = '/arquivos';
  portalHost = accountName + "." + environment + ".com.br";
  portalProxyOptions = url.parse("https://" + portalHost + "/");

  portalProxyOptions.preserveHost = true;
  portalProxyOptions.cookieRewrite = accountName + ".vtexlocal.com.br";

  _rewriteLocation = function(location) {
    return location.replace('http:', 'https:').replace(environment, 'vtexlocal');
  };

  config = {

    concurrent: {
      target: {
        tasks: ['watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    },

    clean: {
      main: ['build']
    },

    copy: {
      main: {
        files: [
          {
            expand: true,
            flatten: true,
            cwd: 'src/',
            src: ['js/_minified/*.js', 'css/**/*.css', 'css/**/*.map', 'images/_minified/*'],
            dest: 'build/arquivos/'
          }
        ]
      }
    },

    sass: {
      options: {
        implementation: sass,
        includePaths: ['sass/'],
        outputStyle: 'compressed',
        sourceMap: false
      },
      main: {
        files: [{
          expand: true,
          cwd: "src/sass",
          src: ["**/*.scss"],
          dest: 'src/css/',
          ext: '.css'
        }]
      }
    },

    uglify: {
      options: {
        mangle: false
      },
      main: {
        files: [
          {
            expand: true,
            cwd: 'src/js',
            src: ['**/*.js', '!_minified/**/*.js'],
            dest: 'src/js/_minified/',
            ext: '.min.js'
          }
        ]
      },
    },

    imagemin: {
      main: {
        files: [
          {
            expand: true,
            cwd: 'src/images',
            src: ['*.{png,jpg,gif}'],
            dest: 'src/images/_minified/'
          }
        ]
      }
    },

    connect: {
      https: {
        options: {
          hostname: "*",
          livereload: true,
          protocol: 'https',
          port: process.env.PORT || 443,
          key: grunt.file.read('./src/certificates/server.key'),
          cert: grunt.file.read('./src/certificates/server.crt'),
          middleware: [
            middlewares.disableCompression,
            middlewares.rewriteLocationHeader(_rewriteLocation),
            middlewares.replaceHost(portalHost),
            middlewares.replaceHtmlBody(environment, accountName),
            httpPlease({
              host: portalHost,
              verbose: verbose
            }),
            serveStatic('./build'),
            proxy(imgProxyOptions),
            proxy(portalProxyOptions),
            middlewares.errorHandler
          ]
        }
      }
    },


    watch: {

      options: {
        livereload: {
          hostname: "*",
          key: grunt.file.read('./src/certificates/server.key'),
          cert: grunt.file.read('./src/certificates/server.crt'),
        },
      },

      buildSass: {
        files: ['**/*.scss'],
        tasks: ['sass:main'],
        options: {
          livereload: false
        },
      },
      minJs: {
        files: ['src/js/**/*.js', '!src/js/_minifed'],
        tasks: ['newer:uglify:main'],
        options: {
          livereload: false
        },
      },
      minImgs: {
        files: ['src/images/**/*.{png,jpg,gif}', '!src/images/_minifed/*'],
        tasks: ['newer:imagemin:main'],
        options: {
          livereload: false
        },
      }, 
      buildCopy: {
        files: ['src/js/_minified/*.js', 'src/css/**/*.css', 'src/images/_minified/*'],
        tasks: ['newer:copy:main'],
        options: {
          livereload: false
        },
      },

      watchCss: {
        files: ['./build/arquivos/*.css'],
        options: {
          livereload: true
        },
      },
      watchJs: {
        files: ['./build/arquivos/*.js'],
        options: {
          livereload: true
        },
      },

      grunt: {
        files: ['Gruntfile.js']
      }
    }
    // Watch

  };
  // CONFIG

  tasks = {
    build: ['clean', 'sass:main', 'uglify', 'imagemin', 'copy:main'],
    default: ['build', 'connect:https', 'concurrent'],
  };
  // TASKS

  // Load Dependencies
  grunt.config.init(config);
  for (name in pkg.devDependencies) {
    if (name.slice(0, 6) === 'grunt-') {
      grunt.loadNpmTasks(name);
    }
  }

  // Load tasks
  results = [];
  for (taskName in tasks) {
    taskArray = tasks[taskName];
    results.push(grunt.registerTask(taskName, taskArray));
  }
  return results;

};
// Grunt