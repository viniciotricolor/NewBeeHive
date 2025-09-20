"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Search, User, ExternalLink, RefreshCw, MessageSquare, ThumbsUp, X } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { useNavigate, Link } from 'react-router-dom';
import { getDiscussionsByBlog, PostParams } from '@/services/hive';
import { useDebounce } from '@/hooks/use-debounce';
import PostCardSkeleton from '@/components/PostCardSkeleton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

interface UserProfile {
  username: string;
  displayName: string;
  avatarUrl: string;
  about?: string;
}

const postsPerLoad = 12;

const HiveUsersPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [usernameSearchTerm, setUsernameSearchTerm] = useState('');
  const debouncedUsernameSearchTerm = useDebounce(usernameSearchTerm, 500);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const navigate = useNavigate();

  const [searchedUserProfile, setSearchedUserProfile] = useState<UserProfile | null>(null);

  const processRawPost = useCallback(async (post: any): Promise<Post> => {
    let authorDisplayName = post.author;
    let authorAvatarUrl = `https://images.hive.blog/u/${post.author}/avatar`;
    let about = '';

    try {
      const metadata = JSON.parse(post.json_metadata);
      if (metadata && metadata.profile) {
        if (metadata.profile.name) {
          authorDisplayName = metadata.profile.name;
        }
        if (metadata.profile.profile_image) {
          authorAvatarUrl = metadata.profile.profile_image;
        }
        if (metadata.profile.about) {
          about = metadata.profile.about;
        }
      }
    } catch (e) {
      // Metadados podem estar malformados ou ausentes, fallback já definido
    }

    // Update the searchedUserProfile if it's the first post being processed
    if (!searchedUserProfile || searchedUserProfile.username !== post.author) {
      setSearchedUserProfile({
        username: post.author,
        displayName: authorDisplayName,
        avatarUrl: authorAvatarUrl,
        about: about,
      });
    }

    return {
      title: post.title,
      body: post.body.substring(0, 150) + (post.body.length > 150 ? '...' : ''),
      created: post.created,
      permlink: post.permlink,
      author: post.author,
      url: `https://hive.blog/@${post.author}/${post.permlink}`,
      replies: post.children,
      active_votes: post.active_votes,
      json_metadata: post.json_metadata,
      author_display_name: authorDisplayName,
      author_avatar_url: authorAvatarUrl,
      pending_payout_value: post.pending_payout_value,
    };
  }, [searchedUserProfile]);

  const fetchUserProfileAndPosts = useCallback(async (
    username: string,
    isInitialLoad: boolean = true,
    startAuthor: string = '',
    startPermlink: string = ''
  ) => {
    if (!username) {
      setPosts([]);
      setSearchedUserProfile(null);
      return;
    }

    if (isInitialLoad) {
      setLoadingPosts(true);
      setPosts([]);
      setSearchedUserProfile(null);
      setHasMorePosts(false);
    } else {
      setLoadingMorePosts(true);
    }

    try {
      const params: PostParams = {
        tag: username, // O nome de usuário é a tag para getDiscussionsByBlog
        limit: postsPerLoad + 1,
      };

      if (startAuthor && startPermlink) {
        params.start_author = startAuthor;
        params.start_permlink = startPermlink;
      }

      const rawPosts = await getDiscussionsByBlog(params);
      
      const postsToProcess = (startAuthor && startPermlink && rawPosts.length > 0 && rawPosts[0].author === startAuthor && rawPosts[0].permlink === startPermlink)
        ? rawPosts.slice(1)
        : rawPosts;

      const fetchedPosts = await Promise.all(postsToProcess.map(processRawPost));
      
      setPosts(prevPosts => isInitialLoad ? fetchedPosts : [...prevPosts, ...fetchedPosts]);
      setHasMorePosts(rawPosts.length > postsPerLoad);

      if (isInitialLoad && fetchedPosts.length > 0) {
        showSuccess(`Posts de @${username} carregados com sucesso!`);
      } else if (isInitialLoad && fetchedPosts.length === 0) {
        showError(`Nenhum post encontrado para @${username}.`);
      }

    } catch (error: any) {
      console.error("Erro ao buscar perfil e posts do usuário:", error);
      showError(`Falha ao buscar perfil e posts: ${error.message}.`);
      setPosts([]);
      setSearchedUserProfile(null);
      setHasMorePosts(false);
    } finally {
      setLoadingPosts(false);
      setLoadingMorePosts(false);
    }
  }, [processRawPost]);

  useEffect(() => {
    if (debouncedUsernameSearchTerm) {
      fetchUserProfileAndPosts(debouncedUsernameSearchTerm);
    } else {
      setPosts([]);
      setSearchedUserProfile(null);
      setHasMorePosts(false);
    }
  }, [debouncedUsernameSearchTerm, fetchUserProfileAndPosts]);

  const handleSearchClick = () => {
    if (usernameSearchTerm.trim()) {
      fetchUserProfileAndPosts(usernameSearchTerm.trim());
    } else {
      setPosts([]);
      setSearchedUserProfile(null);
      setHasMorePosts(false);
    }
  };

  const handleLoadMore = () => {
    if (posts.length > 0 && hasMorePosts && !loadingMorePosts && searchedUserProfile) {
      const lastPost = posts[posts.length - 1];
      fetchUserProfileAndPosts(searchedUserProfile.username, false, lastPost.author, lastPost.permlink);
    }
  };

  const formatDate = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isLoadingContent = loadingPosts;
  const isEmptyState = posts.length === 0 && !isLoadingContent && debouncedUsernameSearchTerm;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {searchedUserProfile ? `Perfil e Posts de @${searchedUserProfile.username}` : 'Buscar Usuários da Hive Blockchain'}
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            {searchedUserProfile ? 'Explore o perfil e as últimas postagens deste usuário.' : 'Digite um nome de usuário para ver seu perfil e posts.'}
          </p>
          
          {/* Search Input */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <div className="relative w-full sm:w-96 flex">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar usuário por nome de usuário..."
                value={usernameSearchTerm}
                onChange={(e) => setUsernameSearchTerm(e.target.value)}
                className="pl-10 pr-10 bg-input border-input text-foreground flex-grow"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchClick();
                  }
                }}
                aria-label="Buscar usuário por nome de usuário"
              />
              {usernameSearchTerm.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
                  onClick={() => {
                    setUsernameSearchTerm('');
                  }}
                  aria-label="Limpar busca"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button onClick={handleSearchClick} disabled={loadingPosts} className="ml-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                {loadingPosts ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        {searchedUserProfile && (
          <Card className="bg-card border-border mb-8 p-6 flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={searchedUserProfile.avatarUrl} alt={searchedUserProfile.displayName} />
              <AvatarFallback className="text-4xl">{searchedUserProfile.displayName?.charAt(0) || searchedUserProfile.username.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-bold text-foreground mb-1">{searchedUserProfile.displayName}</h2>
              <p className="text-lg text-primary mb-2">@{searchedUserProfile.username}</p>
              {searchedUserProfile.about && (
                <p className="text-muted-foreground max-w-prose">{searchedUserProfile.about}</p>
              )}
            </div>
          </Card>
        )}

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingContent ? (
            Array.from({ length: postsPerLoad }).map((_, i) => <PostCardSkeleton key={i} />)
          ) : (
            posts.map((post) => (
              <Card key={post.permlink} className="hover:shadow-lg transition-shadow duration-300 bg-card border-border">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author_avatar_url} alt={post.author_display_name} />
                      <AvatarFallback>{post.author_display_name?.charAt(0) || post.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg text-card-foreground">{post.title}</CardTitle>
                      <CardDescription className="text-sm text-primary">
                        Por <Link to={`/users/${post.author}`} className="font-medium hover:underline">@{post.author}</Link>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none text-card-foreground text-sm mb-3">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ node, ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} />
                      }}
                    >
                      {post.body}
                    </ReactMarkdown>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" /> {formatDate(post.created)}
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="h-3 w-3 mr-1" /> {post.replies}
                    </div>
                    <div className="flex items-center">
                      <ThumbsUp className="h-3 w-3 mr-1" /> {post.active_votes.length}
                    </div>
                    <div className="flex items-center">
                      <span className="font-bold text-green-600">${post.pending_payout_value.replace(' HBD', '')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" 
                      onClick={() => navigate(`/users/${post.author}`)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Ver Perfil
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 bg-card text-card-foreground border-border" 
                      onClick={() => navigate(`/post/${post.author}/${post.permlink}`)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver Post
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Load More Button */}
        {hasMorePosts && posts.length > 0 && !searchedUserProfile && (
          <div className="flex justify-center mt-8">
            <Button onClick={handleLoadMore} disabled={loadingMorePosts} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {loadingMorePosts ? 'Carregando...' : 'Carregar Mais'}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {isEmptyState && (
          <div className="text-center py-12 text-muted-foreground">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum post encontrado para "{debouncedUsernameSearchTerm}"</h3>
            <p className="text-muted-foreground">Verifique o nome de usuário e tente novamente.</p>
          </div>
        )}
        {!debouncedUsernameSearchTerm && !searchedUserProfile && !isLoadingContent && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Comece sua busca</h3>
            <p className="text-muted-foreground">Digite um nome de usuário na barra de busca acima para ver seu perfil e posts.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HiveUsersPage;