export interface SkillDefinition {
  name: string
  version: string
  description: string
  triggers: string[]
  inputs: Record<string, unknown>
  outputs: Record<string, unknown>
  steps: SkillStep[]
}

export interface SkillStep {
  id: string
  type: 'generate' | 'transform' | 'export' | 'condition' | 'loop'
  config: Record<string, unknown>
  next?: string
}

export function parseSkillMarkdown(markdown: string): SkillDefinition {
  const lines = markdown.split('\n')
  const skill: SkillDefinition = {
    name: 'Unknown Skill',
    version: '1.0.0',
    description: '',
    triggers: [],
    inputs: {},
    outputs: {},
    steps: [],
  }

  let section: 'header' | 'triggers' | 'inputs' | 'outputs' | 'steps' = 'header'
  const currentStep: SkillStep | null = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('# ')) {
      skill.name = trimmed.replace('# ', '').trim()
      continue
    }
    if (trimmed.startsWith('## ')) {
      const heading = trimmed.replace('## ', '').toLowerCase()
      if (heading.includes('trigger')) section = 'triggers'
      else if (heading.includes('input')) section = 'inputs'
      else if (heading.includes('output')) section = 'outputs'
      else if (heading.includes('step')) section = 'steps'
      else section = 'header'
      continue
    }
    if (trimmed.startsWith('- ')) {
      const value = trimmed.slice(2)
      if (section === 'triggers') skill.triggers.push(value)
      else if (section === 'inputs') parseKeyValue(value, skill.inputs)
      else if (section === 'outputs') parseKeyValue(value, skill.outputs)
      else if (section === 'steps') {
        if (currentStep) {
          parseKeyValue(value, (currentStep as SkillStep).config)
        }
      }
    }
    if (section === 'header' && trimmed.includes('version:')) {
      skill.version = trimmed.split('version:')[1]?.trim() || skill.version
    }
    if (section === 'header' && trimmed.includes('description:')) {
      skill.description = trimmed.split('description:')[1]?.trim() || skill.description
    }
  }
  return skill
}

function parseKeyValue(line: string, target: Record<string, unknown>) {
  if (line.includes(':')) {
    const [key, val] = line.split(':').map((s) => s.trim())
    target[key] = isNaN(Number(val)) ? val : Number(val)
  }
}

export function executeSkill(skill: SkillDefinition, context: Record<string, unknown>): Record<string, unknown> {
  const results: Record<string, unknown> = {}
  for (const step of skill.steps) {
    if (step.type === 'generate') {
      results[step.id] = { generated: true, config: step.config }
    } else if (step.type === 'transform') {
      results[step.id] = { transformed: true, from: context, config: step.config }
    } else if (step.type === 'export') {
      results[step.id] = { exported: true, format: step.config.format || 'html' }
    }
  }
  return results
}
