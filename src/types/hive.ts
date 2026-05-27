export interface RawHivePost {
  id: number;
  author: string;
  permlink: string;
  title: string;
  body: string;
  created: string;
  children: number;
  active_votes: Array<{ percent: number; voter?: string; rshares?: number }>;
  json_metadata: string;
  pending_payout_value: string;
  total_payout_value: string;
  curator_payout_value: string;
  depth?: number;
  reputation?: number;
}

export interface Post {
  title: string;
  body: string;
  created: string;
  permlink: string;
  author: string;
  url: string;
  replies: number;
  active_votes: Array<{ percent: number; voter?: string; rshares?: number }>;
  json_metadata: string;
  author_display_name?: string;
  author_avatar_url?: string;
  pending_payout_value: string;
  total_payout_value: string;
  curator_payout_value: string;
}
