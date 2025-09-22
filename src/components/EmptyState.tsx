import React from 'react';
import { User } from "lucide-react";

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

interface EmptyStateProps {
  usernameSearchTerm: string;
  loadingUserFirstPost: boolean;
  userFirstPost: Post | null;
  loadingHive: boolean;
  hivePosts: Post[];
}

const EmptyState = ({ usernameSearchTerm, loadingUserFirstPost, userFirstPost, loadingHive, hivePosts }: EmptyStateProps) => {
  const isEmptyState = (userFirstPost ? 0 : hivePosts.length) === 0 && !loadingUserFirstPost && !loadingHive;
  const isSearchEmpty = isEmptyState && usernameSearchTerm.trim();

  if (!isEmptyState) return null;

  return (
    <div className="text-center py-12 text-muted-foreground">
      <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-foreground mb-2">
        {isSearchEmpty ? `Nenhum post encontrado para "${usernameSearchTerm}"` : 'Nenhuma postagem de introdução encontrada'}
      </h3>
      <p className="text-muted-foreground">
        {isSearchEmpty ? 'Verifique o nome de usuário e tente novamente.' : 'Tente ajustar sua busca ou atualizar a lista.'}
      </p>
    </div>
  );
};

export default EmptyState;