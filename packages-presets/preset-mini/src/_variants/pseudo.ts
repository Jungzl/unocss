import type { VariantObject } from '@unocss/core'
import type { PresetMiniOptions } from '..'
import type { PseudoVariantUtilities } from '../_utils'
import { createPartClasses, createPseudoClassesAndElements, createPseudoClassFunctions, createTaggedPseudoClasses, getBracket, h, variantGetBracket } from '../_utils'

const utils: PseudoVariantUtilities = { getBracket, h, variantGetBracket }

export function variantPseudoClassesAndElements(): VariantObject[] {
  return createPseudoClassesAndElements(utils)
}

export function variantPseudoClassFunctions(): VariantObject {
  return createPseudoClassFunctions(utils)
}

export function variantTaggedPseudoClasses(options: PresetMiniOptions = {}): VariantObject[] {
  return createTaggedPseudoClasses(options, utils)
}

export const variantPartClasses: VariantObject = createPartClasses()
