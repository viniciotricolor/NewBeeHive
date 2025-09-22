import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { SortOption } from '@/hooks/useHivePosts'; // Importar o tipo SortOption

interface SortDropdownProps {
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
}

const SortDropdown = ({ sortOption, setSortOption }: SortDropdownProps) => {
  const getSortOptionLabel = (option: string) => {
    switch (option) {
      case 'created': return 'Mais Recentes';
      case 'hot': return 'Mais Comentadas';
      case 'trending': return 'Mais Votadas';
      default: return 'Ordenar por';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-card text-card-foreground border-border">
          {getSortOptionLabel(sortOption)} <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover text-popover-foreground border-border">
        <DropdownMenuItem onClick={() => setSortOption('created')} className="hover:bg-accent hover:text-accent-foreground">
          Mais Recentes
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSortOption('hot')} className="hover:bg-accent hover:text-accent-foreground">
          Mais Comentadas
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSortOption('trending')} className="hover:bg-accent hover:text-accent-foreground">
          Mais Votadas
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortDropdown;