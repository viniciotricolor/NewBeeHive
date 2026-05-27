import { Card, CardContent } from "@/components/ui/card";
import { FileText, Users, ThumbsUp } from "lucide-react";
import { Post } from '@/types/hive';

interface StatsCardsProps {
  posts: Post[];
  userFirstPost: Post | null;
}

const StatsCards = ({ posts, userFirstPost }: StatsCardsProps) => {
  if (userFirstPost) return null;

  const postsToDisplay = posts;
  const uniqueAuthors = new Set(postsToDisplay.map(p => p.author)).size;
  const totalVotes = postsToDisplay.reduce((sum, p) => sum + p.active_votes.length, 0);
  const totalPayout = postsToDisplay.reduce((sum, p) => {
    const val = parseFloat(p.pending_payout_value?.replace(' HBD', '') || '0');
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <Card className="bg-card border-border">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-full bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{postsToDisplay.length}</p>
            <p className="text-sm text-muted-foreground">Postagens carregadas</p>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-full bg-green-500/10">
            <Users className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{uniqueAuthors}</p>
            <p className="text-sm text-muted-foreground">Autores únicos</p>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-full bg-purple-500/10">
            <ThumbsUp className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{totalVotes}</p>
            <p className="text-sm text-muted-foreground">Votos totais · ${totalPayout.toFixed(2)} HBD</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
