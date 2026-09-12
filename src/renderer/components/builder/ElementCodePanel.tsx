import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../store'
import { setElementCode, setActiveCodeElement } from '../../store/uiStore'
import Editor from '@monaco-editor/react'

export default function ElementCodePanel({ elementId }: { elementId: string }) {
  const dispatch = useDispatch()
  const code = useSelector((s: RootState) => s.ui.codeInjection.elementCode[elementId] || { css: '', js: '' })

  return (
    <div className="h-full flex flex-col">
      <div className="h-8 bg-sage-800 flex items-center px-3 text-[10px] text-slate-400 justify-between">
        <span>element-{elementId.slice(0, 8)}.css</span>
        <button
          onClick={() => dispatch(setActiveCodeElement(null))}
          className="text-slate-500 hover:text-slate-200"
          title="Close element editor"
        >
          ×
        </button>
      </div>
      <div className="flex-1 flex">
        <div className="w-1/2 flex flex-col border-r border-sage-700">
          <div className="h-7 bg-sage-800/60 flex items-center px-3 text-[10px] text-slate-500">style.css</div>
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="css"
              theme="vs-dark"
              value={code.css}
              onChange={(v) => dispatch(setElementCode({ elementId, css: v || '' }))}
              options={{ minimap: { enabled: false }, fontSize: 12, lineNumbers: 'on' }}
            />
          </div>
        </div>
        <div className="w-1/2 flex flex-col">
          <div className="h-7 bg-sage-800/60 flex items-center px-3 text-[10px] text-slate-500">main.js</div>
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code.js}
              onChange={(v) => dispatch(setElementCode({ elementId, js: v || '' }))}
              options={{ minimap: { enabled: false }, fontSize: 12, lineNumbers: 'on' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
