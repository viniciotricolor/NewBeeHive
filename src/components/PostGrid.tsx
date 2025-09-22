import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MessageSquare, ThumbsUp, ExternalLink, User } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import PostCardSkeleton from '@/components/PostCardSkeleton';
import { useUserFirstPost } from '@/hooks/useUserFirstPost';
import { useHivePosts } from '@/hooks/useHivePosts';

interface Post {
  title: string;
  body: string;
  created: string;
  permlink: string;
  author: string;
  author_display_name?: string;
  author_avatar_url?: string;
  replies: number;
  active_votes: Array<{ percent: number }>;
  pending_payout_value: string;
  url: string;
}

const PostGrid = () => {
  const { posts: hivePosts, loading: loadingHive } = useHivePosts({ postsPerLoad: 12 });
  const { userFirstPost, loadingUserFirstPost } = useUserFirstPost();

  const postsToDisplay: Post[] = userFirstPost ? [userFirstPost] : hivePosts;
  const isLoadingContent = loadingUserFirstPost || (loadingHive && hivePosts.length === 0);
  const postsPerLoad = 12;

  const navigate = useNavigate();

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

  const truncateBody = (body: string, maxLength: number = 250) => {
    if (body.length <= maxLength) {
      return body;
    }
    // Tenta cortar em uma quebra de linha ou espaço para evitar cortar palavras no meio
    let truncated = body.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > -1) {
      truncated = truncated.substring(0, lastSpace);
    }
    return truncated + '...';
  };

  if (isLoadingContent) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: userFirstPost ? 1 : postsPerLoad }).map((_, i) => <PostCardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {postsToDisplay.map((post) => {
        const truncatedBody = truncateBody(post.body);
        const isTruncated = post.body.length > truncatedBody.length;

        return (
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
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    a: ({ node, ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} />
                  }}
                >
                  {truncatedBody}
                </ReactMarkdown>
                {isTruncated && (
                  <Link to={`/post/${post.author}/${post.permlink}`} className="text-primary hover:underline text-sm mt-2 block">
                    Ler Mais
                  </Link>
                )}
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
              {!userFirstPost && (
                <div className="pt-2 mb-4">
                  <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                    #introduceyourself
                  </Badge>
                </div>
              )}
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
        );
      })}
    </div>
  );
};

export default PostGrid;