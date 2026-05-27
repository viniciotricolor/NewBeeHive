import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>404 - Página não encontrada - NewBee Hive 🐝</title>
        <meta name="description" content="Página não encontrada." />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-foreground">404</h1>
          <p className="text-xl text-muted-foreground mb-4">Ops! Página não encontrada</p>
          <a href="/" className="text-primary hover:text-primary/90 underline">
            Voltar para a Home
          </a>
        </div>
      </div>
    </>
  );
};

export default NotFound;
