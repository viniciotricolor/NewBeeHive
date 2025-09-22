import { useState, useCallback, useEffect } from 'react';
import { showSuccess, showError } from '@/utils/toast';
import { getDiscussionsByCreated, getDiscussionsByHot, getDiscussionsByTrending, PostParams } from '@/services/hive';
import { processRawPost } from '@/utils/postUtils';
import { Post } from '@/types/hive';
import { INTRODUCE_YOURSELF_TAG } from '@/config/constants';

export type SortOption = 'created' | 'hot' | 'trending';

interface UseHivePostsProps {
  postsPerLoad: number;
  onPostsChange?: (posts: Post[]) => void;
}

export const useHivePosts = ({ postsPerLoad, onPostsChange }: UseHivePostsProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
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
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      let discussionMethod;
      const tagToUse = INTRODUCE_YOURSELF_TAG;

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
        limit: postsPerLoad + 1 // Solicita um a mais para verificar se há mais páginas
      };

      if (startAuthor && startPermlink) {
        params.start_author = startAuthor;
        params.start_permlink = startPermlink;
      }

      let rawPosts = await discussionMethod(params);
      
      // Remove o primeiro post se for uma duplicata (ocorre em carregamentos subsequentes)
      if (!isInitialLoad && startAuthor && startPermlink && rawPosts.length > 0) {
        if (rawPosts[0].author === startAuthor && rawPosts[0].permlink === startPermlink) {
          rawPosts = rawPosts.slice(1);
        }
      }
      
      const processedPosts = await Promise.all(rawPosts.map(processRawPost));
      
      // Determina se há mais posts para carregar
      const newHasMore = processedPosts.length > postsPerLoad;
      setHasMore(newHasMore);

      // Pega apenas o número de posts desejado (postsPerLoad) para adicionar ao estado
      const postsToAdd = newHasMore ? processedPosts.slice(0, postsPerLoad) : processedPosts;

      setPosts(prevPosts => isInitialLoad ? postsToAdd : [...prevPosts, ...postsToAdd]);

      if (isInitialLoad) {
        showSuccess("Postagens de introdução da Hive carregadas com sucesso!");
      }
      setLastUpdated(new Date());

      onPostsChange?.(postsToAdd);

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