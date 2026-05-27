"use client";

import { useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import SortDropdown from '@/components/SortDropdown';
import StatsCards from '@/components/StatsCards';
import PostGrid from '@/components/PostGrid';
import LoadMoreButton from '@/components/LoadMoreButton';
import EmptyState from '@/components/EmptyState';
import { useHivePosts } from '@/hooks/useHivePosts';
import { useUserFirstPost } from '@/hooks/useUserFirstPost';
import { formatDate } from '@/utils/dateUtils';
import { POSTS_PER_LOAD } from '@/config/constants';

const HiveUsersPage = () => {
  const postsPerLoad = POSTS_PER_LOAD;
  const { 
    posts: hivePosts, 
    loading: loadingHive, 
    loadingMore, 
    hasMore, 
    sortOption, 
    setSortOption, 
    lastUpdated, 
    handleLoadMore, 
    handleRefresh: refreshHivePosts 
  } = useHivePosts({ postsPerLoad });
  
  const { userFirstPost, loadingUserFirstPost, usernameSearchTerm, setUsernameSearchTerm, handleSearchClick, handleRefresh: refreshUserPost } = useUserFirstPost();

  const handleOverallRefresh = useCallback(() => {
    if (userFirstPost) {
      refreshUserPost();
    } else {
      refreshHivePosts();
    }
  }, [userFirstPost, refreshUserPost, refreshHivePosts]);

  const pageTitle = userFirstPost
    ? `Primeiro Post de @${userFirstPost.author} - NewBee Hive 🐝`
    : 'NewBee Hive 🐝 - Explorar Postagens de Introdução na Hive Blockchain';

  const pageDescription = userFirstPost
    ? `Veja o primeiro post de introdução de @${userFirstPost.author} na Hive Blockchain.`
    : 'Descubra as últimas postagens de introdução na comunidade Hive Blockchain. Explore perfis e novos membros.';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>

      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {userFirstPost ? `Primeiro Post de @${userFirstPost.author}` : 'NewBee Hive 🐝 - Explorar Postagens de Introdução na Hive Blockchain'}
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              {userFirstPost ? 'Este é o primeiro post encontrado para o usuário.' : 'Descubra as últimas postagens de introdução na comunidade Hive.'}
            </p>
            {lastUpdated && !userFirstPost && (
              <p className="text-sm text-muted-foreground mb-6">
                Última atualização: {formatDate(lastUpdated)}
              </p>
            )}
            
            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <SearchBar 
                usernameSearchTerm={usernameSearchTerm} 
                setUsernameSearchTerm={setUsernameSearchTerm} 
                handleSearchClick={handleSearchClick} 
                loadingUserFirstPost={loadingUserFirstPost} 
              />
              {!userFirstPost && (
                <>
                  <SortDropdown sortOption={sortOption} setSortOption={setSortOption} />
                  <Button onClick={handleOverallRefresh} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                    <RefreshCw className="h-4 w-4" />
                    Atualizar
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <StatsCards posts={hivePosts} userFirstPost={userFirstPost} />

          {/* Content */}
          <PostGrid 
            posts={hivePosts} 
            loadingHive={loadingHive} 
            userFirstPost={userFirstPost} 
            loadingUserFirstPost={loadingUserFirstPost} 
            postsPerLoad={postsPerLoad}
          />
          <LoadMoreButton 
            handleLoadMore={handleLoadMore} 
            loadingMore={loadingMore} 
            hasMore={hasMore} 
            posts={hivePosts} 
            userFirstPost={userFirstPost} 
          />
          <EmptyState 
            usernameSearchTerm={usernameSearchTerm} 
            loadingUserFirstPost={loadingUserFirstPost} 
            userFirstPost={userFirstPost} 
            loadingHive={loadingHive} 
            hivePosts={hivePosts} 
          />
        </div>
      </div>
    </>
  );
};

export default HiveUsersPage;
