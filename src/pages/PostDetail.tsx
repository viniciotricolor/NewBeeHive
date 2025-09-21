"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare, ThumbsUp, ExternalLink, User, RefreshCw } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { getContent, getAccounts, getPostComments, formatReputation } from '@/services/hive';
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
  image_urls?: string[]; // Nova propriedade para múltiplas imagens do post
}

interface Comment {
  id: number;
  author: string;
  permlink: string;
  body: string;
  created: string;
  replies: number;
  active_votes: Array<{ percent: number }>;
  json_metadata: string;
  author_display_name?: string;
  author_avatar_url?: string;
  pending_payout_value: string;
  depth: number;
  author_reputation?: number;
  raw_author_reputation?: number;
  image_urls?: string[]; // Nova propriedade para imagens em comentários
}

const PostDetail = () => {
  const { author, permlink } = useParams<{ author: string; permlink: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);

  const extractImagesFromMetadata = (jsonMetadata: string): string[] => {
    try {
      const metadata = JSON.parse(jsonMetadata);
      if (metadata && metadata.image && Array.isArray(metadata.image)) {
        return metadata.image.filter(img => img && typeof img === 'string');
      }
    } catch (e) {
      console.warn('Erro ao extrair imagens do metadata:', e);
    }
    return [];
  };

  const processRawComment = async (comment: any, authorReputationMap: Map<string, { formatted: number, raw: number }>): Promise<Comment> => {
    let authorDisplayName = comment.author;
    let authorAvatarUrl = `https://images.hive.blog/u/${comment.author}/avatar`;
    const imageUrls = extractImagesFromMetadata(comment.json_metadata);

    try {
      const metadata = JSON.parse(comment.json_metadata);
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

    const reputationInfo = authorReputationMap.get(comment.author);

    return {
      id: comment.id,
      author: comment.author,
      permlink: comment.permlink,
      body: comment.body,
      created: comment.created,
      replies: comment.children,
      active_votes: comment.active_votes,
      json_metadata: comment.json_metadata,
      author_display_name: authorDisplayName,
      author_avatar_url: authorAvatarUrl,
      pending_payout_value: comment.pending_payout_value,
      depth: comment.depth,
      author_reputation: reputationInfo?.formatted,
      raw_author_reputation: reputationInfo?.raw,
      image_urls: imageUrls,
    };
  };

  const fetchPostDetail = useCallback(async () => {
    if (!author || !permlink) {
      showError("Autor ou permlink da postagem não fornecidos.");
      setLoadingPost(false);
      return;
    }

    setLoadingPost(true);
    try {
      const rawPost = await getContent({ author, permlink });

      if (!rawPost || rawPost.id === 0) {
        showError("Postagem não encontrada.");
        setPost(null);
        setLoadingPost(false);
        return;
      }

      let authorDisplayName = rawPost.author;
      let authorAvatarUrl = `https://images.hive.blog/u/${rawPost.author}/avatar`;
      const imageUrls = extractImagesFromMetadata(rawPost.json_metadata);

      try {
        const metadata = JSON.parse(rawPost.json_metadata);
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

      const processedPost: Post = {
        title: rawPost.title,
        body: rawPost.body,
        created: rawPost.created,
        permlink: rawPost.permlink,
        author: rawPost.author,
        url: `https://hive.blog/@${rawPost.author}/${rawPost.permlink}`,
        replies: rawPost.children,
        active_votes: rawPost.active_votes,
        json_metadata: rawPost.json_metadata,
        author_display_name: authorDisplayName,
        author_avatar_url: authorAvatarUrl,
        pending_payout_value: rawPost.pending_payout_value,
        image_urls: imageUrls,
      };

      setPost(processedPost);
      showSuccess("Detalhes da postagem carregados com sucesso!");
    } catch (error: any) {
      console.error("Erro ao buscar detalhes da postagem:", error);
      showError(`Falha ao carregar detalhes da postagem: ${error.message}.`);
      setPost(null);
    } finally {
      setLoadingPost(false);
    }
  }, [author, permlink]);

  const fetchComments = useCallback(async () => {
    if (!author || !permlink) {
      setLoadingComments(false);
      return;
    }

    setLoadingComments(true);
    try {
      const rawComments = await getPostComments({ author, permlink });

      const uniqueAuthors: string[] = Array.from(new Set(rawComments.map(comment => comment.author)));

      const accountsData = await getAccounts({ names: uniqueAuthors });
      const authorReputationMap = new Map<string, { formatted: number, raw: number }>();
      accountsData.forEach((account: any) => {
        authorReputationMap.set(account.name, {
          formatted: formatReputation(account.reputation),
          raw: account.reputation,
        });
      });

      const processedComments = await Promise.all(
        rawComments.map(comment => processRawComment(comment, authorReputationMap))
      );

      const filteredComments = processedComments.filter(
        comment => (comment.raw_author_reputation ?? 0) >= 0
      );

      setComments(filteredComments);
    } catch (error: any) {
      console.error("Erro ao buscar comentários:", error);
      showError(`Falha ao carregar comentários: ${error.message}.`);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, [author, permlink]);

  useEffect(() => {
    fetchPostDetail();
    fetchComments();
  }, [fetchPostDetail, fetchComments]);

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

  if (loadingPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-4 flex justify-center items-center">
        <PostCardSkeleton />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-4 text-center text-muted-foreground">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Postagem não encontrada</h2>
        <p className="text-lg mb-6">Parece que esta postagem não existe ou foi removida.</p>
        <Button onClick={() => navigate('/')} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">Voltar para a Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="max-w-4xl mx-auto">
        <Button onClick={() => navigate(-1)} className="mb-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
          Voltar
        </Button>

        <Card className="bg-gradient-to-br from-card to-card/80 border-border rounded-xl shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                <AvatarImage src={post.author_avatar_url} alt={post.author_display_name} />
                <AvatarFallback className="bg-primary text-primary-foreground">{post.author_display_name?.charAt(0) || post.author.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl text-card-foreground font-bold bg-gradient-to-r from-primary to-destructive bg-clip-text text-transparent">{post.title}</CardTitle>
                <CardDescription className="text-md text-primary">
                  Por <Link to={`/users/${post.author}`} className="font-medium hover:underline">@{post.author}</Link>
                </CardDescription>
              </div>
            </div>
            {/* Imagens do post */}
            {post.image_urls && post.image_urls.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {post.image_urls.slice(0, 4).map((img, index) => (
                  <img 
                    key={index} 
                    src={img} 
                    alt={`Imagem ${index + 1} do post`}
                    className="w-full h-48 object-cover rounded-lg shadow-md"
                  />
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" /> {formatDate(post.created)}
              </div>
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" /> {post.replies} Comentários
              </div>
              <div className="flex items-center">
                <ThumbsUp className="h-4 w-4 mr-1" /> {post.active_votes.length} Curtidas
              </div>
              <div className="flex items-center">
                <span className="font-bold text-green-600">${post.pending_payout_value.replace(' HBD', '')}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none text-card-foreground mt-4 prose-headings:text-foreground prose-a:text-primary">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ node, ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} className="hover:underline" />,
                  img: ({ node, ...props }) => <img {...props} className="rounded-lg shadow-md max-w-full h-auto" />
                }}
              >
                {post.body}
              </ReactMarkdown>
            </div>
            <div className="mt-6 flex gap-2">
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg" 
                onClick={() => navigate(`/users/${post.author}`)}
              >
                <User className="h-4 w-4 mr-2" />
                Ver Perfil
              </Button>
              <Button 
                variant="outline"
                className="flex-1 bg-card text-card-foreground border-border rounded-lg" 
                onClick={() => window.open(post.url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver na Hive.blog
              </Button>
            </div>

            {/* Seção de Comentários com design aprimorado */}
            <div className="mt-8 pt-8 border-t border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6 bg-gradient-to-r from-primary to-destructive bg-clip-text text-transparent">Comentários ({comments.length})</h2>

              {loadingComments ? (
                <div className="text-center py-8 text-muted-foreground">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p>Carregando comentários...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                  <p className="text-lg">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <Card key={comment.id} className="bg-gradient-to-br from-card to-card/80 border-border shadow-sm rounded-xl">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8 ring-1 ring-primary/20">
                            <AvatarImage src={comment.author_avatar_url} alt={comment.author_display_name} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">{comment.author_display_name?.charAt(0) || comment.author.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-md text-card-foreground font-semibold">{comment.author_display_name || comment.author}</CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                              <Link to={`/users/${comment.author}`} className="font-medium hover:underline text-primary">@{comment.author}</Link> • {formatDate(comment.created)}
                              {comment.author_reputation !== undefined && (
                                <span className="ml-2 text-muted-foreground">({comment.author_reputation})</span>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Imagens do comentário */}
                        {comment.image_urls && comment.image_urls.length > 0 && (
                          <div className="grid grid-cols-1 gap-2 mb-3">
                            {comment.image_urls.slice(0, 2).map((img, index) => (
                              <img 
                                key={index} 
                                src={img} 
                                alt={`Imagem ${index + 1} do comentário`}
                                className="w-full h-32 object-cover rounded-lg shadow-sm"
                              />
                            ))}
                          </div>
                        )}
                        <div className="prose dark:prose-invert max-w-none text-card-foreground text-sm mb-3 prose-a:text-primary">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              a: ({ node, ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} className="hover:underline" />
                            }}
                          >
                            {comment.body}
                          </ReactMarkdown>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <ThumbsUp className="h-3 w-3 mr-1" /> {comment.active_votes.length} Curtidas
                          </div>
                          <div className="flex items-center">
                            <span className="font-bold text-green-600">${comment.pending_payout_value.replace(' HBD', '')}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostDetail;