import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

export const useLike = (type, entity) => {
  const { user, guestId, token } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (entity) {
      const totalLikes = (entity.likes_users?.length || 0) + (entity.likes_guests?.length || 0);
      setLikeCount(totalLikes);

      let liked = false;
      if (user) {
        liked = entity.likes_users?.some(like => like === user.id);
      } else if (guestId) {
        liked = entity.likes_guests?.includes(guestId);
      }
      setIsLiked(liked);
    }
  }, [entity, user, guestId]);

  const toggleLike = async () => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/api/${type}s/${entity._id}/like`;
    const config = {
      headers: {},
      data: {} // for DELETE requests
    };

    if (user && token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (guestId) {
      config.data.guestId = guestId;
    }

    try {
      let res;
      if (isLiked) {
        // Unlike
        res = await axios.delete(url, config);
        setIsLiked(false);
      } else {
        // Like
        res = await axios.post(url, config.data, config);
        setIsLiked(true);
      }
      
      if (res.data) {
        const totalLikes = (res.data.likes_users?.length || 0) + (res.data.likes_guests?.length || 0);
        setLikeCount(totalLikes);
      }

    } catch (err) {
      console.error(`Failed to ${isLiked ? 'unlike' : 'like'} the ${type}`, err);
    }
  };

  return { isLiked, likeCount, toggleLike };
};