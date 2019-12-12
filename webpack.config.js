    const path = require('path');
    const join = require("path").join;
    const webpack = require('webpack');

    module.exports = {
       entry: './project/frontend/src/index.js',
       output:{
        path: __dirname + '/project/frontend/static/frontend/',
        publicPath: '/',
        filename: 'main.js'
        },
        devServer: {
         contentBase: './project/frontend/templates/frontend',
         writeToDisk: true,
         hot: true
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin()
        ],
      resolve: {
                    alias: {
                      globalize$: path.resolve( __dirname, "node_modules/globalize/dist/globalize.js" ),
                      globalize: path.resolve(__dirname, "node_modules/globalize/dist/globalize"),
                      cldr$: path.resolve(__dirname, "node_modules/cldrjs/dist/cldr.js"),
                      cldr: path.resolve(__dirname, "node_modules/cldrjs/dist/cldr")
                    },
               },

      module: {

      loaders: [
      {exclude: ['node_modules'], loader: 'babel', test: /\.jsx?$/},
      {loader: 'style-loader!css-loader', test: /\.css$/},
      {loader: 'url-loader', test: /\.gif$/},
      {loader: 'file-loader', test: /\.(ttf|eot|svg)$/},
    ],
  },
  resolve: {
    alias: {
      config$: './configs/app-config.js',
      react: './vendor/react-master',
    },
    extensions: ['', 'js', 'jsx'],
    modules: [
      'node_modules',
      'bower_components',
      'shared',
      '/shared/vendor/modules',
    ],
  },

        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env']
                }
            }
          },

          {
            test: /\.jsx$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env']
                }
            }
          },

          {
            test: /\.css$/,
            use: [
              { loader: "style-loader" },
              { loader: "css-loader" }]
          },
          {
            test: /\.(eot|svg|ttf|woff|woff2)$/,
            use: "url-loader?name=[name].[ext]"
          }
        ]
      }
    };


