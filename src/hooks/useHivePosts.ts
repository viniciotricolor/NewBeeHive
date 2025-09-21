import { useState, useCallback, useEffect } from 'react';
import { showSuccess, showError } from '@/utils/toast';
import { getDiscussionsByCreated, getDiscussionsByHot, getDiscussionsByTrending, PostParams } from '@/services/hive';
import { processRawPost } from '@/pages/HiveUsers'; // Import temporário; mover para utils se necessário

export type SortOption = 'created' | 'hot' | 'trending';

interface UseHivePostsProps {
  postsPerLoad: number;
  onPostsChange?: (posts: any[]) => void;
}

export const useHivePosts = ({ postsPerLoad, onPostsChange }: UseHivePostsProps) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('created');
  const [hasMore, setHasMore] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPosts = useCallback(async (
    isInitialLoad: boolean = true,
    currentSortOption: SortOption = sortOption,
    startAuthor: string = '',
    startPermlink: string = ''
  ) => {
    if (isInitialLoad) {
      setLoading(true);
      setPosts([]);
      setHasMore(false);
    } else {
      setLoadingMore(true);
    }

    try {
      let discussionMethod;
      const tagToUse = 'introduceyourself';

      switch (currentSortOption) {
        case 'hot':
          discussionMethod = getDiscussionsByHot;
          break;
        case 'trending':
          discussionMethod = getDiscussionsByTrending;
          break;
        case 'created':
        default:
          discussionMethod = getDiscussionsByCreated;
          break;
      }

      const params: PostParams = {
        tag: tagToUse,
        limit: postsPerLoad + 1
      };

      if (startAuthor && startPermlink) {
        params.start_author = startAuthor;
        params.start_permlink = startPermlink;
      }

      const rawPosts = await discussionMethod(params);
      
      const postsToProcess = (startAuthor && startPermlink && rawPosts.length > 0 && rawPosts[0].author === startAuthor && rawPosts[0].permlink === startPermlink)
        ? rawPosts.slice(1)
        : rawPosts;

      const fetchedPosts = await Promise.all(postsToProcess.map(processRawPost));
      
      setPosts(prevPosts => isInitialLoad ? fetchedPosts : [...prevPosts, ...fetchedPosts]);
      setHasMore(rawPosts.length > postsPerLoad);

      if (isInitialLoad) {
        showSuccess("Postagens de introdução da Hive carregadas com sucesso!");
      }
      setLastUpdated(new Date());

      onPostsChange?.(fetchedPosts);
    } catch (error: any) {
      console.error("Erro ao buscar postagens de introdução da Hive:", error);
      showError(`Falha ao carregar postagens de introdução da Hive: ${error.message}.`);
      setPosts([]);
      setHasMore(false);
      setLastUpdated(null);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setLoadingRefresh(false);
    }
  }, [sortOption, postsPerLoad, onPostsChange]);

  const handleLoadMore = useCallback(() => {
    if (posts.length > 0 && hasMore && !loadingMore) {
      const lastPost = posts[posts.length - 1];
      fetchPosts(false, sortOption, lastPost.author, lastPost.permlink);
    }
  }, [posts, hasMore, loadingMore, sortOption, fetchPosts]);

  const handleRefresh = useCallback(() => {
    setLoadingRefresh(true);
    showSuccess("Atualizando lista de postagens...");
    fetchPosts(true, sortOption);
  }, [sortOption, fetchPosts]);

  useEffect(() => {
    fetchPosts(true, sortOption);
  }, [sortOption, fetchPosts]);

  return {
    posts,
    loading,
    loadingMore,
    loadingRefresh,
    sortOption,
    setSortOption,
    hasMore,
    lastUpdated,
    fetchPosts,
    handleLoadMore,
    handleRefresh
  };
};