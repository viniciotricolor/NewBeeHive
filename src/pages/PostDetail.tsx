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
}

const PostDetail = () => {
  const { author, permlink } = useParams<{ author: string; permlink: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);

  const processRawComment = async (comment: any, authorReputationMap: Map<string, { formatted: number, raw: number }>): Promise<Comment> => {
    let authorDisplayName = comment.author;
    let authorAvatarUrl = `https://images.hive.blog/u/${comment.author}/avatar`;

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
      <div className="min-h-screen bg-background p-4 flex justify-center items-center">
        <PostCardSkeleton />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background p-4 text-center text-muted-foreground">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Postagem não encontrada</h2>
        <p className="text-lg mb-6">Parece que esta postagem não existe ou foi removida.</p>
        <Button onClick={() => navigate('/')} className="bg-primary hover:bg-primary/90 text-primary-foreground">Voltar para a Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Button onClick={() => navigate(-1)} className="mb-6 bg-primary hover:bg-primary/90 text-primary-foreground">
          Voltar
        </Button>

        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={post.author_avatar_url} alt={post.author_display_name} />
                <AvatarFallback>{post.author_display_name?.charAt(0) || post.author.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl text-card-foreground">{post.title}</CardTitle>
                <CardDescription className="text-md text-primary">
                  Por <Link to={`/users/${post.author}`} className="font-medium hover:underline">@{post.author}</Link>
                </CardDescription>
              </div>
            </div>
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
            <div className="prose dark:prose-invert max-w-none text-card-foreground mt-4">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ node, ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} />
                }}
              >
                {post.body}
              </ReactMarkdown>
            </div>
            <div className="mt-6 flex gap-2">
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
                onClick={() => window.open(post.url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver na Hive.blog
              </Button>
            </div>

            {/* Seção de Comentários */}
            <div className="mt-8 pt-8 border-t border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">Comentários ({comments.length})</h2>

              {loadingComments ? (
                <div className="text-center py-8 text-muted-foreground">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p>Carregando comentários...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <Card key={comment.id} className="bg-card border-border shadow-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.author_avatar_url} alt={comment.author_display_name} />
                            <AvatarFallback>{comment.author_display_name?.charAt(0) || comment.author.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-md text-card-foreground">{comment.author_display_name || comment.author}</CardTitle>
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
                        <div className="prose dark:prose-invert max-w-none text-card-foreground text-sm mb-3">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              a: ({ node, ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} />
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