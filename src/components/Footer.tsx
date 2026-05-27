"use client";

import { Link } from 'react-router-dom';
import { APP_VERSION } from '@/config/version';

const Footer = () => {
  return (
    <footer className="bg-card text-card-foreground border-t border-border py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-sm">
        <p>&copy; {new Date().getFullYear()} NewBee Hive 🐝. Todos os direitos reservados.</p>
        <div className="flex space-x-4 mt-2 sm:mt-0">
          <Link to="/about" className="hover:underline text-primary">Sobre</Link>
          <p>Versão: {APP_VERSION}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
