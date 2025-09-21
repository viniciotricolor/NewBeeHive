"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, RefreshCw } from "lucide-react";
import { showSuccess } from "@/utils/toast";
import { Link } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import SortDropdown from '@/components/SortDropdown';
import StatsCards from '@/components/StatsCards';
import PostGrid from '@/components/PostGrid';
import LoadMoreButton from '@/components/LoadMoreButton';
import EmptyState from '@/components/EmptyState';
import { useHivePosts } from '@/hooks/useHivePosts';
import { useUserFirstPost } from '@/hooks/useUserFirstPost';

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

// Função auxiliar (pode mover para utils.ts depois)
export const processRawPost = useCallback(async (post: any): Promise<Post> => {
  let authorDisplayName = post.author;
  let authorAvatarUrl = `https://images.hive.blog/u/${post.author}/avatar`;

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
    // Fallback já definido
  }

  return {
    title: post.title,
    body: post.body.substring(0, 150) + (post.body.length > 150 ? '...' : ''),
    created: post.created,
    permlink: post.permlink,
    author: post.author,
    url: `https://hive.blog/@${post.author}/${post.permlink}`,
    replies: post.children,
    active_votes: post.active_votes,
    json_metadata: post.json_metadata,
    author_display_name: authorDisplayName,
    author_avatar_url: authorAvatarUrl,
    pending_payout_value: post.pending_payout_value,
  };
}, []);

const HiveUsersPage = () => {
  const postsPerLoad = 12;
  const { lastUpdated } = useHivePosts({ postsPerLoad });
  const { userFirstPost, handleRefresh: refreshUserPost } = useUserFirstPost();
  const { handleRefresh: refreshHivePosts } = useHivePosts({ postsPerLoad });

  const handleOverallRefresh = useCallback(() => {
    if (userFirstPost) {
      refreshUserPost();
    } else {
      refreshHivePosts();
    }
  }, [userFirstPost, refreshUserPost, refreshHivePosts]);

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

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {userFirstPost ? `Primeiro Post de @${userFirstPost.author}` : 'NewBee Hive 🐝 - Explorar Postagens de Introdução na Hive Blockchain'}
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            {userFirstPost ? 'Este é o primeiro post encontrado para o usuário.' : 'Descubra as últimas postagens de introdução na comunidade Hive.'}
          </p>
          {lastUpdated && !userFirstPost && (
            <p className="text-sm text-muted-foreground mb-6">
              Última atualização: {formatDate(lastUpdated)}
            </p>
          )}
          
          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <SearchBar />
            {!userFirstPost && (
              <>
                <SortDropdown />
                <Button onClick={handleOverallRefresh} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <RefreshCw className="h-4 w-4" />
                  Atualizar
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <StatsCards />

        {/* Content */}
        <PostGrid />
        <LoadMoreButton />
        <EmptyState />
      </div>
    </div>
  );
};

export default HiveUsersPage;