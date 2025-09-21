import { useState, useCallback } from 'react';
import { showSuccess, showError } from '@/utils/toast';
import { getDiscussionsByBlog, PostParams } from '@/services/hive';
import { processRawPost } from '@/pages/HiveUsers'; // Import temporário; mover para utils se necessário

interface Post {
  title: string;
  body: string;
  created: string;
  permlink: string;
  author: string;
  url: string;
  replies: number;
  active_votes: Array<{ percent: number }>;
  json_metadata: string;
  author_display_name?: string;
  author_avatar_url?: string;
  pending_payout_value: string;
}

export const useUserFirstPost = () => {
  const [userFirstPost, setUserFirstPost] = useState<Post | null>(null);
  const [loadingUserFirstPost, setLoadingUserFirstPost] = useState(false);
  const [usernameSearchTerm, setUsernameSearchTerm] = useState('');

  const fetchUserFirstPost = useCallback(async (username: string) => {
    if (!username) {
      setUserFirstPost(null);
      return;
    }

    setLoadingUserFirstPost(true);
    setUserFirstPost(null);

    try {
      let allPosts: any[] = [];
      let currentStartAuthor = '';
      let currentStartPermlink = '';
      let page = 0;
      const maxPages = 5;
      const postsPerPage = 100;

      while (page < maxPages) {
        const params: PostParams = {
          tag: username,
          limit: postsPerPage,
        };

        if (page > 0 && currentStartAuthor && currentStartPermlink) {
          params.start_author = currentStartAuthor;
          params.start_permlink = currentStartPermlink;
        }

        const rawPosts = await getDiscussionsByBlog(params);

        if (!rawPosts || rawPosts.length === 0) {
          break;
        }

        allPosts = [...allPosts, ...rawPosts];

        const lastPostInPage = rawPosts[rawPosts.length - 1];
        currentStartAuthor = lastPostInPage.author;
        currentStartPermlink = lastPostInPage.permlink;

        if (rawPosts.length < postsPerPage) {
          break;
        }

        page++;
      }

      if (allPosts.length === 0) {
        showError(`Nenhum post encontrado para @${username}.`);
        return;
      }

      const sortedPosts = [...allPosts].sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime());
      const firstPost = sortedPosts[0];

      const processedPost = await processRawPost(firstPost);
      setUserFirstPost(processedPost);
      showSuccess(`Primeiro post de @${username} encontrado! (Buscado entre ${allPosts.length} posts)`);
    } catch (error: any) {
      console.error("Erro ao buscar primeiro post do usuário:", error);
      showError(`Falha ao buscar primeiro post: ${error.message}. Verifique se o usuário existe na Hive.`);
    } finally {
      setLoadingUserFirstPost(false);
    }
  }, []);

  const handleSearchClick = useCallback(() => {
    if (usernameSearchTerm.trim()) {
      fetchUserFirstPost(usernameSearchTerm.trim());
    } else {
      setUserFirstPost(null);
    }
  }, [usernameSearchTerm, fetchUserFirstPost]);

  const handleRefresh = useCallback(() => {
    if (usernameSearchTerm.trim()) {
      fetchUserFirstPost(usernameSearchTerm.trim());
    }
  }, [usernameSearchTerm, fetchUserFirstPost]);

  return {
    userFirstPost,
    loadingUserFirstPost,
    usernameSearchTerm,
    setUsernameSearchTerm,
    handleSearchClick,
    handleRefresh
  };
};