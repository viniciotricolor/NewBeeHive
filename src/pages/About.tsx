"use client";

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import aboutMarkdown from '@/content/about.md?raw'; // Importa o conteúdo Markdown como string

const AboutPage = () => {
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    setMarkdown(aboutMarkdown);
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/">
          <Button variant="outline" className="mb-6 bg-card text-card-foreground border-border">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para a Home
          </Button>
        </Link>
        <div className="prose dark:prose-invert max-w-none text-foreground bg-card p-6 rounded-lg shadow-md">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {markdown}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;