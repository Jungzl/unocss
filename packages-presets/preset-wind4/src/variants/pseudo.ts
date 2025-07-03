import type { VariantObject } from '@unocss/core'
import type { PresetWind4Options } from '..'
import type { Theme } from '../theme'
import type { PseudoVariantOptions, PseudoVariantUtilities } from '../utils/index'
import { escapeRegExp, escapeSelector, toArray } from '@unocss/core'
import {
  createPartClasses,
  createPseudoClassesAndElements,
  createPseudoClassFunctions,
  getBracket,
  h,
  PseudoClasses,
  PseudoClassesColon,
  PseudoClassesColonKeys,
  PseudoClassesColonStr,
  PseudoClassesKeys,
  PseudoClassesStr,
  PseudoClassFunctionsStr,
  variantGetBracket,
} from '../utils/index'

const utils: PseudoVariantUtilities = { getBracket, h, variantGetBracket }

export function createTaggedPseudoClassMatcher<T extends object = object>(
  tag: string,
  parent: string,
  combinator: string,
  utils: PseudoVariantUtilities,
): VariantObject<T> {
  const { h, variantGetBracket } = utils
  const rawRE = new RegExp(`^(${escapeRegExp(parent)}:)(\\S+)${escapeRegExp(combinator)}\\1`)
  let splitRE: RegExp
  let pseudoRE: RegExp
  let pseudoColonRE: RegExp
  let pseudoVarRE: RegExp

  const matchBracket = (input: string): [label: string, rest: string, prefix: string] | undefined => {
    const body = variantGetBracket(`${tag}-`, input, [])
    if (!body)
      return

    const [match, rest] = body
    const bracketValue = h.bracket(match)
    if (bracketValue == null)
      return

    const label = rest.split(splitRE, 1)?.[0] ?? ''
    const prefix = `${parent}${escapeSelector(label)}`
    return [
      label,
      input.slice(input.length - (rest.length - label.length - 1)),
      bracketValue.includes('&') ? bracketValue.replace(/&/g, prefix) : `${prefix}${bracketValue}`,
    ]
  }

  const matchPseudo = (input: string): [label: string, rest: string, prefix: string, pseudoKey: string] | undefined => {
    const match = input.match(pseudoRE) || input.match(pseudoColonRE)
    if (!match)
      return

    const [original, fn, pseudoKey] = match
    const label = match[3] ?? ''
    let pseudo = PseudoClasses[pseudoKey] || PseudoClassesColon[pseudoKey] || `:${pseudoKey}`
    if (fn)
      pseudo = `:${fn}(${pseudo})`

    return [
      label,
      input.slice(original.length),
      `${parent}${escapeSelector(label)}${pseudo}`,
      pseudoKey,
    ]
  }

  const matchPseudoVar = (input: string): [label: string, rest: string, prefix: string] | undefined => {
    const match = input.match(pseudoVarRE)
    if (!match)
      return
    const [original, fn, pseudoValue] = match
    const label = match[3] ?? ''
    const pseudo = `:${fn}(${pseudoValue})`

    return [
      label,
      input.slice(original.length),
      `${parent}${escapeSelector(label)}${pseudo}`,
    ]
  }

  return {
    name: `pseudo:${tag}`,
    match(input, ctx) {
      if (!(splitRE && pseudoRE && pseudoColonRE)) {
        splitRE = new RegExp(`(?:${ctx.generator.config.separators.join('|')})`)
        pseudoRE = new RegExp(`^${tag}-(?:(?:(${PseudoClassFunctionsStr})-)?(${PseudoClassesStr}))(?:(/[\\w-]+))?(?:${ctx.generator.config.separators.join('|')})`)
        pseudoColonRE = new RegExp(`^${tag}-(?:(?:(${PseudoClassFunctionsStr})-)?(${PseudoClassesColonStr}))(?:(/[\\w-]+))?(?:${ctx.generator.config.separators.filter(x => x !== '-').join('|')})`)
        pseudoVarRE = new RegExp(`^${tag}-(?:(${PseudoClassFunctionsStr})-)?\\[(.+)\\](?:(/[\\w-]+))?(?:${ctx.generator.config.separators.filter(x => x !== '-').join('|')})`)
      }

      if (!input.startsWith(tag))
        return

      const result = matchBracket(input) || matchPseudo(input) || matchPseudoVar(input)
      if (!result)
        return

      const [_label, matcher, prefix, pseudoName = ''] = result

      return {
        matcher,
        handle: (input, next) => next({
          ...input,
          prefix: `${prefix}${combinator}${input.prefix}`.replace(rawRE, '$1$2:'),
          sort: PseudoClassesKeys.indexOf(pseudoName) ?? PseudoClassesColonKeys.indexOf(pseudoName),
        }),
      }
    },
    multiPass: true,
  }
}

export function createTaggedPseudoClasses<T extends object = object>(
  options: PseudoVariantOptions,
  utils: PseudoVariantUtilities,
): VariantObject<T>[] {
  const attributify = !!options?.attributifyPseudo
  const firstPrefix = toArray(options?.prefix ?? '').filter(Boolean)[0] ?? ''
  const tagWithPrefix = (tag: string, combinator: string) => createTaggedPseudoClassMatcher<T>(tag, attributify ? `[${firstPrefix}${tag}=""]` : `.${firstPrefix}${tag}`, combinator, utils)

  return [
    tagWithPrefix('group', ' '),
    tagWithPrefix('peer', '~'),
    tagWithPrefix('parent', '>'),
    tagWithPrefix('previous', '+'),
  ]
}

export function variantPseudoClassesAndElements(): VariantObject<Theme>[] {
  return createPseudoClassesAndElements<Theme>(utils)
}

export function variantPseudoClassFunctions(): VariantObject<Theme> {
  return createPseudoClassFunctions<Theme>(utils)
}

export function variantTaggedPseudoClasses(options: PresetWind4Options = {}): VariantObject<Theme>[] {
  return createTaggedPseudoClasses<Theme>(options, utils)
}

export const variantPartClasses: VariantObject<Theme> = createPartClasses<Theme>()
