import { useState } from 'react'
import type { ElementType, ElementNode, StyleProps } from '../../types'
import { useDispatch, useSelector } from 'react-redux'
import { setElementCode, setActiveCodeElement } from '../../store/uiStore'
import type { RootState } from '../../store'
import Editor from '@monaco-editor/react'

interface PropertyPanelProps {
  elementId: string
  onUpdate: (updates: Partial<ElementNode>) => void
  onDelete: () => void
}

function ElementPropertyForm({ elementType, onUpdate, updateStyle }: { elementType: ElementType; onUpdate: (updates: Partial<ElementNode>) => void; updateStyle: (key: keyof StyleProps, value: string) => void }) {
  const formFieldsMap: Record<ElementType, React.ReactNode> = {
    container: (
      <div>
        <label className="block text-xs text-slate-400 mb-1">Tag</label>
        <select
          className="w-full px-2 py-1 bg-sage-800 border border-sage-700 rounded text-xs text-slate-200"
        >
          <option value="div">Div</option>
          <option value="section">Section</option>
          <option value="header">Header</option>
          <option value="footer">Footer</option>
        </select>
      </div>
    ),
    row: (
      <div>
        <label className="block text-xs text-slate-400 mb-1">Gap</label>
        <input
          type="text"
          className="w-full px-2 py-1 bg-sage-800 border border-sage-700 rounded text-xs text-slate-200"
          placeholder="e.g. 20px"
        />
        <label className="block text-xs text-slate-400 mt-3">Justify</label>
        <select
          className="w-full px-2 py-1 bg-sage-800 border border-sage-700 rounded text-xs text-slate-200"
        >
          <option value="start">Start</option>
          <option value="center">Center</option>
          <option value="end">End</option>
          <option value="between">Between</option>
        </select>
      </div>
    ),
    column: (
      <div>
        <label className="block text-xs text-slate-400 mb-1">Span</label>
        <input
          type="number"
          className="w-full px-2 py-1 bg-sage-800 border border-sage-700 rounded text-xs text-slate-200"
          placeholder="e.g. 1"
        />
        <label className="block text-xs text-slate-400 mt-1">Min-Width</label>
        <input
          type="text"
          className="w-full px-2 py-1 bg-sage-800 border border-sage-700 rounded text-xs text-slate-200"
          placeholder="e.g. 200px"
        />
      </div>
    ),
    section: (
      <div>
        <label className="block text-xs text-slate-400 mb-1">Tag</label>
        <select
          className="w-full px-2 py-1 bg-sage-800 border border-sage-700 rounded text-xs text-slate-200">
          <option value="section">Section</option>
          <option value="article">Article</option>
        </select>
        <label className="block text-xs text-slate-400 mt-1">Full Width</label>
        <select
          className="w-full px-2 py-1 bg-sage-800 border border-sage-700 rounded text-xs text-slate-200">
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>
      </div>
    ),
    text: (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    textBlock: (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    'text-simple': (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    googleFontsHeading: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Font Size" value="" onChange={(v) => updateStyle('fontSize', v)} />
        <StyleField label="Font Weight" value="" onChange={(v) => updateStyle('fontWeight', v)} />
      </div>
    ),
    heading: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Font Size" value="" onChange={(v) => updateStyle('fontSize', v)} />
        <StyleField label="Font Weight" value="" onChange={(v) => updateStyle('fontWeight', v)} />
      </div>
    ),
    image: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Image Src" value="" onChange={(v) => onUpdate({ props: { src: v } } as Partial<ElementNode>)} />
        <StyleField label="Alt Text" value="" onChange={(v) => onUpdate({ props: { alt: v } } as Partial<ElementNode>)} />
      </div>
    ),
    singleImage: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Image Src" value="" onChange={(v) => onUpdate({ props: { src: v } } as Partial<ElementNode>)} />
        <StyleField label="Alt Text" value="" onChange={(v) => onUpdate({ props: { alt: v } } as Partial<ElementNode>)} />
      </div>
    ),
    flickrImage: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Flickr Image URL" value="" onChange={(v) => onUpdate({ props: { src: v } } as Partial<ElementNode>)} />
        <StyleField label="Alt Text" value="" onChange={(v) => onUpdate({ props: { alt: v } } as Partial<ElementNode>)} />
      </div>
    ),
    instagramImage: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Instagram Image URL" value="" onChange={(v) => onUpdate({ props: { src: v } } as Partial<ElementNode>)} />
        <StyleField label="Alt Text" value="" onChange={(v) => onUpdate({ props: { alt: v } } as Partial<ElementNode>)} />
      </div>
    ),
    button: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Label" value="" onChange={(v) => onUpdate({ props: { label: v } } as Partial<ElementNode>)} />
        <StyleField label="Href" value="" onChange={(v) => onUpdate({ props: { href: v } } as Partial<ElementNode>)} />
      </div>
    ),
    basicButton: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Label" value="" onChange={(v) => onUpdate({ props: { label: v } } as Partial<ElementNode>)} />
        <StyleField label="Href" value="" onChange={(v) => onUpdate({ props: { href: v } } as Partial<ElementNode>)} />
      </div>
    ),
    outlineButton: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Label" value="" onChange={(v) => onUpdate({ props: { label: v } } as Partial<ElementNode>)} />
        <StyleField label="Href" value="" onChange={(v) => onUpdate({ props: { href: v } } as Partial<ElementNode>)} />
      </div>
    ),
    video: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Video Src" value="" onChange={(v) => onUpdate({ props: { src: v } } as Partial<ElementNode>)} />
      </div>
    ),
    youtubePlayer: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="YouTube URL" value="" onChange={(v) => onUpdate({ props: { src: v } } as Partial<ElementNode>)} />
      </div>
    ),
    vimeoPlayer: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Vimeo URL" value="" onChange={(v) => onUpdate({ props: { src: v } } as Partial<ElementNode>)} />
      </div>
    ),
    divider: (
      <div>
        <StyleField label="Thickness" value="1px" onChange={(v) => onUpdate({ props: { thickness: v } } as Partial<ElementNode>)} />
        <StyleField label="Style" value="solid" onChange={(v) => onUpdate({ props: { style: v } } as Partial<ElementNode>)} />
        <StyleField label="Color" value="#cccccc" onChange={(v) => onUpdate({ props: { color: v } } as Partial<ElementNode>)} />
      </div>
    ),
    separator: (
      <div>
        <StyleField label="Thickness" value="1px" onChange={(v) => onUpdate({ props: { thickness: v } } as Partial<ElementNode>)} />
        <StyleField label="Style" value="solid" onChange={(v) => onUpdate({ props: { style: v } } as Partial<ElementNode>)} />
        <StyleField label="Color" value="#cccccc" onChange={(v) => onUpdate({ props: { color: v } } as Partial<ElementNode>)} />
      </div>
    ),
    separatorIcon: (
      <div>
        <StyleField label="Icon" value="★" onChange={(v) => onUpdate({ props: { icon: v } } as Partial<ElementNode>)} />
        <StyleField label="Color" value="#cccccc" onChange={(v) => onUpdate({ props: { color: v } } as Partial<ElementNode>)} />
      </div>
    ),
    separatorTitle: (
      <div>
        <StyleField label="Title" value="Separator" onChange={(v) => onUpdate({ props: { title: v } } as Partial<ElementNode>)} />
        <StyleField label="Color" value="#cccccc" onChange={(v) => onUpdate({ props: { color: v } } as Partial<ElementNode>)} />
      </div>
    ),
    spacer: (
      <div>
        <StyleField label="Height" value="40px" onChange={(v) => onUpdate({ props: { height: v } } as Partial<ElementNode>)} />
      </div>
    ),
    html: (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    rawHtml: (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    rawJs: (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    shortcode: (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    accordion: (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    tabs: (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    faqToggle: (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    icon: (
      <div>
        <StyleField label="Icon" value="★" onChange={(v) => onUpdate({ props: { icon: v } } as Partial<ElementNode>)} />
        <StyleField label="Size" value="24px" onChange={(v) => onUpdate({ props: { size: v } } as Partial<ElementNode>)} />
        <StyleField label="Color" value="#333" onChange={(v) => onUpdate({ props: { color: v } } as Partial<ElementNode>)} />
      </div>
    ),
    feature: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Icon" value="✔" onChange={(v) => onUpdate({ props: { icon: v } } as Partial<ElementNode>)} />
        <StyleField label="Title" value="Feature" onChange={(v) => onUpdate({ props: { title: v } } as Partial<ElementNode>)} />
        <StyleField label="Description" value="Description" onChange={(v) => onUpdate({ props: { description: v } } as Partial<ElementNode>)} />
      </div>
    ),
    featureDescription: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Icon" value="✔" onChange={(v) => onUpdate({ props: { icon: v } } as Partial<ElementNode>)} />
        <StyleField label="Title" value="Feature" onChange={(v) => onUpdate({ props: { title: v } } as Partial<ElementNode>)} />
        <StyleField label="Description" value="Description" onChange={(v) => onUpdate({ props: { description: v } } as Partial<ElementNode>)} />
      </div>
    ),
    featureSection: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Columns" value="3" onChange={(v) => onUpdate({ props: { columns: Number(v) } } as Partial<ElementNode>)} />
      </div>
    ),
    infobox: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Title" value="Info Box" onChange={(v) => onUpdate({ props: { title: v } } as Partial<ElementNode>)} />
        <StyleField label="Content" value="Info content" onChange={(v) => onUpdate({ props: { content: v } } as Partial<ElementNode>)} />
      </div>
    ),
    logo: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Src" value="" onChange={(v) => onUpdate({ props: { src: v } } as Partial<ElementNode>)} />
        <StyleField label="Alt" value="Logo" onChange={(v) => onUpdate({ props: { alt: v } } as Partial<ElementNode>)} />
        <StyleField label="Height" value="40px" onChange={(v) => onUpdate({ props: { height: v } } as Partial<ElementNode>)} />
      </div>
    ),
    imageGallery: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Columns" value="3" onChange={(v) => onUpdate({ props: { columns: Number(v) } } as Partial<ElementNode>)} />
      </div>
    ),
    imageMasonryGallery: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Columns" value="3" onChange={(v) => onUpdate({ props: { columns: Number(v) } } as Partial<ElementNode>)} />
      </div>
    ),
    simpleImageSlider: (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    galleries: (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    gallery: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Columns" value="3" onChange={(v) => onUpdate({ props: { columns: Number(v) } } as Partial<ElementNode>)} />
      </div>
    ),
    blog: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Post Type" value="post" onChange={(v) => onUpdate({ props: { postType: v } } as Partial<ElementNode>)} />
        <StyleField label="Count" value="3" onChange={(v) => onUpdate({ props: { count: Number(v) } } as Partial<ElementNode>)} />
      </div>
    ),
    posts: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Post Type" value="post" onChange={(v) => onUpdate({ props: { postType: v } } as Partial<ElementNode>)} />
        <StyleField label="Count" value="3" onChange={(v) => onUpdate({ props: { count: Number(v) } } as Partial<ElementNode>)} />
      </div>
    ),
    loops: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Post Type" value="post" onChange={(v) => onUpdate({ props: { postType: v } } as Partial<ElementNode>)} />
        <StyleField label="Count" value="3" onChange={(v) => onUpdate({ props: { count: Number(v) } } as Partial<ElementNode>)} />
      </div>
    ),
    projects: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Count" value="3" onChange={(v) => onUpdate({ props: { count: Number(v) } } as Partial<ElementNode>)} />
        <StyleField label="Layout" value="grid" onChange={(v) => onUpdate({ props: { layout: v } } as Partial<ElementNode>)} />
      </div>
    ),
    staff: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Name" value="John Doe" onChange={(v) => onUpdate({ props: { name: v } } as Partial<ElementNode>)} />
        <StyleField label="Role" value="Developer" onChange={(v) => onUpdate({ props: { role: v } } as Partial<ElementNode>)} />
      </div>
    ),
    partners: (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    testimonials: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Quote" value="Great service!" onChange={(v) => onUpdate({ props: { quote: v } } as Partial<ElementNode>)} />
        <StyleField label="Author" value="Client" onChange={(v) => onUpdate({ props: { author: v } } as Partial<ElementNode>)} />
      </div>
    ),
    progressBars: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Percent" value="75" onChange={(v) => onUpdate({ props: { percent: Number(v) } } as Partial<ElementNode>)} />
        <StyleField label="Label" value="Progress" onChange={(v) => onUpdate({ props: { label: v } } as Partial<ElementNode>)} />
      </div>
    ),
    'progress-bars': (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Percent" value="75" onChange={(v) => onUpdate({ props: { percent: Number(v) } } as Partial<ElementNode>)} />
        <StyleField label="Label" value="Progress" onChange={(v) => onUpdate({ props: { label: v } } as Partial<ElementNode>)} />
      </div>
    ),
    countdown: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Date" value="" onChange={(v) => onUpdate({ props: { date: v } } as Partial<ElementNode>)} />
      </div>
    ),
    navigation: (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    notification: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Type" value="info" onChange={(v) => onUpdate({ props: { type: v } } as Partial<ElementNode>)} />
      </div>
    ),
    sliders: (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    social: (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    downloads: (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    googleMaps: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Address" value="" onChange={(v) => onUpdate({ props: { address: v } } as Partial<ElementNode>)} />
      </div>
    ),
    woocommerce: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Product ID" value="" onChange={(v) => onUpdate({ props: { productId: v } } as Partial<ElementNode>)} />
      </div>
    ),
    widgets: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Widget" value="recent-posts" onChange={(v) => onUpdate({ props: { widget: v } } as Partial<ElementNode>)} />
      </div>
    ),
    wpWidgetsCustom: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Widget" value="recent-posts" onChange={(v) => onUpdate({ props: { widget: v } } as Partial<ElementNode>)} />
      </div>
    ),
    wpWidgetsDefault: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Widget" value="recent-posts" onChange={(v) => onUpdate({ props: { widget: v } } as Partial<ElementNode>)} />
      </div>
    ),
    callToAction: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Title" value="Call to Action" onChange={(v) => onUpdate({ props: { title: v } } as Partial<ElementNode>)} />
        <StyleField label="Content" value="Join now" onChange={(v) => onUpdate({ props: { content: v } } as Partial<ElementNode>)} />
        <StyleField label="Button Label" value="Click Here" onChange={(v) => onUpdate({ props: { buttonLabel: v } } as Partial<ElementNode>)} />
        <StyleField label="Button Href" value="#" onChange={(v) => onUpdate({ props: { buttonHref: v } } as Partial<ElementNode>)} />
      </div>
    ),
    cta: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Title" value="Call to Action" onChange={(v) => onUpdate({ props: { title: v } } as Partial<ElementNode>)} />
        <StyleField label="Content" value="Join now" onChange={(v) => onUpdate({ props: { content: v } } as Partial<ElementNode>)} />
        <StyleField label="Button Label" value="Click Here" onChange={(v) => onUpdate({ props: { buttonLabel: v } } as Partial<ElementNode>)} />
        <StyleField label="Button Href" value="#" onChange={(v) => onUpdate({ props: { buttonHref: v } } as Partial<ElementNode>)} />
      </div>
    ),
    heroSection: (
      <div>
        <ContentFields onUpdate={onUpdate} />
        <StyleField label="Title" value="Hero Title" onChange={(v) => onUpdate({ props: { title: v } } as Partial<ElementNode>)} />
        <StyleField label="Subtitle" value="Subtitle" onChange={(v) => onUpdate({ props: { subtitle: v } } as Partial<ElementNode>)} />
        <StyleField label="CTA Label" value="Get Started" onChange={(v) => onUpdate({ props: { ctaLabel: v } } as Partial<ElementNode>)} />
        <StyleField label="CTA Href" value="#" onChange={(v) => onUpdate({ props: { ctaHref: v } } as Partial<ElementNode>)} />
      </div>
    ),
    'tp-title': (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    'tp-content': (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    'tp-excerpt': (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    'tp-thumbnail': (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    'tp-meta': (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    'tp-link': (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    'tp-comments': (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    'tp-comments-form': (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    'tp-downloads-button': (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    'tp-gallery-slider': (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    'tp-project-slider': (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    'tp-staff-social': (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    facebookLike: (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    twitterButton: (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    twitterGrid: (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    twitterTimeline: (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    twitterTweet: (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
    pinterestPinit: (
      <div>
        <ContentFields onUpdate={onUpdate} />
      </div>
    ),
  }

  const fallback = (
    <div>
      <ContentFields onUpdate={onUpdate} />
    </div>
  )

  return <>{formFieldsMap[elementType] || fallback}</>
}

export default function PropertyPanel({ elementId, onUpdate, onDelete }: PropertyPanelProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'advanced' | 'code'>('content')
  const dispatch = useDispatch()
  const code = useSelector((state: RootState) => state.ui.codeInjection.elementCode[elementId] || { css: '', js: '' })
  const selectedId = useSelector((state: RootState) => state.project.selectedElementId)
  const project = useSelector((state: RootState) => state.project.project)

  const selectedNode = selectedId ? findNode(project.root, selectedId) : null
  const elementType = (selectedNode?.type || project.root.type) as ElementType

  const updateStyle = (key: keyof StyleProps, value: string) => {
    onUpdate({
      styles: { [key]: value },
    } as Partial<ElementNode>)
  }

  return (
    <div className="w-80 bg-sage-900 border-l border-sage-700 flex flex-col">
      <div className="p-3 border-b border-sage-700 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-300">Properties</h2>
        <button onClick={onDelete} className="text-xs text-red-400 hover:text-red-300" aria-label="Delete element">
          Delete
        </button>
      </div>
      <div className="flex border-b border-sage-700">
        {(['content', 'style', 'advanced', 'code'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs capitalize ${
              activeTab === tab ? 'text-white border-b-2 border-sage-400' : 'text-slate-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'content' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1" htmlFor="prop-id">ID</label>
              <input
                id="prop-id"
                type="text"
                value={elementId}
                disabled
                className="w-full px-2 py-1 bg-sage-800 border border-sage-700 rounded text-xs text-slate-500"
              />
            </div>
            <ElementPropertyForm elementType={elementType} onUpdate={onUpdate} updateStyle={updateStyle} />
          </div>
        )}
        {activeTab === 'style' && (
          <div className="space-y-3">
            <StyleField label="Background Color" value="" onChange={(v) => updateStyle('backgroundColor', v)} />
            <StyleField label="Text Color" value="" onChange={(v) => updateStyle('color', v)} />
            <StyleField label="Padding" value="" onChange={(v) => updateStyle('padding', v)} placeholder="e.g. 20px" />
            <StyleField label="Margin" value="" onChange={(v) => updateStyle('margin', v)} placeholder="e.g. 10px 0" />
            <StyleField label="Border Radius" value="" onChange={(v) => updateStyle('borderRadius', v)} placeholder="e.g. 8px" />
            <StyleField label="Text Align" value="" onChange={(v) => updateStyle('textAlign', v)} placeholder="left|center|right" />
          </div>
        )}
        {activeTab === 'advanced' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1" htmlFor="prop-class">Custom CSS Class</label>
              <input
                id="prop-class"
                type="text"
                className="w-full px-2 py-1 bg-sage-800 border border-sage-700 rounded text-xs text-white"
                placeholder="my-class"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1" htmlFor="prop-custom-id">Custom ID</label>
              <input
                id="prop-custom-id"
                type="text"
                className="w-full px-2 py-1 bg-sage-800 border border-sage-700 rounded text-xs text-white"
                placeholder="my-id"
              />
            </div>
          </div>
        )}
        {activeTab === 'code' && (
          <div className="h-full flex flex-col">
            <div className="h-7 bg-sage-800 flex items-center px-2 text-[10px] text-slate-400 justify-between">
              <span>element-{elementId.slice(0, 8)}</span>
              <button
                onClick={() => dispatch(setActiveCodeElement(null))}
                className="text-slate-500 hover:text-slate-200"
                aria-label="Close element code editor"
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
        )}
      </div>
    </div>
  )
}

function ContentFields({ onUpdate }: { onUpdate: (updates: Partial<ElementNode>) => void }) {
  const [content, setContent] = useState('')
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1" htmlFor="prop-content">Content</label>
      <textarea
        id="prop-content"
        value={content}
        onChange={(e) => {
          setContent(e.target.value)
          onUpdate({ props: { content: e.target.value } } as Partial<ElementNode>)
        }}
        className="w-full px-2 py-1 bg-sage-800 border border-sage-700 rounded text-xs text-white h-24"
      />
    </div>
  )
}

function StyleField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-2 py-1 bg-sage-800 border border-sage-700 rounded text-xs text-white"
      />
    </div>
  )
}

function findNode(root: ElementNode, id: string): ElementNode | null {
  if (root.id === id) return root
  for (const child of root.children || []) {
    const found = findNode(child, id)
    if (found) return found
  }
  return null
}
