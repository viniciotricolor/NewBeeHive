import { useState, useCallback, useEffect } from 'react';
import { showSuccess, showError } from '@/utils/toast';
import { getDiscussionsByCreated, getDiscussionsByHot, getDiscussionsByTrending, PostParams } from '@/services/hive';
import { processRawPost } from '@/utils/postUtils';

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
      setHasMore(true); // Reset hasMore for initial load
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
        limit: postsPerLoad + 1 // Request one extra to check if there's more
      };

      if (startAuthor && startPermlink) {
        params.start_author = startAuthor;
        params.start_permlink = startPermlink;
      }

      let rawPosts = await discussionMethod(params);
      
      // If loading more, and the API returned the starting post, remove it.
      // This is a common pattern for Hive API pagination where the start_author/permlink is included.
      if (!isInitialLoad && startAuthor && startPermlink && rawPosts.length > 0) {
        // Only slice if the first post returned is indeed the one we started from
        if (rawPosts[0].author === startAuthor && rawPosts[0].permlink === startPermlink) {
          rawPosts = rawPosts.slice(1);
        }
      }
      
      const fetchedPosts = await Promise.all(rawPosts.map(processRawPost));
      
      // Determine if there are more posts based on the number of posts received
      // compared to the requested limit (postsPerLoad + 1, before potential slicing)
      // If rawPosts.length was originally postsPerLoad + 1, and we sliced one, it means there are more.
      // If rawPosts.length (after slicing) is less than postsPerLoad, then there are no more.
      const newHasMore = fetchedPosts.length === postsPerLoad;
      setHasMore(newHasMore);

      setPosts(prevPosts => isInitialLoad ? fetchedPosts : [...prevPosts, ...fetchedPosts]);

      if (isInitialLoad) {
        showSuccess("Postagens de introdução da Hive carregadas com sucesso!");
      }
      setLastUpdated(new Date());

      onPostsChange?.(fetchedPosts);

      console.log("useHivePosts Debug:");
      console.log("  isInitialLoad:", isInitialLoad);
      console.log("  currentSortOption:", currentSortOption);
      console.log("  startAuthor:", startAuthor);
      console.log("  startPermlink:", startPermlink);
      console.log("  rawPosts.length (from API):", rawPosts.length);
      console.log("  fetchedPosts.length (processed):", fetchedPosts.length);
      console.log("  postsPerLoad:", postsPerLoad);
      console.log("  newHasMore (calculated):", newHasMore);
      console.log("  current posts.length:", (isInitialLoad ? fetchedPosts : [...posts, ...fetchedPosts]).length);

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
  }, [sortOption, postsPerLoad, onPostsChange, posts]);

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