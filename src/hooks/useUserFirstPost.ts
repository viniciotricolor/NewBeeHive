import { useState, useCallback } from 'react';
import { showSuccess, showError } from '@/utils/toast';
import { getDiscussionsByBlog, PostParams } from '@/services/hive';
import { processRawPost } from '@/utils/postUtils';
import { Post } from '@/types/hive'; // Importar a interface Post centralizada
import { USER_FIRST_POST_MAX_PAGES, USER_FIRST_POST_POSTS_PER_PAGE } from '@/config/constants'; // Importar constantes

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
      // Usar constantes
      const maxPages = USER_FIRST_POST_MAX_PAGES;
      const postsPerPage = USER_FIRST_POST_POSTS_PER_PAGE;

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