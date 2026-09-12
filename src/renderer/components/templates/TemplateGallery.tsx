import { useDispatch } from 'react-redux'
import type { Project } from '../../types'
import { setProject, undoProject } from '../../store/projectStore'
import { STARTER_TEMPLATES } from '../../utils/templates'

interface TemplateGalleryProps {
  onClose: () => void
  onSelectTemplate: (templateKey: string) => void
}

export default function TemplateGallery({ onClose, onSelectTemplate }: TemplateGalleryProps) {
  const dispatch = useDispatch()

  const handleSelect = (key: string) => {
    const template = STARTER_TEMPLATES[key as keyof typeof STARTER_TEMPLATES]
    if (!template) return
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: template.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      root: template.root as any,
      customCss: '',
      customJs: '',
      meta: {
        title: template.name,
        description: '',
        author: '',
      },
    }
    dispatch(setProject(newProject))
    dispatch(undoProject())
    onSelectTemplate(key)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-sage-900 border border-sage-700 rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-sage-700">
          <h2 className="text-lg font-semibold text-white">Choose a Template</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none px-2">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(STARTER_TEMPLATES).map(([key, template]) => (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                className="text-left p-4 rounded-lg border border-sage-700 hover:border-emerald-500 hover:bg-sage-800 transition-colors group"
              >
                <div className="text-sm font-medium text-slate-200 group-hover:text-white">{template.name}</div>
                <div className="text-xs text-slate-500 mt-1 capitalize">{key}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
