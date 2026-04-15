import { createFilter } from 'unplugin-utils'
import { describe, expect, it } from 'vitest'
import { unplugin } from '../src/unplugin'

function createPlugin(config?: Parameters<typeof unplugin>[0]) {
  return unplugin(config).raw(undefined as never, {
    framework: 'webpack',
    webpack: {
      compiler: {} as any,
    },
  }) as any
}

function matchesIdFilter(idFilter: any, id: string) {
  if (typeof idFilter === 'string' || idFilter instanceof RegExp || Array.isArray(idFilter))
    return createFilter(idFilter, undefined)(id)

  return createFilter(idFilter.include, idFilter.exclude)(id)
}

describe('webpack unplugin filters', () => {
  it('filters html and binary assets before transform', () => {
    const plugin = createPlugin()
    const transformFilter = plugin.transform.filter.id

    expect(matchesIdFilter(transformFilter, '/src/main.tsx')).toBe(true)
    expect(matchesIdFilter(transformFilter, '/src/index.html')).toBe(false)
    expect(matchesIdFilter(transformFilter, '/src/assets/font.woff2')).toBe(false)
  })

  it('includes uno virtual modules for load', () => {
    const plugin = createPlugin()
    const loadFilter = plugin.load.filter.id

    expect(matchesIdFilter(loadFilter, '/__uno.css')).toBe(true)
    expect(matchesIdFilter(loadFilter, '/__uno_layer.css')).toBe(true)
    expect(matchesIdFilter(loadFilter, '/src/main.ts')).toBe(false)
  })

  it('keeps custom virtual module prefixes working after config resolution', async () => {
    const plugin = createPlugin({
      virtualModulePrefix: 'custom_uno',
    })

    expect(await plugin.resolveId('virtual:uno.css')).toBe('/custom_uno.css')
    const transformFilter = plugin.transform.filter.id
    const loadFilter = plugin.load.filter.id
    expect(matchesIdFilter(loadFilter, '/custom_uno.css')).toBe(true)
    expect(matchesIdFilter(transformFilter, '/custom_uno.css')).toBe(false)
  })
})
