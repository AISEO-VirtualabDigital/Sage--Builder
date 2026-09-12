import type { DesignContract } from '../ai/protocols/designContract'

export function buildDesignSystemCss(contract: DesignContract): string {
  const vars: string[] = [':root {']
  for (const [key, value] of Object.entries(contract.tokens.colors)) {
    vars.push(`  --color-${key.replace(/\s+/g, '-').toLowerCase()}: ${value};`)
  }
  if (contract.tokens.typography.fontFamily) vars.push(`  --font-family: ${contract.tokens.typography.fontFamily};`)
  if (contract.tokens.typography.fontSize) vars.push(`  --font-size: ${contract.tokens.typography.fontSize};`)
  for (const [key, value] of Object.entries(contract.tokens.spacing)) {
    vars.push(`  --spacing-${key.replace(/\s+/g, '-').toLowerCase()}: ${value};`)
  }
  if (contract.tokens.borderRadius) vars.push(`  --border-radius: ${contract.tokens.borderRadius};`)
  vars.push('}')
  return vars.join('\n')
}

export function applyDesignSystemToProject(contract: DesignContract): string {
  return buildDesignSystemCss(contract)
}
