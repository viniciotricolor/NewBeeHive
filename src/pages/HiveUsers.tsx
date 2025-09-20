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
import { getDiscussionsByCreated, getDiscussionsByHot, getDiscussionsByTrending, PostParams } from '@/services/hive';
import { useDebounce } from '@/hooks/use-debounce';
import PostCardSkeleton from '@/components/PostCardSkeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

type SortOption = 'created' | 'hot' | 'trending';

const HiveUsersPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [usernameSearchTerm, setUsernameSearchTerm] = useState(''); // Termo de busca para nome de usuário
  const debouncedUsernameSearchTerm = useDebounce(usernameSearchTerm, 500); // Debounce para o termo de busca
  const [sortOption, setSortOption] = useState<SortOption>('created');
  const [hasMore, setHasMore] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const postsPerLoad = 12;
  const API_BATCH_SIZE = 100;
  const navigate = useNavigate();

  // Novo estado para o post de introdução de um usuário específico
  const [userIntroPost, setUserIntroPost] = useState<Post | null>(null);
  const [loadingUserIntroPost, setLoadingUserIntroPost] = useState(false);

  // Função auxiliar para processar um post bruto da API
  const processRawPost = useCallback(async (post: any): Promise<Post> => {
    let authorDisplayName = post.author;
    let authorAvatarUrl = `https://images.hive.blog/u/${post.author}/avatar`;

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
  }, []);

  // Função para buscar o post de introdução de um usuário específico
  const fetchUserIntroPost = useCallback(async (username: string) => {
    if (!username) {
      setUserIntroPost(null);
      return;
    }

    setLoadingUserIntroPost(true);
    setUserIntroPost(null); // Limpa o resultado anterior
    setPosts([]); // Limpa o feed geral ao buscar um usuário específico
    setHasMore(false); // Não há mais para carregar para uma busca única

    try {
      const params: PostParams = {
        tag: 'introduceyourself',
        limit: 1, // Esperamos apenas um post de introdução
        start_author: username,
      };
      
      // Usamos getDiscussionsByCreated para buscar posts por autor e tag
      const rawPosts = await getDiscussionsByCreated(params);

      if (rawPosts && rawPosts.length > 0) {
        // Filtra para garantir que é o post de introdução do autor correto
        const foundPost = rawPosts.find((p: any) => p.author === username && p.permlink.includes('introduceyourself'));
        if (foundPost) {
          const processedPost = await processRawPost(foundPost);
          setUserIntroPost(processedPost);
          showSuccess(`Post de introdução de @${username} encontrado!`);
        } else {
          showError(`Nenhum post de introdução encontrado para @${username}.`);
        }
      } else {
        showError(`Nenhum post de introdução encontrado para @${username}.`);
      }
    } catch (error: any) {
      console.error("Erro ao buscar post de introdução do usuário:", error);
      showError(`Falha ao buscar post de introdução: ${error.message}.`);
    } finally {
      setLoadingUserIntroPost(false);
    }
  }, [processRawPost]);

  // Função para buscar posts do feed geral ou de introdução (hot/trending)
  const fetchHivePosts = useCallback(async (
    isInitialLoad: boolean = true,
    currentSortOption: SortOption = sortOption,
    startAuthor: string = '',
    startPermlink: string = ''
  ) => {
    // Não busca posts gerais se uma busca específica de usuário estiver ativa
    if (userIntroPost || loadingUserIntroPost || usernameSearchTerm.trim()) {
      return;
    }

    if (isInitialLoad) {
      setLoading(true);
      setPosts([]);
      setHasMore(false);
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

      let fetchedPosts: Post[] = [];
      const tagToUse = currentSortOption === 'created' ? '' : 'introduceyourself'; // Tag vazia para feed geral

      if (currentSortOption === 'created') {
        const fetchAllCreatedPostsRecursive = async (
          currentAccumulatedPosts: Post[] = [],
          currentStartAuthor: string = '',
          currentStartPermlink: string = ''
        ): Promise<Post[]> => {
          const params: PostParams = {
            tag: tagToUse,
            limit: API_BATCH_SIZE + 1,
          };

          if (currentStartAuthor && currentStartPermlink) {
            params.start_author = currentStartAuthor;
            params.start_permlink = currentStartPermlink;
          }

          const rawPostsBatch = await discussionMethod(params);

          if (!rawPostsBatch || rawPostsBatch.length === 0) {
            return currentAccumulatedPosts;
          }

          const postsToProcess = (currentStartAuthor && currentStartPermlink) ? rawPostsBatch.slice(1) : rawPostsBatch;

          if (postsToProcess.length === 0) {
            return currentAccumulatedPosts;
          }

          let postsForThisBatch: Post[] = [];
          let lastValidPostInBatch: any | null = null;

          for (const post of postsToProcess) {
            postsForThisBatch.push(await processRawPost(post));
            lastValidPostInBatch = post;
          }

          const newAccumulatedPosts = [...currentAccumulatedPosts, ...postsForThisBatch];
          return newAccumulatedPosts;
        };

        fetchedPosts = await fetchAllCreatedPostsRecursive();
        setHasMore(false); // Desabilitar 'Carregar Mais' para o feed geral por enquanto
      } else {
        const params: PostParams = {
          tag: tagToUse,
          limit: postsPerLoad + 1
        };

        if (startAuthor && startPermlink) {
          params.start_author = startAuthor;
          params.start_permlink = startPermlink;
        }

        const rawPosts = await discussionMethod(params);
        
        const postsToProcess = (startAuthor && startPermlink) ? rawPosts.slice(1) : rawPosts;

        fetchedPosts = await Promise.all(postsToProcess.map(processRawPost));
        setHasMore(rawPosts.length > postsPerLoad);
      }

      setPosts(prevPosts => isInitialLoad ? fetchedPosts : [...prevPosts, ...fetchedPosts]);

      if (isInitialLoad) {
        showSuccess("Postagens da Hive carregadas com sucesso!");
      }
      setLastUpdated(new Date());

    } catch (error: any) {
      console.error("Erro ao buscar postagens da Hive:", error);
      showError(`Falha ao carregar postagens da Hive: ${error.message}.`);
      setPosts([]);
      setHasMore(false);
      setLastUpdated(null);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setLoadingRefresh(false);
    }
  }, [sortOption, userIntroPost, loadingUserIntroPost, usernameSearchTerm, processRawPost]);

  useEffect(() => {
    // Só busca posts gerais se não houver uma busca específica de usuário ativa
    if (!usernameSearchTerm.trim() && !userIntroPost && !loadingUserIntroPost) {
      fetchHivePosts(true, sortOption);
    }
  }, [sortOption, usernameSearchTerm, userIntroPost, loadingUserIntroPost, fetchHivePosts]);

  // A função filteredPosts não é mais necessária para a busca principal,
  // pois estamos lidando com a busca específica e o feed geral separadamente.
  // No entanto, se o usuário estiver no feed geral e digitar algo no campo de busca,
  // ele ainda pode querer filtrar os posts *já carregados*.
  // Para a nova funcionalidade, o campo de busca aciona uma nova API.
  // Vou remover a filtragem client-side para simplificar, já que a busca agora é via API.

  const handleSearchClick = () => {
    if (usernameSearchTerm.trim()) {
      fetchUserIntroPost(usernameSearchTerm.trim());
    } else {
      setUserIntroPost(null); // Limpa a busca específica se o input estiver vazio
      fetchHivePosts(true, sortOption); // Volta para o feed geral
    }
  };

  const handleRefresh = () => {
    setLoadingRefresh(true);
    showSuccess("Atualizando lista de postagens...");
    if (usernameSearchTerm.trim()) {
      fetchUserIntroPost(usernameSearchTerm.trim());
    } else {
      fetchHivePosts(true, sortOption);
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

  const getSortOptionLabel = (option: SortOption) => {
    switch (option) {
      case 'created': return 'Mais Recentes (Geral)';
      case 'hot': return 'Mais Comentadas';
      case 'trending': return 'Mais Votadas';
      default: return 'Ordenar por';
    }
  };

  // Determina qual lista de posts exibir
  const postsToDisplay = userIntroPost ? [userIntroPost] : posts;
  const isLoadingContent = loadingUserIntroPost || (loading && posts.length === 0);
  const isEmptyState = postsToDisplay.length === 0 && !isLoadingContent;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {userIntroPost ? `Post de Introdução de @${userIntroPost.author}` : (sortOption === 'created' ? 'Explorar Últimas Postagens na Hive Blockchain' : 'Explorar Postagens de Introdução na Hive Blockchain')}
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            {userIntroPost ? 'Este é o post de introdução encontrado para o usuário.' : (sortOption === 'created' ? 'Descubra as postagens mais recentes de toda a comunidade Hive.' : 'Descubra as últimas postagens de introdução na comunidade Hive.')}
          </p>
          {lastUpdated && !userIntroPost && ( // Só mostra a última atualização para o feed geral
            <p className="text-sm text-muted-foreground mb-6">
              Última atualização: {formatDate(lastUpdated)}
            </p>
          )}
          
          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <div className="relative w-full sm:w-96 flex">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar post de introdução por nome de usuário..."
                value={usernameSearchTerm}
                onChange={(e) => setUsernameSearchTerm(e.target.value)}
                className="pl-10 bg-input border-input text-foreground flex-grow"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchClick();
                  }
                }}
              />
              <Button onClick={handleSearchClick} disabled={loadingUserIntroPost} className="ml-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                {loadingUserIntroPost ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
            {/* DropdownMenu e Botão Atualizar são desabilitados se uma busca específica estiver ativa */}
            {!userIntroPost && !loadingUserIntroPost && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 bg-card text-card-foreground border-border">
                      {getSortOptionLabel(sortOption)} <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover text-popover-foreground border-border">
                    <DropdownMenuItem onClick={() => setSortOption('created')} className="hover:bg-accent hover:text-accent-foreground">
                      Mais Recentes (Geral)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption('hot')} className="hover:bg-accent hover:text-accent-foreground">
                      Mais Comentadas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption('trending')} className="hover:bg-accent hover:text-accent-foreground">
                      Mais Votadas
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={handleRefresh} disabled={loadingRefresh} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                  {loadingRefresh ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Atualizar
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats - Escondidos se uma busca específica estiver ativa */}
        {!userIntroPost && !loadingUserIntroPost && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <User className="h-8 w-8 text-primary mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{postsToDisplay.length}</p>
                    <p className="text-sm text-muted-foreground">Postagens carregadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Search className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{postsToDisplay.length}</p>
                    <p className="text-sm text-muted-foreground">Postagens filtradas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <ExternalLink className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{new Set(postsToDisplay.map(p => p.author)).size}</p>
                    <p className="text-sm text-muted-foreground">Autores únicos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingContent ? (
            Array.from({ length: userIntroPost ? 1 : postsPerLoad }).map((_, i) => <PostCardSkeleton key={i} />)
          ) : (
            postsToDisplay.map((post) => (
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
                  <div className="pt-2 mb-4">
                    {userIntroPost || sortOption === 'created' ? (
                      <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                        {userIntroPost ? '#introduceyourself' : 'Geral'}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                        #introduceyourself
                      </Badge>
                    )}
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
        {hasMore && postsToDisplay.length > 0 && sortOption !== 'created' && !userIntroPost && (
          <div className="flex justify-center mt-8">
            <Button onClick={handleLoadMore} disabled={loadingMore} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {loadingMore ? 'Carregando...' : 'Carregar Mais'}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {isEmptyState && !usernameSearchTerm.trim() && ( // Estado vazio para o feed geral
          <div className="text-center py-12 text-muted-foreground">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Nenhuma postagem encontrada</h3>
            <p className="text-muted-foreground">Tente ajustar sua busca ou atualizar a lista.</p>
          </div>
        )}
        {isEmptyState && usernameSearchTerm.trim() && !loadingUserIntroPost && ( // Estado vazio para busca específica
          <div className="text-center py-12 text-muted-foreground">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum post de introdução encontrado para "{usernameSearchTerm}"</h3>
            <p className="text-muted-foreground">Verifique o nome de usuário e tente novamente.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HiveUsersPage;