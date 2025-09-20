"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, ExternalLink, Calendar, MessageSquare, ThumbsUp } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

const HIVE_API_NODE = 'https://api.deathwing.me'; // Novo nó da API da Hive

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
}

interface UserProfileData {
  username: string;
  display_name: string;
  avatar_url: string;
  about: string;
  posts: Post[];
}

const UserProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfileAndPosts = useCallback(async () => {
    if (!username) return;

    setLoading(true);
    try {
      // Fetch user account details for display name and avatar
      const accountResponse = await fetch(HIVE_API_NODE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'condenser_api.get_accounts',
          params: [[username]],
          id: 1,
        }),
      });

      if (!accountResponse.ok) throw new Error(`HTTP error! status: ${accountResponse.status}`);
      const accountData = await accountResponse.json();
      if (accountData.error) throw new Error(accountData.error.message);

      let displayName = username;
      let avatarUrl = "https://via.placeholder.com/150";
      let about = "";

      if (accountData.result && accountData.result.length > 0) {
        const account = accountData.result[0];
        try {
          const metadata = JSON.parse(account.json_metadata);
          if (metadata && metadata.profile) {
            if (metadata.profile.name) displayName = metadata.profile.name;
            if (metadata.profile.profile_image) avatarUrl = metadata.profile.profile_image;
            if (metadata.profile.about) about = metadata.profile.about;
          }
        } catch (e) {
          console.warn("Could not parse user metadata:", e);
        }
      }

      // Fetch user's blog posts
      const postsResponse = await fetch(HIVE_API_NODE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'condenser_api.get_discussions_by_blog',
          params: [{ tag: username, limit: 20 }], // Fetch up to 20 latest posts from their blog
          id: 2,
        }),
      });

      if (!postsResponse.ok) throw new Error(`HTTP error! status: ${postsResponse.status}`);
      const postsData = await postsResponse.json();
      if (postsData.error) throw new Error(postsData.error.message);

      const userPosts: Post[] = postsData.result.map((post: any) => ({
        title: post.title,
        body: post.body.substring(0, 150) + (post.body.length > 150 ? '...' : ''), // Truncate body
        created: post.created,
        permlink: post.permlink,
        author: post.author,
        url: `https://hive.blog/@${post.author}/${post.permlink}`,
        replies: post.children,
        active_votes: post.active_votes,
        json_metadata: post.json_metadata,
      }));

      setProfile({
        username: username,
        display_name: displayName,
        avatar_url: avatarUrl,
        about: about,
        posts: userPosts,
      });
      showSuccess(`Posts de @${username} carregados com sucesso!`);
    } catch (error: any) { // Explicitly type error as any to access .message
      console.error(`Erro ao buscar perfil e posts de @${username}:`, error);
      showError(`Falha ao carregar perfil e posts de @${username}: ${error.message}.`);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchUserProfileAndPosts();
  }, [fetchUserProfileAndPosts]);

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando perfil de @{username}...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Perfil não encontrado</h1>
        <p className="text-lg text-gray-600 mb-6">Não foi possível carregar o perfil para @{username}.</p>
        <Link to="/hive-users">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Usuários
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/hive-users">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Usuários
            </Button>
          </Link>
          <Card className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
              <AvatarFallback className="text-4xl">{profile.display_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <CardTitle className="text-3xl font-bold text-gray-900">{profile.display_name}</CardTitle>
              <CardDescription className="text-xl text-blue-600 mb-2">@{profile.username}</CardDescription>
              {profile.about && <p className="text-gray-700 mt-2">{profile.about}</p>}
              <Button 
                variant="link" 
                className="p-0 h-auto text-blue-600 hover:text-blue-800 mt-2"
                onClick={() => window.open(`https://hive.blog/@${profile.username}`, '_blank')}
              >
                Ver perfil na Hive <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </Card>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center sm:text-left">Posts de @{profile.username}</h2>

        {profile.posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Nenhum post encontrado para este usuário.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.posts.map((post) => (
              <Card key={post.permlink} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <CardDescription className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" /> {formatDate(post.created)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{post.body}</p>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" /> {post.replies}
                    </div>
                    <div className="flex items-center">
                      <ThumbsUp className="h-4 w-4 mr-1" /> {getVoteWeight(post.active_votes).toFixed(2)}
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => window.open(post.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ler Post Completo
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;