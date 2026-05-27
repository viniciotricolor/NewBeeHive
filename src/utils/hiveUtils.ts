/**
 * Filtra apenas votos positivos (upvotes) de um array de votos
 */
export const getUpvoteCount = (votes: Array<{ percent: number }>): number => {
  return votes.filter(v => v.percent > 0).length;
};

/**
 * Retorna a contagem de downvotes
 */
export const getDownvoteCount = (votes: Array<{ percent: number }>): number => {
  return votes.filter(v => v.percent < 0).length;
};

/**
 * Calcula o payout total estimado de um post:
 * pending_payout_value + total_payout_value (já pago) + curator_payout_value
 */
export const getTotalPayout = (post: {
  pending_payout_value: string;
  total_payout_value: string;
  curator_payout_value: string;
}): number => {
  const parseHbd = (val: string | undefined): number => {
    if (!val) return 0;
    const num = parseFloat(val.replace(' HBD', '').replace(' HIVE', ''));
    return isNaN(num) ? 0 : num;
  };

  return (
    parseHbd(post.pending_payout_value) +
    parseHbd(post.total_payout_value) +
    parseHbd(post.curator_payout_value)
  );
};

/**
 * Formata valor HBD para exibição
 */
export const formatPayout = (value: number): string => {
  if (value === 0) return '$0.00';
  return `$${value.toFixed(2)}`;
};
