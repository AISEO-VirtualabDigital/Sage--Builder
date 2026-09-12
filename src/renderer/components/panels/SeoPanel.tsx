import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../store'
import { setMeta } from '../../store/projectStore'

const MAX_TITLE = 60
const MAX_DESCRIPTION = 160

type EeaatItem = { key: string; label: string }

const EEAT_ITEMS: Record<string, EeaatItem[]> = {
  experience: [
    { key: 'author_bio', label: 'Author bio with real name/photo' },
    { key: 'first_person', label: 'First-hand experience stated' },
    { key: 'dated_content', label: 'Dated/updated content' },
    { key: 'case_study', label: 'Case study or real examples' },
  ],
  expertise: [
    { key: 'credentials', label: 'Credentials/qualifications listed' },
    { key: 'citations', label: 'Citations/references included' },
    { key: 'technical_depth', label: 'Technical depth shown' },
    { key: 'original_research', label: 'Original research/data' },
  ],
  authoritativeness: [
    { key: 'author_page', label: 'Dedicated author/about page' },
    { key: 'backlinks', label: 'Backlinks from trusted sites' },
    { key: 'brand_mentions', label: 'Brand mentions/press' },
    { key: 'social_proof', label: 'Social proof/ testimonials' },
  ],
  trust: [
    { key: 'https', label: 'HTTPS enabled' },
    { key: 'contact', label: 'Contact info visible' },
    { key: 'privacy_policy', label: 'Privacy policy present' },
    { key: 'terms', label: 'Terms/legal pages present' },
  ],
}

