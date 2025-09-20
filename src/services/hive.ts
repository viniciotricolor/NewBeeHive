const HIVE_API_NODE = 'https://api.deathwing.me';

interface PostParams {
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
  return callHiveApi('condenser_api.get_discussions_by_created', [params]);
};

export const getDiscussionsByHot = async (params: PostParams) => {
  return callHiveApi('condenser_api.get_discussions_by_hot', [params]);
};

export const getDiscussionsByTrending = async (params: PostParams) => {
  return callHiveApi('condenser_api.get_discussions_by_trending', [params]);
};

export const getDiscussionsByBlog = async (params: PostParams) => {
  return callHiveApi('condenser_api.get_discussions_by_blog', [params]);
};

export const getAccounts = async (params: AccountParams) => {
  return callHiveApi('condenser_api.get_accounts', [params.names]);
};

export const getContent = async (params: ContentParams) => {
  return callHiveApi('condenser_api.get_content', [params.author, params.permlink]);
};

// Utility to convert raw reputation to a more readable format
export const formatReputation = (rep: number) => {
  if (rep === 0) return 25;
  const log10 = Math.log10(Math.abs(rep));
  let score = Math.max(log10 - 9, 0);
  score = score * 9 + 25;
  return Math.floor(score);
};