import React, { Dispatch, SetStateAction } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, RefreshCw } from "lucide-react";
// Removido o import de useUserFirstPost, pois as props agora vêm de cima.

interface SearchBarProps {
  usernameSearchTerm: string;
  setUsernameSearchTerm: Dispatch<SetStateAction<string>>;
  handleSearchClick: () => void;
  loadingUserFirstPost: boolean;
}

const SearchBar = ({ usernameSearchTerm, setUsernameSearchTerm, handleSearchClick, loadingUserFirstPost }: SearchBarProps) => {
  return (
    <div className="relative w-full sm:w-96 flex">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        type="text"
        placeholder="Buscar primeiro post por nome de usuário..."
        value={usernameSearchTerm}
        onChange={(e) => setUsernameSearchTerm(e.target.value)}
        className="pl-10 pr-10 bg-input border-input text-foreground flex-grow"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearchClick();
          }
        }}
        aria-label="Buscar primeiro post por nome de usuário"
      />
      {usernameSearchTerm.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
          onClick={() => setUsernameSearchTerm('')}
          aria-label="Limpar busca"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <Button onClick={handleSearchClick} disabled={loadingUserFirstPost} className="ml-2 bg-primary hover:bg-primary/90 text-primary-foreground">
        {loadingUserFirstPost ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default SearchBar;