'use client';

import { APP_VERSION } from '@/config/version';
import { useT } from '@/i18n/context';

const Footer = () => {
  const t = useT();

  return (
    <footer className="bg-card text-card-foreground border-t border-border py-6 text-center text-sm text-muted-foreground">
      <p>
        {t('footer.built_with')}{' '}
        <a href="https://peakd.com/@viniciotricolor" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          @viniciotricolor
        </a>{' '}
        {t('footer.on_hive')}
      </p>
      <p className="mt-1">v{APP_VERSION}</p>
    </footer>
  );
};

export default Footer;
