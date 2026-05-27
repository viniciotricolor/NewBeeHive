"use client";

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLocale } from '@/i18n/context';
import aboutMarkdown from '@/content/about.md?raw';
import aboutEnMarkdown from '@/content/about-en.md?raw';

const AboutPage = () => {
  const { locale, t } = useLocale();
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    setMarkdown(locale === 'en' ? aboutEnMarkdown : aboutMarkdown);
  }, [locale]);

  return (
    <>
      <Helmet>
        <title>{t('about.title')}</title>
        <meta name="description" content={t('about.description')} />
        <meta property="og:title" content={t('about.title')} />
        <meta property="og:description" content={t('about.description')} />
        <meta name="twitter:title" content={t('about.title')} />
        <meta name="twitter:description" content={t('about.description')} />
      </Helmet>

      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/">
            <Button variant="outline" className="mb-6 bg-card text-card-foreground border-border">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back_to_home')}
            </Button>
          </Link>
          <div className="prose dark:prose-invert max-w-none text-foreground bg-card p-6 rounded-lg shadow-md">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdown}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;
