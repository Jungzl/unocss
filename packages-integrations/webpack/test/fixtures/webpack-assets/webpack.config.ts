import type { Configuration } from 'webpack'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import UnoCSS, { type WebpackPluginOptions } from '../../../src'

const dir = path.dirname(fileURLToPath(import.meta.url))

export interface WebpackFixtureConfigOptions {
  /**
   * Use webpack's native CSS pipeline (`experiments.css`) instead of
   * `asset/source`, so the virtual CSS module is emitted as a stylesheet.
   */
  nativeCss?: boolean
}

export function createWebpackConfig(
  options?: WebpackPluginOptions,
  { nativeCss = false }: WebpackFixtureConfigOptions = {},
): Configuration {
  return {
    context: dir,
    mode: 'production',
    entry: './src/main.js',
    output: {
      path: path.join(dir, 'dist'),
      filename: 'main.js',
      assetModuleFilename: 'assets/[name][ext]',
      clean: true,
    },
    experiments: nativeCss ? { css: true } : undefined,
    module: {
      rules: [
        {
          test: /\.png$/,
          type: 'asset/resource',
        },
        ...(nativeCss
          ? []
          : [{
              test: /\.css$/,
              type: 'asset/source' as const,
            }]),
      ],
    },
    plugins: [
      UnoCSS(options),
    ],
    optimization: {
      minimize: false,
    },
  }
}
