import { useLanguage } from '../contexts/LanguageContext'

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage('ar')}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
          language === 'ar'
            ? 'bg-brand-800 text-white'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
      >
        عربي
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
          language === 'en'
            ? 'bg-brand-800 text-white'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
      >
        English
      </button>
    </div>
  )
}
