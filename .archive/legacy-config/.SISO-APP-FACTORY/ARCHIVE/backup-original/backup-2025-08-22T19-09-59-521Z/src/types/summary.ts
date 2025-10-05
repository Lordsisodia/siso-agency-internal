
// [Analysis] Article summary related types
export interface Summary {
  id: string;
  article_id: string;
  summary: string;
  created_at: string;
}

export interface Views {
  id: string;
  article_id: string;
  count: number;
  created_at: string;
}
