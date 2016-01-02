// @AngularClass

/*
 * Helper: root(), and rootDir() are defined at the bottom
 */
var path = require('path');
// Webpack Plugins
var webpack = require('webpack');
var ProvidePlugin = require('webpack/lib/ProvidePlugin');
var DefinePlugin = require('webpack/lib/DefinePlugin');
var OccurenceOrderPlugin = require('webpack/lib/optimize/OccurenceOrderPlugin');
var DedupePlugin = require('webpack/lib/optimize/DedupePlugin');
var UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
var CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ENV = process.env.NODE_ENV || process.env.ENV || 'production';

/*
 * Config
 */
module.exports = {
  // static
  metadata: {
    title: 'Angular2 Webpack Starter by @gdi2990 from @AngularClass',
    baseUrl: '/',
  },
  // for faster builds use 'eval'
  devtool: 'source-map',
  debug: true,
  context: root(),

  entry: {
    'vendor':'./src/vendor.ts',
    'app':'./src/bootstrap.ts' // our angular app
  },

  // Config for our build files
  output: {
    path: root('dist'),
    filename: '[name].[hash].bundle.js',
    sourceMapFilename: '[name].[hash].bundle.map',
    chunkFilename: '[id].chunk.js'
  },

  resolve: {
    root: root(),
    // ensure loader extensions match
    extensions: ['','.ts','.js','.json', '.css', '.html']
  },

  module: {
    preLoaders: [
      { test: /\.ts$/, loader: 'tslint-loader', exclude: [/node_modules/] }
    ],
    loaders: [
      // Support for .ts files.
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        query: {
          // remove TypeScript helpers to be injected below by DefinePlugin
          'compilerOptions': {
            'removeComments': true,
            'noEmitHelpers': true,
          },
          'ignoreDiagnostics': [
            2403, // 2403 -> Subsequent variable declarations
            2300, // 2300 -> Duplicate identifier
            2374, // 2374 -> Duplicate number index signature
            2375  // 2375 -> Duplicate string index signature
          ]
        },
        exclude: [ /\.(spec|e2e)\.ts$/, /node_modules\/(?!(ng2-.+))/ ]
      },

      // Support for *.json files.
      { test: /\.json$/,  loader: 'json-loader' },

      // Support for CSS as raw text
      { test: /\.css$/,   loader: 'raw-loader' },

      // support for .html as raw text
      { test: /\.html$/,  loader: 'raw-loader' }

      // if you add a loader include the file extension
    ]
  },

  plugins: [
    new CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.[hash].bundle.js',
      minChunks: Infinity
    }),
    new CommonsChunkPlugin({
      name: 'common',
      filename: 'common.[hash].bundle.js',
      minChunks: 2,
      chunks: [
        'app', // keep sync with entry
        'vendor'  // keep sync with entry
      ]
    }),
    // new webpack.NormalModuleReplacementPlugin('angular2', 'angular2/ts'),
    // static assets
    new CopyWebpackPlugin([
      {
        from: 'src/assets',
        to: 'assets'
      }
    ]),
    // generating html
    new DedupePlugin(),
    new OccurenceOrderPlugin(true),
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),
    new ProvidePlugin({
      'Reflect': 'es7-reflect-metadata/dist/browser' // Thanks Aaron (https://gist.github.com/Couto/b29676dd1ab8714a818f#gistcomment-1584602)
    }),
    new DefinePlugin({
      'process.env.ENV': JSON.stringify(ENV),
      'process.env.NODE_ENV': JSON.stringify(ENV),
      'global': 'window'
    }),
    new DefinePlugin({
      // TypeScript helpers
      '__metadata': 'Reflect.metadata',
      '__decorate': 'Reflect.decorate',
      // Taken from TypeScript Source until I use a module
      '__param': 'function (paramIndex, decorator) {\n    return function (target, key) { decorator(target, key, paramIndex); }\n}',
      '__extends': '\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};',
      '__awaiter': '\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, Promise, generator) {\n    return new Promise(function (resolve, reject) {\n        generator = generator.call(thisArg, _arguments);\n        function cast(value) { return value instanceof Promise && value.constructor === Promise ? value : new Promise(function (resolve) { resolve(value); }); }\n        function onfulfill(value) { try { step(\"next\", value); } catch (e) { reject(e); } }\n        function onreject(value) { try { step(\"throw\", value); } catch (e) { reject(e); } }\n        function step(verb, value) {\n            var result = generator[verb](value);\n            result.done ? resolve(result.value) : cast(result.value).then(onfulfill, onreject);\n        }\n        step(\"next\", void 0);\n    });\n};'
    }),
    new UglifyJsPlugin({
      // beautify: true,
      // mangle: false,
      comments: false,
      compress : {
        screw_ie8 : true
      },
      mangle: {
        screw_ie8 : true,
        except: [
          'Zone',
          'zone',
          'Reflect',
          'window'
        ]
      }
    })
   // include uglify in production
  ],
  // Other module loader config
  tslint: {
    emitErrors: true,
    failOnHint: true
  },
  // don't use devServer for production

  // we need this due to problems with es6-shim
  node: {
    progress: false,
    crypto: 'empty',
    module: false,
    clearImmediate: false,
    setImmediate: false
  }
};

// Helper functions

function root(args) {
  args = Array.prototype.slice.call(arguments, 0);
  return path.join.apply(path, [__dirname].concat(args));
}

function rootNode(args) {
  args = Array.prototype.slice.call(arguments, 0);
  return root.apply(path, ['node_modules'].concat(args));
}
