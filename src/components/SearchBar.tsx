'use client';

import { useT } from '@/i18n/context';

interface SearchBarProps {
  usernameSearchTerm: string;
  setUsernameSearchTerm: (value: string) => void;
  handleSearchClick: () => void;
  loadingUserFirstPost: boolean;
}

const SearchBar = ({ usernameSearchTerm, setUsernameSearchTerm, handleSearchClick, loadingUserFirstPost }: SearchBarProps) => {
  const t = useT();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={usernameSearchTerm}
        onChange={(e) => setUsernameSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('search.placeholder')}
        className="px-4 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        onClick={handleSearchClick}
        disabled={loadingUserFirstPost}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {loadingUserFirstPost ? t('search.searching') : t('search.button_search')}
      </button>
    </div>
  );
};

export default SearchBar;
