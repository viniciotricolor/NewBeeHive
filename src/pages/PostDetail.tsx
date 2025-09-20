"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, ExternalLink, Calendar, MessageSquare, ThumbsUp, User } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { getContent, getAccounts } from '@/services/hive';
import PostCardSkeleton from '@/components/PostCardSkeleton'; // Reusing for loading state
import ReactMarkdown from 'react-markdown'; // Importar ReactMarkdown
import remarkGfm from 'remark-gfm'; // Importar remark-gfm para suporte a GitHub Flavored Markdown

interface PostDetailData {
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

const PostDetailPage = () => {
  const { author, permlink } = useParams<{ author: string; permlink: string }>();
  const [post, setPost] = useState<PostDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPostDetail = useCallback(async () => {
    if (!author || !permlink) return;

    setLoading(true);
    try {
      const rawPost = await getContent({ author, permlink });

      if (!rawPost || !rawPost.author) {
        throw new Error("Postagem não encontrada.");
      }

      let authorDisplayName = rawPost.author;
      let authorAvatarUrl = `https://images.hive.blog/u/${rawPost.author}/avatar`;

      // Fetch author's metadata for display name and avatar
      try {
        const accountData = await getAccounts({ names: [rawPost.author] });
        if (accountData && accountData.length > 0) {
          const account = accountData[0];
          const metadata = JSON.parse(account.json_metadata);
          if (metadata && metadata.profile) {
            if (metadata.profile.name) authorDisplayName = metadata.profile.name;
            if (metadata.profile.profile_image) authorAvatarUrl = metadata.profile.profile_image;
          }
        }
      } catch (e) {
        console.warn("Could not fetch author metadata for post:", e);
      }

      setPost({
        title: rawPost.title,
        body: rawPost.body, // Full body here
        created: rawPost.created,
        permlink: rawPost.permlink,
        author: rawPost.author,
        url: `https://hive.blog/@${rawPost.author}/${rawPost.permlink}`,
        replies: rawPost.children,
        active_votes: rawPost.active_votes,
        json_metadata: rawPost.json_metadata,
        author_display_name: authorDisplayName,
        author_avatar_url: authorAvatarUrl,
      });
      showSuccess("Postagem carregada com sucesso!");
    } catch (error: any) {
      console.error(`Erro ao buscar postagem ${author}/${permlink}:`, error);
      showError(`Falha ao carregar postagem: ${error.message}.`);
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [author, permlink]);

  useEffect(() => {
    fetchPostDetail();
  }, [fetchPostDetail]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-background p-4 flex items-center justify-center">
        <div className="max-w-3xl mx-auto w-full">
          <Link to="/hive-users">
            <Button variant="outline" className="mb-4 dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Postagens
            </Button>
          </Link>
          <PostCardSkeleton /> {/* Reusing post card skeleton for loading */}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-background p-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">Postagem não encontrada</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">Não foi possível carregar a postagem.</p>
        <Link to="/hive-users">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Postagens
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-background p-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link to="/hive-users">
            <Button variant="outline" className="mb-4 dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Postagens
            </Button>
          </Link>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.author_avatar_url} alt={post.author_display_name} />
                  <AvatarFallback>{post.author_display_name?.charAt(0) || post.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl font-bold dark:text-gray-50">{post.title}</CardTitle>
                  <CardDescription className="text-md text-blue-600 dark:text-blue-400">
                    Por <Link to={`/users/${post.author}`} className="font-medium hover:underline">@{post.author_display_name || post.author}</Link>
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" /> {formatDate(post.created)}
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" /> {post.replies} Comentários
                </div>
                <div className="flex items-center">
                  <ThumbsUp className="h-4 w-4 mr-1" /> {getVoteWeight(post.active_votes).toFixed(2)} Votos
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 mb-6">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ node, ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} />
                  }}
                >
                  {post.body}
                </ReactMarkdown>
              </div>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800" 
                onClick={() => window.open(post.url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver na Hive.blog
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;