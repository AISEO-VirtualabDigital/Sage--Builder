export interface DesignTokens {
  colors: Record<string, string>
  typography: {
    fontFamily?: string
    fontSize?: string
    fontWeight?: string
    lineHeight?: string
  }
  spacing: Record<string, string>
  borderRadius: string
  shadows: Record<string, string>
}

export interface DesignContract {
  name: string
  version: string
  tokens: DesignTokens
  rules: string[]
  description?: string
}

export function parseDesignMarkdown(markdown: string): DesignContract {
  const lines = markdown.split('\n')
  const contract: DesignContract = {
    name: 'Unknown',
    version: '1.0.0',
    tokens: { colors: {}, typography: {}, spacing: {}, borderRadius: '0px', shadows: {} },
    rules: [],
    description: '',
  }

  let section: 'header' | 'tokens' | 'rules' | 'description' = 'header'
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('# ') || trimmed.startsWith('---')) continue
    if (trimmed.startsWith('## ')) {
      const heading = trimmed.replace('## ', '').toLowerCase()
      if (heading.includes('token')) section = 'tokens'
      else if (heading.includes('rule')) section = 'rules'
      else if (heading.includes('description')) section = 'description'
      else section = 'header'
      continue
    }
    if (trimmed.startsWith('- ')) {
      const value = trimmed.slice(2)
      if (section === 'tokens') {
        if (value.includes(':')) {
          const [key, val] = value.split(':').map((s) => s.trim())
          if (key.includes('color')) contract.tokens.colors[key] = val
          else if (key.includes('font')) contract.tokens.typography.fontFamily = val
          else if (key.includes('size')) contract.tokens.typography.fontSize = val
          else if (key.includes('spacing') || key.includes('margin') || key.includes('padding')) contract.tokens.spacing[key] = val
          else if (key.includes('radius')) contract.tokens.borderRadius = val
          else if (key.includes('shadow')) contract.tokens.shadows[key] = val
        }
      } else if (section === 'rules') {
        contract.rules.push(value)
      } else if (section === 'description') {
        contract.description = value
      }
    }
    if (section === 'header' && trimmed.includes('name:')) {
      contract.name = trimmed.split('name:')[1]?.trim() || contract.name
    }
    if (section === 'header' && trimmed.includes('version:')) {
      contract.version = trimmed.split('version:')[1]?.trim() || contract.version
    }
  }
  return contract
}

export function applyDesignContractToProject(contract: DesignContract): Record<string, string> {
  const cssVars: Record<string, string> = {}
  for (const [key, value] of Object.entries(contract.tokens.colors)) {
    cssVars[`--color-${key.replace(/\s+/g, '-').toLowerCase()}`] = value as string
  }
  if (contract.tokens.typography.fontFamily) cssVars['--font-family'] = contract.tokens.typography.fontFamily
  if (contract.tokens.typography.fontSize) cssVars['--font-size'] = contract.tokens.typography.fontSize
  for (const [key, value] of Object.entries(contract.tokens.spacing)) {
    cssVars[`--spacing-${key.replace(/\s+/g, '-').toLowerCase()}`] = value as string
  }
  if (contract.tokens.borderRadius) cssVars['--border-radius'] = contract.tokens.borderRadius
  return cssVars
}
