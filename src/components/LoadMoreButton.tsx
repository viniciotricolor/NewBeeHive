import React from 'react';
import { Button } from "@/components/ui/button";

interface Post {
  title: string;
  body: string;
  created: string;
  permlink: string;
  author: string;
  author_display_name?: string;
  author_avatar_url?: string;
  replies: number;
  active_votes: Array<{ percent: number }>;
  pending_payout_value: string;
  url: string;
}

interface LoadMoreButtonProps {
  handleLoadMore: () => void;
  loadingMore: boolean;
  hasMore: boolean;
  posts: Post[];
  userFirstPost: Post | null;
}

const LoadMoreButton = ({ handleLoadMore, loadingMore, hasMore, posts, userFirstPost }: LoadMoreButtonProps) => {
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