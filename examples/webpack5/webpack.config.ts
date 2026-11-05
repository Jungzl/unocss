import type { Configuration } from 'webpack'
import UnoCSS from '@unocss/webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'

interface WebpackEnv {
  WEBPACK_SERVE?: boolean
}

export default (env: WebpackEnv = {}): Configuration => {
  const serve = Boolean(env.WEBPACK_SERVE)

  return {
    entry: './src/index.ts',
    output: {
      module: true,
    },
    experiments: {
      // Use webpack's native CSS pipeline, so `uno.css` is emitted as a stylesheet
      css: true,
    },
    devServer: {
      static: './dist',
      hot: true,
      // The HTML template is not part of webpack's module graph; reload the
      // page when it changes so the new markup is picked up.
      watchFiles: ['src/**/*.html'],
    },
    plugins: [
      // Watch `content.filesystem` in dev so classes added to the HTML template
      // are extracted without restarting the dev server.
      UnoCSS({ watch: serve }),
      new HtmlWebpackPlugin({
        template: './src/index.html',
        scriptLoading: 'module',
      }),
    ],
    optimization: {
      realContentHash: true,
    },
  }
}
