import Editor from '@monaco-editor/react'
import { useDispatch, useSelector } from 'react-redux'
import { setCustomCode } from '../../store/projectStore'
import type { RootState } from '../../store'

export default function CodeEditor() {
  const dispatch = useDispatch()
  const { customCss, customJs } = useSelector((state: RootState) => state.project.project)

  return (
    <div className="h-full flex flex-col">
      <div className="h-10 bg-sage-900 border-b border-sage-700 flex items-center px-4">
        <span className="text-sm text-slate-300">Custom Code</span>
      </div>
      <div className="flex-1 flex">
        <div className="w-1/2 flex flex-col border-r border-sage-700">
          <div className="h-8 bg-sage-800 flex items-center px-3 text-xs text-slate-400">style.css</div>
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="css"
              theme="vs-dark"
              value={customCss}
              onChange={(value) => dispatch(setCustomCode({ css: value || '' }))}
              options={{ minimap: { enabled: false }, fontSize: 13, lineNumbers: 'on' }}
            />
          </div>
        </div>
        <div className="w-1/2 flex flex-col">
          <div className="h-8 bg-sage-800 flex items-center px-3 text-xs text-slate-400">main.js</div>
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={customJs}
              onChange={(value) => dispatch(setCustomCode({ js: value || '' }))}
              options={{ minimap: { enabled: false }, fontSize: 13, lineNumbers: 'on' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
