"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Search, User, ExternalLink, RefreshCw, MessageSquare, ThumbsUp, ChevronDown } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { useNavigate, Link } from 'react-router-dom';
import { getDiscussionsByCreated, getDiscussionsByHot, getDiscussionsByTrending, callHiveApi } from '@/services/hive';
import { useDebounce } from '@/hooks/use-debounce';
import PostCardSkeleton from '@/components/PostCardSkeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
}

type SortOption = 'created' | 'hot' | 'trending';

const HiveUsersPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [sortOption, setSortOption] = useState<SortOption>('created');
  const [hasMore, setHasMore] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null); // Novo estado para o timestamp da última atualização
  const postsPerLoad = 12;
  const navigate = useNavigate();

  const fetchHivePosts = useCallback(async (
    isInitialLoad: boolean = true,
    currentSortOption: SortOption = sortOption,
    lastAuthor: string = '',
    lastPermlink: string = ''
  ) => {
    if (isInitialLoad) {
      setLoading(true);
      setPosts([]); // Limpa as postagens no carregamento inicial ou atualização
    } else {
      setLoadingMore(true);
    }

    try {
      let discussionMethod;
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

      const params: any = {
        tag: 'introduceyourself',
        limit: postsPerLoad + (isInitialLoad ? 0 : 1) // Busca uma postagem extra para verificar se há mais
      };

      if (!isInitialLoad && lastAuthor && lastPermlink) {
        params.start_author = lastAuthor;
        params.start_permlink = lastPermlink;
      }

      const rawPosts = await discussionMethod(params);

      // Remove a primeira postagem se for uma duplicata do carregamento anterior
      let newRawPosts = isInitialLoad ? rawPosts : rawPosts.slice(1);

      const processedPosts: Post[] = await Promise.all(newRawPosts.map(async (post: any) => {
        let authorDisplayName = post.author;
        let authorAvatarUrl = `https://images.hive.blog/u/${post.author}/avatar`; // Fallback padrão

        try {
          const metadata = JSON.parse(post.json_metadata);
          if (metadata && metadata.profile) {
            if (metadata.profile.name) {
              authorDisplayName = metadata.profile.name;
            }
            if (metadata.profile.profile_image) {
              authorAvatarUrl = metadata.profile.profile_image;
            }
          }
        } catch (e) {
          // Metadados podem estar malformados ou ausentes, fallback já definido
        }

        return {
          title: post.title,
          body: post.body.substring(0, 150) + (post.body.length > 150 ? '...' : ''), // Trunca o corpo
          created: post.created,
          permlink: post.permlink,
          author: post.author,
          url: `https://hive.blog/@${post.author}/${post.permlink}`,
          replies: post.children,
          active_votes: post.active_votes,
          json_metadata: post.json_metadata,
          author_display_name: authorDisplayName,
          author_avatar_url: authorAvatarUrl,
        };
      }));

      // Aplica o filtro de 7 dias SOMENTE para a ordenação 'created'
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0); // Normaliza para o início do dia

      const filteredByDatePosts = currentSortOption === 'created'
        ? processedPosts.filter(post => {
            const postDate = new Date(post.created + 'Z'); // Garante interpretação UTC
            return postDate >= sevenDaysAgo;
          })
        : processedPosts;

      setPosts(prevPosts => isInitialLoad ? filteredByDatePosts : [...prevPosts, ...filteredByDatePosts]);
      setHasMore(rawPosts.length > postsPerLoad); // hasMore baseado na resposta bruta da API

      if (isInitialLoad) {
        showSuccess("Postagens da Hive carregadas com sucesso!");
      }
      setLastUpdated(new Date()); // Atualiza o timestamp no carregamento bem-sucedido

    } catch (error: any) {
      console.error("Erro ao buscar postagens da Hive:", error);
      showError(`Falha ao carregar postagens da Hive: ${error.message}.`);
      setPosts([]);
      setHasMore(false);
      setLastUpdated(null); // Limpa o timestamp em caso de erro
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setLoadingRefresh(false);
    }
  }, [sortOption]);

  useEffect(() => {
    fetchHivePosts(true, sortOption);
  }, [sortOption, fetchHivePosts]);

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    post.author.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    (post.author_display_name && post.author_display_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
  );

  const handleLoadMore = () => {
    if (posts.length > 0) {
      const lastPost = posts[posts.length - 1];
      fetchHivePosts(false, sortOption, lastPost.author, lastPost.permlink);
    }
  };

  const handleRefresh = () => {
    setLoadingRefresh(true);
    showSuccess("Atualizando lista de postagens...");
    fetchHivePosts(true, sortOption);
  };

  const formatDate = (dateInput: string | Date) => { // Modificado para aceitar objeto Date
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVoteWeight = (votes: Array<{ percent: number }>) => {
    return votes.reduce((sum, vote) => sum + vote.percent, 0) / 100;
  };

  const getSortOptionLabel = (option: SortOption) => {
    switch (option) {
      case 'created': return 'Mais Recentes (7 dias)'; // Rótulo atualizado
      case 'hot': return 'Mais Comentadas';
      case 'trending': return 'Mais Votadas';
      default: return 'Ordenar por';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-4">
            Postagens #introduceyourself na Hive Blockchain
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            Descubra as últimas postagens de introdução na comunidade Hive.
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Última atualização: {formatDate(lastUpdated)}
            </p>
          )}
          
          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar por título ou autor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-white dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600">
                  {getSortOptionLabel(sortOption)} <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 dark:border-gray-700">
                <DropdownMenuItem onClick={() => setSortOption('created')} className="dark:text-gray-50 hover:dark:bg-gray-700">
                  Mais Recentes (7 dias)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption('hot')} className="dark:text-gray-50 hover:dark:bg-gray-700">
                  Mais Comentadas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption('trending')} className="dark:text-gray-50 hover:dark:bg-gray-700">
                  Mais Votadas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={handleRefresh} disabled={loadingRefresh} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800">
              {loadingRefresh ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Atualizar
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{posts.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Postagens carregadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Search className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{filteredPosts.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Postagens filtradas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <ExternalLink className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{new Set(posts.map(p => p.author)).size}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Autores únicos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && posts.length === 0 ? (
            Array.from({ length: postsPerLoad }).map((_, i) => <PostCardSkeleton key={i} />)
          ) : (
            filteredPosts.map((post) => (
              <Card key={post.permlink} className="hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author_avatar_url} alt={post.author_display_name} />
                      <AvatarFallback>{post.author_display_name?.charAt(0) || post.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg dark:text-gray-50">{post.title}</CardTitle>
                      <CardDescription className="text-sm text-blue-600 dark:text-blue-400">
                        Por <Link to={`/users/${post.author}`} className="font-medium hover:underline">@{post.author}</Link>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">{post.body}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" /> {formatDate(post.created)}
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="h-3 w-3 mr-1" /> {post.replies}
                    </div>
                    <div className="flex items-center">
                      <ThumbsUp className="h-3 w-3 mr-1" /> {getVoteWeight(post.active_votes).toFixed(2)}
                    </div>
                  </div>
                  <div className="pt-2 mb-4">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      #introduceyourself
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      onClick={() => navigate(`/users/${post.author}`)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Ver Perfil
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1" 
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
        {hasMore && filteredPosts.length > 0 && (
          <div className="flex justify-center mt-8">
            <Button onClick={handleLoadMore} disabled={loadingMore} className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800">
              {loadingMore ? 'Carregando...' : 'Carregar Mais'}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {filteredPosts.length === 0 && !loading && (
          <div className="text-center py-12 dark:text-gray-300">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-2">Nenhuma postagem encontrada</h3>
            <p className="text-gray-600 dark:text-gray-300">Tente ajustar sua busca ou atualizar a lista.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HiveUsersPage;