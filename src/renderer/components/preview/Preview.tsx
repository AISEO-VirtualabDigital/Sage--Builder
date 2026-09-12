import type { ElementNode } from '../../types'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store'

interface PreviewProps {
  root: ElementNode
  customCss: string
  customJs: string
}

export default function Preview({ root, customCss, customJs }: PreviewProps) {
  const elementCode = useSelector((state: RootState) => state.ui.codeInjection.elementCode)
  return (
    <div className="h-full bg-slate-100 text-slate-900">
      <style>{customCss}</style>
      <PreviewRenderer node={root} elementCode={elementCode} />
      {customJs && <script dangerouslySetInnerHTML={{ __html: customJs }} />}
    </div>
  )
}

interface PreviewRendererProps {
  node: ElementNode
  elementCode: Record<string, { css: string; js: string }>
}

function PreviewRenderer({ node, elementCode }: PreviewRendererProps) {
  const childNodes = node.children || []
  const scopedCss = elementCode[node.id]?.css
  const scopedJs = elementCode[node.id]?.js
  if (node.type === 'text') {
    const Tag = (node.props.tag as keyof JSX.IntrinsicElements) || 'p'
    return (
      <>
        {scopedCss && <style data-sage-scope={node.id}>{scopedCss}</style>}
        <Tag style={node.styles as React.CSSProperties}>{node.props.content as string}</Tag>
        {scopedJs && <script data-sage-scope={node.id} dangerouslySetInnerHTML={{ __html: `(function(){${scopedJs}})();` }} />}
      </>
    )
  }
  if (node.type === 'image') {
    return <img src={node.props.src as string} alt={node.props.alt as string} style={node.styles as React.CSSProperties} />
  }
  if (node.type === 'button') {
    return (
      <a href={node.props.href as string} target={node.props.target as string} style={node.styles as React.CSSProperties}>
        {node.props.label as string}
      </a>
    )
  }
  if (node.type === 'video') {
    return <video src={node.props.src as string} controls={node.props.controls as boolean} style={node.styles as React.CSSProperties} />
  }
  if (node.type === 'divider') {
    return <hr style={{ ...(node.styles as React.CSSProperties), border: `${node.props.thickness} ${node.props.style} ${node.props.color}` }} />
  }
  if (node.type === 'spacer') {
    return <div style={{ ...(node.styles as React.CSSProperties), height: node.props.height as string }} />
  }
  if (node.type === 'html') {
    return <div dangerouslySetInnerHTML={{ __html: node.props.code as string }} style={node.styles as React.CSSProperties} />
  }
  return (
    <div style={node.styles as React.CSSProperties}>
      {scopedCss && <style data-sage-scope={node.id}>{scopedCss}</style>}
      {childNodes.map((child) => (
        <PreviewRenderer key={child.id} node={child} elementCode={elementCode} />
      ))}
      {scopedJs && <script data-sage-scope={node.id} dangerouslySetInnerHTML={{ __html: `(function(){${scopedJs}})();` }} />}
    </div>
  )
}
