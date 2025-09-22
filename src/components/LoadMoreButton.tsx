import { Button } from "@/components/ui/button";
import { Post } from '@/types/hive';

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