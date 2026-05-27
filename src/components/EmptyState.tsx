'use client';

import { useT } from '@/i18n/context';
import { User } from "lucide-react";
import { Post } from '@/types/hive';

interface EmptyStateProps {
  usernameSearchTerm: string;
  loadingUserFirstPost: boolean;
  userFirstPost: Post | null;
  loadingHive: boolean;
  hivePosts: Post[];
}

const EmptyState = ({ usernameSearchTerm, loadingUserFirstPost, userFirstPost, loadingHive, hivePosts }: EmptyStateProps) => {
  const t = useT();
  const isEmptyState = (userFirstPost ? 0 : hivePosts.length) === 0 && !loadingUserFirstPost && !loadingHive;
  const isSearchEmpty = isEmptyState && usernameSearchTerm.trim();

  if (!isEmptyState) return null;

  return (
    <div className="text-center py-12 text-muted-foreground">
      <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-foreground mb-2">
        {isSearchEmpty ? `${t('error.user_not_found')}: "${usernameSearchTerm}"` : t('error.no_posts')}
      </h3>
      <p className="text-muted-foreground">
        {isSearchEmpty ? `${t('error.user_not_found')} ${t('common.refresh').toLowerCase()}...` : t('common.refresh')}
      </p>
    </div>
  );
};

export default EmptyState;
