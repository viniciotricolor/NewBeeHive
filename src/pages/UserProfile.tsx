"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, ExternalLink, Calendar, MessageSquare, ThumbsUp, Globe, Link as LinkIcon } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { getAccounts, getDiscussionsByBlog, formatReputation } from '@/services/hive';
import ProfileHeaderSkeleton from '@/components/ProfileHeaderSkeleton';
import PostCardSkeleton from '@/components/PostCardSkeleton';
import { Badge } from "@/components/ui/badge"; // Importação adicionada

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
  author_avatar_url?: string;
}

interface UserProfileData {
  username: string;
  display_name: string;
  avatar_url: string;
  about: string;
  reputation: number;
  website?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
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
      const accountData = await getAccounts({ names: [username] });

      let displayName = username;
      let avatarUrl = `https://images.hive.blog/u/${username}/avatar`; // Default fallback
      let about = "";
      let reputation = 25;
      let website: string | undefined;
      let facebook: string | undefined;
      let twitter: string | undefined;
      let instagram: string | undefined;

      if (accountData && accountData.length > 0) {
        const account = accountData[0];
        reputation = formatReputation(account.reputation);
        try {
          const metadata = JSON.parse(account.json_metadata);
          if (metadata && metadata.profile) {
            if (metadata.profile.name) displayName = metadata.profile.name;
            if (metadata.profile.profile_image) avatarUrl = metadata.profile.profile_image;
            if (metadata.profile.about) about = metadata.profile.about;
            if (metadata.profile.website) website = metadata.profile.website;
            if (metadata.profile.facebook) facebook = metadata.profile.facebook;
            if (metadata.profile.twitter) twitter = metadata.profile.twitter;
            if (metadata.profile.instagram) instagram = metadata.profile.instagram;
          }
        } catch (e) {
          console.warn("Could not parse user metadata:", e);
        }
      }

      // Fetch user's blog posts
      const postsData = await getDiscussionsByBlog({ tag: username, limit: 20 });

      const userPosts: Post[] = postsData.map((post: any) => ({
        title: post.title,
        body: post.body.substring(0, 150) + (post.body.length > 150 ? '...' : ''), // Truncate body
        created: post.created,
        permlink: post.permlink,
        author: post.author,
        url: `https://hive.blog/@${post.author}/${post.permlink}`,
        replies: post.children,
        active_votes: post.active_votes,
        json_metadata: post.json_metadata,
        author_avatar_url: avatarUrl, // Usar o avatar do perfil para os posts do próprio usuário
      }));

      setProfile({
        username: username,
        display_name: displayName,
        avatar_url: avatarUrl,
        about: about,
        reputation: reputation,
        website: website,
        facebook: facebook,
        twitter: twitter,
        instagram: instagram,
        posts: userPosts,
      });
      showSuccess(`Posts de @${username} carregados com sucesso!`);
    } catch (error: any) {
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
      <div className="min-h-screen bg-background p-4"> {/* Alterado para bg-background */}
        <div className="max-w-4xl mx-auto">
          <Link to="/hive-users">
            <Button variant="outline" className="mb-4 dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Usuários
            </Button>
          </Link>
          <ProfileHeaderSkeleton />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-6 mt-8 text-center sm:text-left">Posts de @{username}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <PostCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background p-4 text-center"> {/* Alterado para bg-background */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">Perfil não encontrado</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">Não foi possível carregar o perfil para @{username}.</p>
        <Link to="/hive-users">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Usuários
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4"> {/* Alterado para bg-background */}
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/hive-users">
            <Button variant="outline" className="mb-4 dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Usuários
            </Button>
          </Link>
          <Card className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 dark:bg-gray-800 dark:border-gray-700">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
              <AvatarFallback className="text-4xl">{profile.display_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left flex-1">
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-50">{profile.display_name}</CardTitle>
              <CardDescription className="text-xl text-blue-600 dark:text-blue-400 mb-2">@{profile.username}</CardDescription>
              <Badge variant="secondary" className="mb-2 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                Reputação: {profile.reputation}
              </Badge>
              {profile.about && <p className="text-gray-700 dark:text-gray-300 mt-2">{profile.about}</p>}
              <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-2 mt-3">
                {profile.website && (
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-500"
                    onClick={() => window.open(profile.website, '_blank')}
                  >
                    <Globe className="h-4 w-4 mr-1" /> Website
                  </Button>
                )}
                {profile.facebook && (
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-500"
                    onClick={() => window.open(`https://facebook.com/${profile.facebook}`, '_blank')}
                  >
                    <LinkIcon className="h-4 w-4 mr-1" /> Facebook
                  </Button>
                )}
                {profile.twitter && (
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-500"
                    onClick={() => window.open(`https://twitter.com/${profile.twitter}`, '_blank')}
                  >
                    <LinkIcon className="h-4 w-4 mr-1" /> Twitter
                  </Button>
                )}
                {profile.instagram && (
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-500"
                    onClick={() => window.open(`https://instagram.com/${profile.instagram}`, '_blank')}
                  >
                    <LinkIcon className="h-4 w-4 mr-1" /> Instagram
                  </Button>
                )}
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-500"
                  onClick={() => window.open(`https://hive.blog/@${profile.username}`, '_blank')}
                >
                  Ver perfil na Hive <ExternalLink className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-6 text-center sm:text-left">Posts de @{profile.username}</h2>

        {profile.posts.length === 0 ? (
          <div className="text-center py-12 dark:text-gray-300">
            <p className="text-lg text-gray-600 dark:text-gray-300">Nenhum post encontrado para este usuário.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.posts.map((post) => (
              <Card key={post.permlink} className="hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author_avatar_url} alt={post.author} />
                      <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-xl dark:text-gray-50">{post.title}</CardTitle>
                      <CardDescription className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-1" /> {formatDate(post.created)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{post.body}</p>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" /> {post.replies}
                    </div>
                    <div className="flex items-center">
                      <ThumbsUp className="h-4 w-4 mr-1" /> {getVoteWeight(post.active_votes).toFixed(2)}
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800" 
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