import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

const LANG_STORAGE_KEY = 'lng';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const current = useMemo(() => {
    const code = (i18n.language || 'fr').toLowerCase();
    return code.includes('-') ? code.split('-')[0] : code;
  }, [i18n.language]);

  const handleChange = (val: string) => {
    i18n.changeLanguage(val);
    localStorage.setItem(LANG_STORAGE_KEY, val);
  };

  return (
    <div className="z-50">
      <Select value={current} onValueChange={handleChange}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="fr">Français</SelectItem>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="de">Deutsch</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export default LanguageSwitcher;
