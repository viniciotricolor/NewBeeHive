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

export const processRawPost = async (post: any): Promise<Post> => {
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
};