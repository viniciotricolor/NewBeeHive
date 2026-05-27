import { Card, CardContent } from "@/components/ui/card";
import { FileText, Users, ThumbsUp } from "lucide-react";
import { Post } from '@/types/hive';
import { getUpvoteCount, getTotalPayout, formatPayout } from '@/utils/hiveUtils';
import { useT } from '@/i18n/context';

interface StatsCardsProps {
  posts: Post[];
  userFirstPost: Post | null;
}

const StatsCards = ({ posts, userFirstPost }: StatsCardsProps) => {
  const t = useT();
  const postsToDisplay = userFirstPost ? [userFirstPost] : posts;
  const totalPosts = postsToDisplay.length;
  const uniqueAuthors = [...new Set(postsToDisplay.map(p => p.author))].length;
  const totalVotes = postsToDisplay.reduce((sum, p) => sum + getUpvoteCount(p.active_votes), 0);
  const totalPayout = postsToDisplay.reduce((sum, p) => sum + getTotalPayout(p), 0);

  if (postsToDisplay.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <Card className="bg-card text-card-foreground border-border">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-lg font-bold text-foreground">{totalPosts}</p>
            <p className="text-sm text-muted-foreground">{t('stats.posts_loaded')}</p>
          </div>
          <FileText className="h-8 w-8 text-primary" />
        </CardContent>
      </Card>

      <Card className="bg-card text-card-foreground border-border">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-lg font-bold text-foreground">{uniqueAuthors}</p>
            <p className="text-sm text-muted-foreground">{t('stats.unique_authors')}</p>
          </div>
          <Users className="h-8 w-8 text-primary" />
        </CardContent>
      </Card>

      <Card className="bg-card text-card-foreground border-border">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-lg font-bold text-foreground">{totalVotes}</p>
            <p className="text-sm text-muted-foreground">{t('stats.total_votes')} · {formatPayout(totalPayout)}</p>
          </div>
          <ThumbsUp className="h-8 w-8 text-primary" />
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
