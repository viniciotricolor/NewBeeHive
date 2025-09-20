"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare, ThumbsUp, ExternalLink, User } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { getContent, getAccounts } from '@/services/hive';
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
  pending_payout_value: string; // Adicionado para exibir o valor da recompensa pendente
}

const PostDetail = () => {
  const { author, permlink } = useParams<{ author: string; permlink: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPostDetail = useCallback(async () => {
    if (!author || !permlink) {
      showError("Autor ou permlink da postagem não fornecidos.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const rawPost = await getContent({ author, permlink });

      if (!rawPost || rawPost.id === 0) { // rawPost.id === 0 usually means post not found
        showError("Postagem não encontrada.");
        setPost(null);
        setLoading(false);
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
        pending_payout_value: rawPost.pending_payout_value, // Mapeando o valor da recompensa pendente
      };

      setPost(processedPost);
      showSuccess("Detalhes da postagem carregados com sucesso!");
    } catch (error: any) {
      console.error("Erro ao buscar detalhes da postagem:", error);
      showError(`Falha ao carregar detalhes da postagem: ${error.message}.`);
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [author, permlink]);

  useEffect(() => {
    fetchPostDetail();
  }, [fetchPostDetail]);

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

  // Removendo a função getVoteWeight, pois não será mais usada para exibir o número de votos.
  // Para exibir o número de votos, usaremos post.active_votes.length.
  // Para exibir o valor da recompensa, usaremos post.pending_payout_value.

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-background p-4 flex justify-center items-center">
        <PostCardSkeleton />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-background p-4 text-center dark:text-gray-300">
        <h2 className="text-2xl font-bold mb-4">Postagem não encontrada</h2>
        <p className="text-lg mb-6">Parece que esta postagem não existe ou foi removida.</p>
        <Button onClick={() => navigate('/')}>Voltar para a Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Button onClick={() => navigate(-1)} className="mb-6 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800">
          Voltar
        </Button>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={post.author_avatar_url} alt={post.author_display_name} />
                <AvatarFallback>{post.author_display_name?.charAt(0) || post.author.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl dark:text-gray-50">{post.title}</CardTitle>
                <CardDescription className="text-md text-blue-600 dark:text-blue-400">
                  Por <Link to={`/users/${post.author}`} className="font-medium hover:underline">@{post.author}</Link>
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
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
                <span className="font-bold text-green-600 dark:text-green-400">{post.pending_payout_value}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 mt-4">
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
                className="flex-1" 
                onClick={() => navigate(`/users/${post.author}`)}
              >
                <User className="h-4 w-4 mr-2" />
                Ver Perfil
              </Button>
              <Button 
                variant="outline"
                className="flex-1" 
                onClick={() => window.open(post.url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver na Hive.blog
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostDetail;