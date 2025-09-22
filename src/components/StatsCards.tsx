import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { User, Search as SearchIcon, ExternalLink } from "lucide-react";

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

interface StatsCardsProps {
  posts: Post[];
  userFirstPost: Post | null;
}

const StatsCards = ({ posts, userFirstPost }: StatsCardsProps) => {
  if (userFirstPost) return null; // Esconde stats durante busca de usuário específico

  const postsToDisplay = posts;
  const uniqueAuthors = new Set(postsToDisplay.map(p => p.author)).size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center">
            <User className="h-8 w-8 text-primary mr-3" />
            <div>
              <p className="text-2xl font-bold text-foreground">{postsToDisplay.length}</p>
              <p className="text-sm text-muted-foreground">Postagens carregadas</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center">
            <SearchIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-foreground">{postsToDisplay.length}</p>
              <p className="text-sm text-muted-foreground">Postagens filtradas</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center">
            <ExternalLink className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-foreground">{uniqueAuthors}</p>
              <p className="text-sm text-muted-foreground">Autores únicos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;