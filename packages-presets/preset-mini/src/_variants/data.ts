import type { Variant, VariantContext, VariantObject } from '@unocss/core'
import type { PresetMiniOptions } from '@unocss/preset-mini'
import type { Theme } from '../theme'
import { h, variantGetParameter } from '../utils'

export const variantDataAttribute: VariantObject = {
  name: 'data',
  match(matcher, ctx: VariantContext<Theme>) {
    const variant = variantGetParameter('data-', matcher, ctx.generator.config.separators)
    if (variant) {
      const [match, rest] = variant
      const dataAttribute = h.bracket(match) ?? ctx.theme.data?.[match] ?? ''
      if (dataAttribute) {
        return {
          matcher: rest,
          selector: s => `${s}[data-${dataAttribute}]`,
        }
      }
    }
  },
  multiPass: true,
}

function taggedData(tagName: string, attributify: boolean, firstPrefix: string): Variant {
  return {
    name: `${tagName}-data`,
    match(matcher, ctx: VariantContext<Theme>) {
      const variant = variantGetParameter(`${tagName}-data-`, matcher, ctx.generator.config.separators)
      if (variant) {
        console.log('hi', matcher)
        const [match, rest, label] = variant
        const dataAttribute = h.bracket(match) ?? ctx.theme.data?.[match] ?? ''
        if (dataAttribute) {
          if (['parent', 'previous'].includes(tagName)) {
            return {
              matcher: `${tagName}-[[data-${dataAttribute}]]${label ? `/${label}` : ''}:${rest}`,
            }
          }

          if (label) {
            return {
              matcher: `${tagName}-[[data-${dataAttribute}]]${label ? `/${label}` : ''}:${rest}`,
            }
          }

          return {
            matcher: rest,
            handle: (input, next) => {
              // console.log(input)
              if (tagName === 'group') {
                const parent = attributify ? `[${firstPrefix}${tagName}=""]` : `.${firstPrefix}${tagName}`
                const prefixVariant = variantGetParameter(parent, input.prefix, ctx.generator.config.separators)
                console.log('prefixDataVariant', prefixVariant)
                const [prefixMatch, prefixRest, prefixLabel] = prefixVariant ?? []
                const index = input.prefix.indexOf(prefixMatch)
                const nextPrefix = label
                  ? `${input.prefix}${parent}${label ? `\\/${label}` : ''}[data-${dataAttribute}] `
                  : prefixMatch
                    ? `${input.prefix.slice(0, index)}[data-${dataAttribute}]${input.prefix.slice(index)}`
                    : `${parent}${label ? `\\/${label}` : ''}[data-${dataAttribute}] ${input.prefix}`
                console.log({
                  tagName,
                  matcher,
                  variant,
                  prefix_cur: input.prefix,
                  prefix_next: nextPrefix,
                  // selector: `${tagName}-[data-${dataAttribute}]${label ? `/${label}` : ''}:${rest}`,
                  input,
                })
                return next({
                  ...input,
                  prefix: nextPrefix,
                  // selector: tagSelectorMap[tagName],
                })
              }
              if (tagName === 'peer') {
                console.log({
                  tagName,
                  matcher,
                  variant,
                  prefix_cur: input.prefix,
                  prefix_next: `${input.prefix}.peer${label ? `\\/${label}` : ''}[data-${dataAttribute}]~`,
                  // selector: `${tagName}-[data-${dataAttribute}]${label ? `/${label}` : ''}:${rest}`,
                  input,
                })
                return next({
                  ...input,
                  prefix: `${input.prefix}.peer${label ? `\\/${label}` : ''}[data-${dataAttribute}]~`,
                  // selector: tagSelectorMap[tagName],
                })
              }
              if (tagName === 'has') {
                console.log({
                  tagName,
                  matcher,
                  variant,
                  prefix_cur: input.prefix,
                  prefix_next: `${input.prefix}${input.selector}`,
                  selector: `:has([data-${dataAttribute}])`,
                  input,
                })
                return next({
                  ...input,
                  prefix: `${input.prefix}${input.selector}`,
                  selector: `:has([data-${dataAttribute}])`,
                })
              }
            },
          }
        }
      }
    },
    multiPass: true,
  }
}

export function variantTaggedDataAttributes(options: PresetMiniOptions = {}): Variant[] {
  const attributify = !!options?.attributifyPseudo
  let firstPrefix = options?.prefix ?? ''
  firstPrefix = (Array.isArray(firstPrefix) ? firstPrefix : [firstPrefix]).filter(Boolean)[0] ?? ''

  return [
    taggedData('group', attributify, firstPrefix),
    taggedData('peer', attributify, firstPrefix),
    taggedData('parent', attributify, firstPrefix),
    taggedData('previous', attributify, firstPrefix),
    taggedData('has', attributify, firstPrefix),
  ]
}
