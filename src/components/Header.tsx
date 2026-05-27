"use client";

import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-2xl">🐝</span>
          <span className="text-xl font-bold text-foreground hidden sm:inline">
            NewBee Hive
          </span>
        </Link>

        {/* Navigation + ThemeToggle */}
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-3 text-sm">
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Sobre
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
