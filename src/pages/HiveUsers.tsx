"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Search, User, ExternalLink, RefreshCw } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { useNavigate } from 'react-router-dom'; // Import useNavigate

interface HiveUser {
  username: string;
  display_name: string;
  avatar_url: string;
  post_count: number; // Mantido simulado por enquanto, pois requer outra chamada de API
  follower_count: number; // Mantido simulado por enquanto, pois requer outra chamada de API
  last_post_date: string;
  post_url: string; // This will now be the introduction post URL
}

const HiveUsersPage = () => {
  const [users, setUsers] = useState<HiveUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 12;
  const navigate = useNavigate(); // Initialize useNavigate

  const fetchHiveUsers = useCallback(async () => {
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
      const uniqueUsers = new Map<string, HiveUser>();

      rawPosts.forEach((post: any) => {
        if (!uniqueUsers.has(post.author)) {
          let displayName = post.author;
          let avatarUrl = "https://via.placeholder.com/150"; // Default placeholder

          try {
            const metadata = JSON.parse(post.json_metadata);
            if (metadata && metadata.profile) {
              if (metadata.profile.name) {
                displayName = metadata.profile.name;
              }
              if (metadata.profile.profile_image) {
                avatarUrl = metadata.profile.profile_image;
              }
            }
          } catch (e) {
            // Metadata might be malformed or missing, use defaults
          }

          uniqueUsers.set(post.author, {
            username: post.author,
            display_name: displayName,
            avatar_url: avatarUrl,
            post_count: Math.floor(Math.random() * 100) + 1, // Simulado
            follower_count: Math.floor(Math.random() * 1000) + 50, // Simulado
            last_post_date: post.created,
            post_url: `https://hive.blog/@${post.author}/${post.permlink}`
          });
        }
      });

      setUsers(Array.from(uniqueUsers.values()));
      showSuccess("Usuários da Hive carregados com sucesso!");
    } catch (error) {
      console.error("Erro ao buscar usuários da Hive:", error);
      showError("Falha ao carregar usuários da Hive. Tente novamente mais tarde.");
      setUsers([]); // Clear users on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHiveUsers();
  }, [fetchHiveUsers]);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleRefresh = () => {
    showSuccess("Atualizando lista de usuários...");
    fetchHiveUsers();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando usuários da Hive...</p>
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
            Novos Usuários Hive Blockchain
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Descubra novos membros da comunidade que usam a tag <Badge className="bg-blue-100 text-blue-800">#introduceyourself</Badge>
          </p>
          
          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar usuários..."
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
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                  <p className="text-sm text-gray-600">Usuários encontrados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{filteredUsers.length}</p>
                  <p className="text-sm text-gray-600">Filtrados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ExternalLink className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{users.length * 2}</p> {/* Ainda simulado */}
                  <p className="text-sm text-gray-600">Posts totais</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentUsers.map((user) => (
            <Card key={user.username} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar_url} alt={user.display_name} />
                    <AvatarFallback>{user.display_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{user.display_name}</CardTitle>
                    <CardDescription className="text-sm text-blue-600">
                      @{user.username}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Posts:</span>
                    <span className="font-medium">{user.post_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Seguidores:</span>
                    <span className="font-medium">{user.follower_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Último post:</span>
                    <span className="font-medium">{formatDate(user.last_post_date)}</span>
                  </div>
                  <div className="pt-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      #introduceyourself
                    </Badge>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    onClick={() => navigate(`/users/${user.username}`)} // Navigate to UserProfile page
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Posts do Usuário
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {filteredUsers.length > usersPerPage && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }, (_, i) => i + 1).map((page) => (
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
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum usuário encontrado</h3>
            <p className="text-gray-600">Tente ajustar sua busca ou atualizar a lista.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HiveUsersPage;