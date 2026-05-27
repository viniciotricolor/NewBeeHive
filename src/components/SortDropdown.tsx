'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { SortOption } from '@/hooks/useHivePosts';
import { useT } from '@/i18n/context';

interface SortDropdownProps {
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
}

const SortDropdown = ({ sortOption, setSortOption }: SortDropdownProps) => {
  const t = useT();

  const getSortOptionLabel = (option: string) => {
    switch (option) {
      case 'created': return t('sort.recent');
      case 'hot': return t('sort.comments');
      case 'trending': return t('sort.votes');
      default: return t('sort.label');
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
          {t('sort.recent')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSortOption('hot')} className="hover:bg-accent hover:text-accent-foreground">
          {t('sort.comments')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSortOption('trending')} className="hover:bg-accent hover:text-accent-foreground">
          {t('sort.votes')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortDropdown;
