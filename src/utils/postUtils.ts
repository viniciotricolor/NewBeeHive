import { Post } from '@/types/hive';

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
    body: post.body, // Manter o corpo completo para ReactMarkdown
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