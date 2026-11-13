import React from 'react';
import { useLanguage, SUPPORTED_LANGUAGES, SupportedLanguage } from '../../context/LanguageContext';
import { Languages } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'select' | 'pill' | 'header' | 'inline-buttons';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
}) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 sm:py-1 rounded-lg border border-[#D4AF37]/50 bg-black/40 dark:bg-stone-900/80 backdrop-blur-md shadow-xs text-xs ${className}`}
      title="Change Language / Hindura Ururimi / Badili Lugha / Changer de langue"
    >
      <Languages className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37] shrink-0" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
        aria-label="Select system language"
        className="bg-transparent text-[11px] sm:text-xs font-semibold text-stone-100 focus:outline-hidden cursor-pointer pr-1"
      >
        {SUPPORTED_LANGUAGES.map((opt) => (
          <option
            key={opt.code}
            value={opt.code}
            className="bg-stone-900 text-stone-100 py-1"
          >
            {opt.flag} {opt.nativeName} ({opt.code.toUpperCase()})
          </option>
        ))}
      </select>
    </div>
  );
};
