'use client';

import { useLocale } from '@/i18n/context';
import { Button } from '@/components/ui/button';

const LanguageToggle = () => {
  const { locale, setLocale } = useLocale();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLocale(locale === 'pt' ? 'en' : 'pt')}
      className="text-muted-foreground hover:text-foreground text-sm px-2"
      title={locale === 'pt' ? 'Switch to English' : 'Mudar para Português'}
    >
      {locale === 'pt' ? '🇧🇷 PT' : '🇺🇸 EN'}
    </Button>
  );
};

export default LanguageToggle;
