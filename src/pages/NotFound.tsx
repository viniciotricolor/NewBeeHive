import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useT } from '@/i18n/context';

const NotFound = () => {
  const location = useLocation();
  const t = useT();

  useEffect(() => {
    console.error("404 Error: Page not found:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>{t('notfound.title')}</title>
        <meta name="description" content={t('notfound.description')} />
      </Helmet>
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
        <span className="text-8xl mb-4">🐝</span>
        <h1 className="text-4xl font-bold text-foreground mb-4">{t('notfound.title')}</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-md">
          {t('notfound.description')}
        </p>
        <Link to="/">
          <Button variant="outline" className="bg-card text-card-foreground border-border">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('notfound.back')}
          </Button>
        </Link>
      </div>
    </>
  );
};

export default NotFound;
