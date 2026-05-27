import { useState, useCallback } from 'react';
import { showSuccess, showError } from '@/utils/toast';
import { getDiscussionsByBlog, PostParams } from '@/services/hive';
import { processRawPost } from '@/utils/postUtils';
import { Post, RawHivePost } from '@/types/hive';
import { USER_FIRST_POST_MAX_PAGES, USER_FIRST_POST_POSTS_PER_PAGE } from '@/config/constants';

export const useUserFirstPost = () => {
  const [userFirstPost, setUserFirstPost] = useState<Post | null>(null);
  const [loadingUserFirstPost, setLoadingUserFirstPost] = useState(false);
  const [usernameSearchTerm, setUsernameSearchTerm] = useState('');

  const fetchUserIntroductionPost = useCallback(async (username: string) => {
    if (!username) {
      setUserFirstPost(null);
      return;
    }

    setLoadingUserFirstPost(true);
    setUserFirstPost(null);

    try {
      let allPosts: RawHivePost[] = [];
      let currentStartAuthor = '';
      let currentStartPermlink = '';
      let page = 0;
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

      // Procurar o primeiro post que contenha a tag #introduceyourself
      let introductionPost: RawHivePost | null = null;

      for (const post of allPosts) {
        try {
          const metadata = JSON.parse(post.json_metadata);
          const tags: string[] = metadata.tags || [];
          if (tags.includes('introduceyourself')) {
            introductionPost = post;
            break;
          }
        } catch (e) {
          // Ignorar posts com metadados inválidos
          continue;
        }
      }

      // Se não achou com a tag, pegar o post mais antigo (fallback)
      if (!introductionPost) {
        const sorted = [...allPosts].sort(
          (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime()
        );
        introductionPost = sorted[0];
      }

      const processedPost = await processRawPost(introductionPost);
      setUserFirstPost(processedPost);
      showSuccess(
        `Post de introdução de @${username} encontrado! (Buscado entre ${allPosts.length} posts)`
      );
    } catch (error: any) {
      console.error('Erro ao buscar post de introdução do usuário:', error);
      showError(
        `Falha ao buscar post: ${error.message}. Verifique se o usuário existe na Hive.`
      );
    } finally {
      setLoadingUserFirstPost(false);
    }
  }, []);

  const handleSearchClick = useCallback(() => {
    if (usernameSearchTerm.trim()) {
      fetchUserIntroductionPost(usernameSearchTerm.trim());
    } else {
      setUserFirstPost(null);
    }
  }, [usernameSearchTerm, fetchUserIntroductionPost]);

  const handleRefresh = useCallback(() => {
    if (usernameSearchTerm.trim()) {
      fetchUserIntroductionPost(usernameSearchTerm.trim());
    }
  }, [usernameSearchTerm, fetchUserIntroductionPost]);

  const clearUserFirstPost = useCallback(() => {
    setUserFirstPost(null);
    setUsernameSearchTerm('');
  }, []);

  return {
    userFirstPost,
    loadingUserFirstPost,
    usernameSearchTerm,
    setUsernameSearchTerm,
    handleSearchClick,
    handleRefresh,
    clearUserFirstPost,
  };
};
