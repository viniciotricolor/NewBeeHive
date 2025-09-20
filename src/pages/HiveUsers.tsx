"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Search, User, ExternalLink } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

interface HiveUser {
  username: string;
  display_name: string;
  avatar_url: string;
  post_count: number;
  follower_count: number;
  last_post_date: string;
  post_url: string;
}

const HiveUsersPage = () => {
  const [users, setUsers] = useState<HiveUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 12;

  // Simulação de dados (em um app real, isso viria de uma API Hive)
  useEffect(() => {
    // Dados simulados para demonstração
    const mockUsers: HiveUser[] = [
      {
        username: "hiveuser123",
        display_name: "João Silva",
        avatar_url: "https://via.placeholder.com/150",
        post_count: 45,
        follower_count: 234,
        last_post_date: "2024-01-15",
        post_url: "https://hive.blog/@hiveuser123/introduceyourself"
      },
      {
        username: "blockchain_dev",
        display_name: "Maria Santos",
        avatar_url: "https://via.placeholder.com/150",
        post_count: 12,
        follower_count: 89,
        last_post_date: "2024-01-14",
        post_url: "https://hive.blog/@blockchain_dev/introduceyourself"
      },
      {
        username: "crypto_enthusiast",
        display_name: "Pedro Oliveira",
        avatar_url: "https://via.placeholder.com/150",
        post_count: 8,
        follower_count: 156,
        last_post_date: "2024-01-13",
        post_url: "https://hive.blog/@crypto_enthusiast/introduceyourself"
      },
      {
        username: "web3_builder",
        display_name: "Ana Costa",
        avatar_url: "https://via.placeholder.com/150",
        post_count: 23,
        follower_count: 412,
        last_post_date: "2024-01-12",
        post_url: "https://hive.blog/@web3_builder/introduceyourself"
      },
      {
        username: "defi_explorer",
        display_name: "Carlos Mendes",
        avatar_url: "https://via.placeholder.com/150",
        post_count: 67,
        follower_count: 789,
        last_post_date: "2024-01-11",
        post_url: "https://hive.blog/@defi_explorer/introduceyourself"
      },
      {
        username: "nft_artist",
        display_name: "Laura Ferreira",
        avatar_url: "https://via.placeholder.com/150",
        post_count: 34,
        follower_count: 567,
        last_post_date: "2024-01-10",
        post_url: "https://hive.blog/@nft_artist/introduceyourself"
      }
    ];

    // Simular carregamento
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1500);
  }, []);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleRefresh = () => {
    setLoading(true);
    showSuccess("Atualizando lista de usuários...");
    
    // Simular refresh
    setTimeout(() => {
      setLoading(false);
      showSuccess("Lista atualizada com sucesso!");
    }, 1000);
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
              <Calendar className="h-4 w-4" />
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
                  <p className="text-2xl font-bold text-gray-900">{users.length * 2}</p>
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
                    onClick={() => window.open(user.post_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Post
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