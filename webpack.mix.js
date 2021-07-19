let mix = require('laravel-mix');
mix
.webpackConfig({
  module: {
    rules: [
      {
        test: /\.csv$/,
        loader: 'csv-loader',
        options: {
          dynamicTyping: true,
          header: true,
          skipEmptyLines: true
        }
      },
    ]}
})
.js('src/index.js', 'drupal/dist/bundle.js')
.vue()
;
