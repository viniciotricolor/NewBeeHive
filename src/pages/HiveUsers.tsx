"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Search, User, ExternalLink, RefreshCw, MessageSquare, ThumbsUp } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { useNavigate } from 'react-router-dom';

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
  author_display_name?: string; // Optional, will try to fetch from metadata
  author_avatar_url?: string; // Optional, will try to fetch from metadata
}

const HiveUsersPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 12;
  const navigate = useNavigate();

  const fetchHivePosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.hive.blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'condenser_api.get_discussions_by_created',
          params: [{
            tag: 'introduceyourself',
            limit: 50 // Buscar os 50 posts mais recentes com a tag
          }],
          id: 1,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }

      const rawPosts = data.result;
      const processedPosts: Post[] = await Promise.all(rawPosts.map(async (post: any) => {
        let authorDisplayName = post.author;
        let authorAvatarUrl = "https://via.placeholder.com/150"; // Default placeholder

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
          // Metadata might be malformed or missing, use defaults
        }

        return {
          title: post.title,
          body: post.body.substring(0, 150) + (post.body.length > 150 ? '...' : ''), // Truncate body
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

      setPosts(processedPosts);
      showSuccess("Postagens da Hive carregadas com sucesso!");
    } catch (error) {
      console.error("Erro ao buscar postagens da Hive:", error);
      showError("Falha ao carregar postagens da Hive. Tente novamente mais tarde.");
      setPosts([]); // Clear posts on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHivePosts();
  }, [fetchHivePosts]);

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.author_display_name && post.author_display_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleRefresh = () => {
    showSuccess("Atualizando lista de postagens...");
    fetchHivePosts();
  };

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando postagens da Hive...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Postagens #introduceyourself na Hive Blockchain
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Descubra as últimas postagens de introdução na comunidade Hive.
          </p>
          
          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar por título ou autor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleRefresh} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
                  <p className="text-sm text-gray-600">Postagens encontradas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{filteredPosts.length}</p>
                  <p className="text-sm text-gray-600">Postagens filtradas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ExternalLink className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{new Set(posts.map(p => p.author)).size}</p>
                  <p className="text-sm text-gray-600">Autores únicos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentPosts.map((post) => (
            <Card key={post.permlink} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.author_avatar_url} alt={post.author_display_name} />
                    <AvatarFallback>{post.author_display_name?.charAt(0) || post.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                    <CardDescription className="text-sm text-blue-600">
                      Por <span className="font-medium">@{post.author}</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm mb-3">{post.body}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
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
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    #introduceyourself
                  </Badge>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => navigate(`/users/${post.author}`)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Ver Perfil do Autor
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {filteredPosts.length > postsPerPage && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              {Array.from({ length: Math.ceil(filteredPosts.length / postsPerPage) }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => paginate(page)}
                  className="w-10 h-10"
                >
                  {page}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma postagem encontrada</h3>
            <p className="text-gray-600">Tente ajustar sua busca ou atualizar a lista.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HiveUsersPage;