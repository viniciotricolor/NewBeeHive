import React from 'react';
import { Button } from "@/components/ui/button";
import { useHivePosts } from '@/hooks/useHivePosts';
import { useUserFirstPost } from '@/hooks/useUserFirstPost';

const LoadMoreButton = () => {
  const { handleLoadMore, loadingMore, hasMore, posts } = useHivePosts({ postsPerLoad: 10 }); // Alterado para 10
  const { userFirstPost } = useUserFirstPost();

  if (!hasMore || posts.length === 0 || userFirstPost) return null;

  return (
    <div className="flex justify-center mt-8">
      <Button onClick={handleLoadMore} disabled={loadingMore} className="bg-primary hover:bg-primary/90 text-primary-foreground">
        {loadingMore ? 'Carregando...' : 'Carregar Mais'}
      </Button>
    </div>
  );
};

export default LoadMoreButton;