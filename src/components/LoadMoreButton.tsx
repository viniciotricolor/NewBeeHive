'use client';

import { useT } from '@/i18n/context';
import { Button } from '@/components/ui/button';

interface LoadMoreButtonProps {
  handleLoadMore: () => void;
  loadingMore: boolean;
  hasMore: boolean;
  posts: any[];
  userFirstPost: any | null;
}

const LoadMoreButton = ({ handleLoadMore, loadingMore, hasMore, posts, userFirstPost }: LoadMoreButtonProps) => {
  const t = useT();
  if (!hasMore || posts.length === 0 || userFirstPost) return null;

  return (
    <div className="flex justify-center mt-8">
      <Button onClick={handleLoadMore} disabled={loadingMore} className="bg-primary hover:bg-primary/90 text-primary-foreground">
        {loadingMore ? t('common.loading') : t('common.load_more')}
      </Button>
    </div>
  );
};

export default LoadMoreButton;