export default function SeoPanel() {
  const dispatch = useDispatch()
  const project = useSelector((state: RootState) => state.project.project)
  const [title, setTitle] = useState(project.meta.title)
  const [description, setDescription] = useState(project.meta.description)
  const [keywords, setKeywords] = useState('')
  const [canonical, setCanonical] = useState('')
  const [ogTitle, setOgTitle] = useState('')
  const [ogDescription, setOgDescription] = useState('')
  const [ogImage, setOgImage] = useState('')
  const [eeat, setEeat] = useState<Record<string, boolean>>({})

  const titleScore = title.trim().length >= 30 && title.trim().length <= MAX_TITLE ? 100 : 60
  const descScore = description.trim().length >= 50 && description.trim().length <= MAX_DESCRIPTION ? 100 : 60
  const seoScore = Math.round((titleScore + descScore) / 2)

  const eeatEntries = Object.entries(EEAT_ITEMS).flatMap(([category, items]) => items.map((item) => ({ ...item, category })))
  const eeatCheckedCount = eeatEntries.filter((item) => eeat[item.key]).length
  const eeatScore = Math.round((eeatCheckedCount / eeatEntries.length) * 100)

  const overallScore = Math.round((seoScore + eeatScore) / 2)

  const handleSave = () => {
    dispatch(setMeta({
      title: title.trim(),
      description: description.trim(),
      author: project.meta.author,
      keywords: keywords.trim() || undefined,
      canonical: canonical.trim() || undefined,
      ogTitle: ogTitle.trim() || undefined,
      ogDescription: ogDescription.trim() || undefined,
      ogImage: ogImage.trim() || undefined,
    }))
  }

  const toggleEeat = (key: string) => {
    setEeat((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const categoryScore = (category: string) => {
    const items = EEAT_ITEMS[category]
    const checked = items.filter((item) => eeat[item.key]).length
    return Math.round((checked / items.length) * 100)
  }

  const categoryColor = (score: number) => (score >= 75 ? 'bg-emerald-600' : score >= 40 ? 'bg-amber-600' : 'bg-red-600')

  return (
    <div className="w-64 bg-sage-900 border-r border-sage-700 flex flex-col">
      <div className="p-3 border-b border-sage-700">
        <h2 className="text-sm font-semibold text-slate-300">SEO</h2>
      </div>
      <div className="p-3 space-y-3 overflow-y-auto">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-slate-400">Overall SEO Score</label>
            <span className="text-[10px] text-slate-400">{overallScore}%</span>
          </div>
          <div className="h-1 bg-sage-800 rounded overflow-hidden">
            <div className="h-full bg-emerald-600 transition-all" style={{ width: `${overallScore}%` }} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-slate-400">On-Page SEO</label>
            <span className="text-[10px] text-slate-400">{seoScore}%</span>
          </div>
          <div className="h-1 bg-sage-800 rounded overflow-hidden">
            <div className="h-full bg-sky-600 transition-all" style={{ width: `${seoScore}%` }} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-slate-400">E-E-A-T Score</label>
            <span className="text-[10px] text-slate-400">{eeatScore}%</span>
          </div>
          <div className="h-1 bg-sage-800 rounded overflow-hidden">
            <div className={`h-full ${categoryColor(eeatScore)} transition-all`} style={{ width: `${eeatScore}%` }} />
          </div>
        </div>

        {(['experience', 'expertise', 'authoritativeness', 'trust'] as const).map((category) => {
          const score = categoryScore(category)
          const label = category === 'authoritativeness' ? 'Authority' : category === 'experience' ? 'Experience' : category === 'expertise' ? 'Expertise' : 'Trust'
          return (
            <div key={category} className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-slate-400">{label}</label>
                <span className="text-[10px] text-slate-500">{score}%</span>
              </div>
              <div className="h-1 bg-sage-800 rounded overflow-hidden">
                <div className={`h-full ${categoryColor(score)} transition-all`} style={{ width: `${score}%` }} />
              </div>
            </div>
          )
        })}

        <div className="h-px bg-sage-700" />

        <div className="space-y-1">
          <label className="text-[10px] text-slate-400">Page Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            placeholder="My awesome page"
            maxLength={MAX_TITLE}
            className="w-full px-2 py-1 bg-sage-800 border border-sage-700 rounded text-xs text-slate-200 outline-none"
          />
          <div className="text-[10px] text-slate-500">{title.length}/{MAX_TITLE}</div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-slate-400">Meta Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleSave}
            placeholder="Short description for search results..."
            rows={3}
            maxLength={MAX_DESCRIPTION}
            className="w-full px-2 py-1 bg-sage-800 border border-sage-700 rounded text-xs text-slate-200 outline-none"
          />
          <div className="text-[10px] text-slate-500">{description.length}/{MAX_DESCRIPTION}</div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-slate-400">Keywords (comma separated)</label>
          <input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            onBlur={handleSave}
            placeholder="sage, builder, no-code"
            className="w-full px-2 py-1 bg-sage-800 border border-sage-700 rounded text-xs text-slate-200 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-slate-400">Canonical URL</label>
          <input
            value={canonical}
            onChange={(e) => setCanonical(e.target.value)}
            onBlur={handleSave}
            placeholder="https://example.com/page"
            className="w-full px-2 py-1 bg-sage-800 border border-sage-700 rounded text-xs text-slate-200 outline-none"
          />
        </div>

        <div className="h-px bg-sage-700" />

        <div className="space-y-1">
          <div className="text-[10px] text-slate-400">Open Graph Preview</div>
          <div className="p-2 rounded border border-sage-700 bg-sage-800">
            <div className="text-xs text-slate-200 font-medium truncate">{ogTitle || title || 'Page title'}</div>
            <div className="text-[10px] text-slate-400 truncate">{ogDescription || description || 'Page description'}</div>
            {ogImage && <div className="mt-1 text-[10px] text-emerald-400 truncate">Image: {ogImage}</div>}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-slate-400">OG Title</label>
          <input
            value={ogTitle}
            onChange={(e) => setOgTitle(e.target.value)}
            onBlur={handleSave}
            placeholder="Social share title"
            className="w-full px-2 py-1 bg-sage-800 border border-sage-700 rounded text-xs text-slate-200 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-slate-400">OG Description</label>
          <textarea
            value={ogDescription}
            onChange={(e) => setOgDescription(e.target.value)}
            onBlur={handleSave}
            placeholder="Social share description"
            rows={2}
            className="w-full px-2 py-1 bg-sage-800 border border-sage-700 rounded text-xs text-slate-200 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-slate-400">OG Image URL</label>
          <input
            value={ogImage}
            onChange={(e) => setOgImage(e.target.value)}
            onBlur={handleSave}
            placeholder="https://example.com/og-image.jpg"
            className="w-full px-2 py-1 bg-sage-800 border border-sage-700 rounded text-xs text-slate-200 outline-none"
          />
        </div>

        <div className="h-px bg-sage-700" />
        <div className="text-[10px] text-slate-500 font-semibold mb-1">E-E-A-T Checklist</div>
        <div className="space-y-1">
          {eeatEntries.map((item) => (
            <label key={item.key} className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!eeat[item.key]}
                onChange={() => toggleEeat(item.key)}
                className="mt-0.5 h-3 w-3 rounded border-sage-700 bg-sage-800 text-emerald-600 focus:ring-emerald-600"
              />
              <span className="text-[10px] text-slate-300 leading-tight">{item.label}</span>
            </label>
          ))}
        </div>

        <div className="h-px bg-sage-700" />
        <div className="text-[10px] text-slate-500">
          SEO fields are saved to project meta. Export will include them in generated HTML.
        </div>
      </div>
    </div>
  )
}
