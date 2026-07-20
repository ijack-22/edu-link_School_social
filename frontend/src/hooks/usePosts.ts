import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../api/client';

export interface Post {
  id: string;
  user: string;
  user_name?: string;
  avatar: string;
  role: string;
  title?: string;
  content: string;
  privacy: string;
  createdAt: string;
  likes: number;
  comments: number;
}

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('social/posts/');
      setPosts((response.data || []).map((post: any) => ({ ...post, user: post.user_name || post.user })));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { posts, loading, error, reload };
};
