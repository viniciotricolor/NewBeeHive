"use client";

import { useCallback, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import SortDropdown from '@/components/SortDropdown';
import StatsCards from '@/components/StatsCards';
import PostGrid from '@/components/PostGrid';
import EmptyState from '@/components/EmptyState';
import { useHivePosts } from '@/hooks/useHivePosts';
import { useUserFirstPost } from '@/hooks/useUserFirstPost';
import { useT } from '@/i18n/context';
import { formatDate } from '@/utils/dateUtils';
import { POSTS_PER_LOAD } from '@/config/constants';

const HiveUsersPage = () => {
  const t = useT();
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
  
  const { 
    userFirstPost, 
    loadingUserFirstPost, 
    usernameSearchTerm, 
    setUsernameSearchTerm, 
    handleSearchClick, 
    handleRefresh: refreshUserPost,
    clearUserFirstPost 
  } = useUserFirstPost();

  const handleOverallRefresh = useCallback(() => {
    if (userFirstPost) {
      refreshUserPost();
    } else {
      refreshHivePosts();
    }
  }, [userFirstPost, refreshUserPost, refreshHivePosts]);

  const handleBackToFeed = useCallback(() => {
    clearUserFirstPost();
  }, [clearUserFirstPost]);

  // === Infinite Scroll via IntersectionObserver ===
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || loadingMore || userFirstPost) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !userFirstPost) {
          handleLoadMore();
        }
      },
      { rootMargin: '300px' }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [hasMore, loadingMore, handleLoadMore, userFirstPost]);

  const pageTitle = userFirstPost
    ? `${t('search.first_post_of')} @${userFirstPost.author} - NewBee Hive 🐝`
    : `NewBee Hive 🐝 - ${t('site.tagline')}`;

  const pageDescription = userFirstPost
    ? `Veja o primeiro post de introdução de @${userFirstPost.author} na Hive Blockchain.`
    : t('site.tagline_home');

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
          <div className="text-center mb-8 mt-4">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {userFirstPost ? `${t('search.first_post_of')} @${userFirstPost.author}` : t('site.name')}
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              {userFirstPost 
                ? t('site.tagline_search')
                : t('site.tagline_home')}
            </p>
            {lastUpdated && !userFirstPost && (
              <p className="text-sm text-muted-foreground mb-6">
                {t('common.last_updated')}: {formatDate(lastUpdated)}
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
              {userFirstPost && (
                <Button 
                  onClick={handleBackToFeed}
                  variant="outline"
                  className="flex items-center gap-2 bg-card text-card-foreground border-border"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t('common.back_to_feed')}
                </Button>
              )}
              {!userFirstPost && (
                <>
                  <SortDropdown sortOption={sortOption} setSortOption={setSortOption} />
                  <Button onClick={handleOverallRefresh} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                    <RefreshCw className="h-4 w-4" />
                    {t('common.refresh')}
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

          {/* Sentinel para infinite scroll */}
          {!userFirstPost && hasMore && !loadingMore && (
            <div ref={sentinelRef} className="h-10" />
          )}

          {/* Loading indicator */}
          {loadingMore && !userFirstPost && (
            <div className="flex justify-center py-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>{t('common.loading_more')}</span>
              </div>
            </div>
          )}

          {/* Fallback manual button */}
          {!userFirstPost && hasMore && !loadingMore && hivePosts.length > 0 && (
            <div className="flex justify-center mt-4">
              <Button 
                onClick={handleLoadMore} 
                variant="outline"
                className="bg-card text-card-foreground border-border text-sm"
              >
                {t('common.load_more')}
              </Button>
            </div>
          )}

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
