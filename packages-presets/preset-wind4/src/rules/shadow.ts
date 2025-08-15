import type { CSSObject, CSSValueInput, Rule, RuleContext } from '@unocss/core'
import type { Theme } from '../theme'
import {
  colorableShadows,
  colorResolver,
  defineProperty,
  getStringComponents,
  h,
  hasParseableColor,
  hyphenate,
} from '../utils'

export const shadowProperties = {
  shadow: defineProperty('--un-shadow', { initialValue: '0 0 #0000' }),
  shadowColor: defineProperty('--un-shadow-color'),
  shadowAlpha: defineProperty('--un-shadow-alpha', { syntax: '<percent>', initialValue: '100%' }),
  insetShadow: defineProperty('--un-inset-shadow', { initialValue: '0 0 #0000' }),
  insetShadowColor: defineProperty('--un-inset-shadow-color'),
  insetShadowAlpha: defineProperty('--un-inset-shadow-alpha', { syntax: '<percent>', initialValue: '100%' }),
  ringColor: defineProperty('--un-ring-color'),
  ringShadow: defineProperty('--un-ring-shadow', { initialValue: '0 0 #0000' }),
  insetRingColor: defineProperty('--un-inset-ring-color'),
  insetRingShadow: defineProperty('--un-inset-ring-shadow', { initialValue: '0 0 #0000' }),
  ringInset: defineProperty('--un-ring-inset'),
  ringOffsetWidth: defineProperty('--un-ring-offset-width', { syntax: '<length>', initialValue: '0px' }),
  ringOffsetColor: defineProperty('--un-ring-offset-color'),
  ringOffsetShadow: defineProperty('--un-ring-offset-shadow', { initialValue: '0 0 #0000' }),
}

export const boxShadows: Rule<Theme>[] = [
  // shadow
  [/^shadow(?:-?(.+))?$/, handleShadow('shadow'), { autocomplete: ['shadow-$colors', 'shadow-$shadow'] }],
  [/^shadow-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-shadow-opacity': h.bracket.percent.cssvar(opacity) }), { autocomplete: 'shadow-(op|opacity)-<percent>' }],

  // inset shadow
  [/^inset-shadow(?:-(.+))?$/, handleShadow('insetShadow'), { autocomplete: ['inset-shadow-$colors', 'inset-shadow-$insetShadow'] }],
  [/^inset-shadow-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-inset-shadow-opacity': h.bracket.percent.cssvar(opacity) }), { autocomplete: 'shadow-(op|opacity)-<percent>' }],
]

function handleShadow(themeKey: 'shadow' | 'insetShadow') {
  return (match: RegExpMatchArray, ctx: RuleContext<Theme>): CSSObject | (CSSValueInput | string)[] | undefined => {
    const [, d] = match
    const { theme } = ctx
    let res: string[] = []
    if (d) {
      res = getStringComponents(d, '/', 2) ?? []
      if (d.startsWith('/'))
        res = ['', d.slice(1)]
    }
    const v = theme[themeKey]?.[res[0] || 'DEFAULT']
    const c = d ? h.bracket.cssvar(d) : undefined
    const shadowVar = hyphenate(themeKey)

    console.log({
      match,
      d,
      res,
      v,
      c,
      hasParseableColor: hasParseableColor(c, theme),
      [`--un-${shadowVar}`]: colorableShadows((v || c)!, `--un-${shadowVar}-color`).join(','),
      as: colorResolver(`--un-${shadowVar}-color`, shadowVar)(match, ctx),
    })

    if ((v != null || c != null) && !hasParseableColor(c, theme)) {
      if (res[1]) {
        console.log('shadow with opacity', match[0])
      }
      const result = [
        {
          [`--un-${shadowVar}-alpha`]: res[1] ? h.bracket.percent(res[1]) : undefined,
          [`--un-${shadowVar}`]: colorableShadows((v || c)!, `--un-${shadowVar}-color`, res[1]).join(','),
          'box-shadow': 'var(--un-inset-shadow), var(--un-inset-ring-shadow), var(--un-ring-offset-shadow), var(--un-ring-shadow), var(--un-shadow)',
        },
        ...Object.values(shadowProperties),
      ]

      return result
    }
    console.log('hey', d)
    return colorResolver(`--un-${shadowVar}-color`, shadowVar)(match, ctx)
  }
}
