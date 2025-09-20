const HIVE_API_NODE = 'https://api.hive.blog'; // Changed API node to a more common one

export interface PostParams { // Adicionado 'export' aqui
  tag: string;
  limit: number;
  start_author?: string;
  start_permlink?: string;
}

interface AccountParams {
  names: string[];
}

interface ContentParams {
  author: string;
  permlink: string;
}

interface CommentRepliesParams {
  author: string;
  permlink: string;
}

export const callHiveApi = async (method: string, params: any[], id: number = 1) => {
  const response = await fetch(HIVE_API_NODE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: id,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message);
  }
  return data.result;
};

export const getDiscussionsByCreated = async (params: PostParams) => {
  const query: { tag: string; limit: number; start_author?: string; start_permlink?: string } = {
    tag: params.tag,
    limit: params.limit,
    start_author: params.start_author || undefined, // Explicitly undefined if empty
    start_permlink: params.start_permlink || undefined, // Explicitly undefined if empty
  };
  return callHiveApi('condenser_api.get_discussions_by_created', [query]);
};

export const getDiscussionsByHot = async (params: PostParams) => {
  const cleanedParams: { [key: string]: any } = {
    tag: params.tag,
    limit: params.limit,
  };
  if (params.start_author) {
    cleanedParams.start_author = params.start_author;
  }
  if (params.start_permlink) {
    cleanedParams.start_permlink = params.start_permlink;
  }
  return callHiveApi('condenser_api.get_discussions_by_hot', [cleanedParams]);
};

export const getDiscussionsByTrending = async (params: PostParams) => {
  const cleanedParams: { [key: string]: any } = {
    tag: params.tag,
    limit: params.limit,
  };
  if (params.start_author) {
    cleanedParams.start_author = params.start_author;
  }
  if (params.start_permlink) {
    cleanedParams.start_permlink = params.start_permlink;
  }
  return callHiveApi('condenser_api.get_discussions_by_trending', [cleanedParams]);
};

export const getDiscussionsByBlog = async (params: PostParams) => {
  const cleanedParams: { [key: string]: any } = {
    tag: params.tag,
    limit: params.limit,
  };
  if (params.start_author) {
    cleanedParams.start_author = params.start_author;
  }
  if (params.start_permlink) {
    cleanedParams.start_permlink = params.start_permlink;
  }
  return callHiveApi('condenser_api.get_discussions_by_blog', [cleanedParams]);
};

export const getAccounts = async (params: AccountParams) => {
  return callHiveApi('condenser_api.get_accounts', [params.names]);
};

export const getContent = async (params: ContentParams) => {
  return callHiveApi('condenser_api.get_content', [params.author, params.permlink]);
};

export const getPostComments = async (params: CommentRepliesParams) => {
  // get_content_replies takes parent_author and parent_permlink
  return callHiveApi('condenser_api.get_content_replies', [params.author, params.permlink]);
};

// Utility to convert raw reputation to a more readable format
export const formatReputation = (rep: number) => {
  if (rep === 0) return 25;
  const log10 = Math.log10(Math.abs(rep));
  let score = Math.max(log10 - 9, 0);
  score = score * 9 + 25;
  return Math.floor(score);
};