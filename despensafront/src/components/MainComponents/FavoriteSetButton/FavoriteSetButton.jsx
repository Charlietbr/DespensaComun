import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import './FavoriteSetButton.css';


  //? <ChatSendMessageButton entity={u} type="private"/> private o grupo
                   


const FavoriteSetButton = ({ targetId, targetType }) => {
  const { user, fetchUserResource } = useContext(AuthContext);
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);

  //* check si es favorito
  useEffect(() => {
    if (!user || !targetId) return;

    const checkStatus = async () => {
      if (!user) return;
      try {
        //* endpoint chequear estado GET /api/v1/favorites/check/:targetId
        const data = await fetchUserResource(`/favorites/check/${targetId}`);
        if (data && typeof data.isFavorite !== 'undefined') {
          setIsFav(data.isFavorite);
        }
      } catch (err) {
        console.warn("Estado de favorito no disponible para:", targetId);
      }
    };
    checkStatus();
  }, [targetId, user, fetchUserResource]);

  const toggleFavorite = async (e) => {
    e.stopPropagation(); //* no ir al detalle si está en un card
    if (loading) return;
    setLoading(true);

    try {
      //* POST para crear/  DELETE para eliminar
      //! chequear en backend o hacer endpoint de "toggle"
      const method = isFav ? 'DELETE' : 'POST';
      const endpoint = isFav ? `/favorites/${targetId}` : `/favorites`;
      const body = isFav ? null : { targetId, targetType };

      await fetchUserResource(endpoint, {
        method,
        body
      });

      setIsFav(!isFav);
    } catch (err) {
      console.error("Error al actualizar favorito:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`heart btn-fav ${isFav ? 'active' : ''}`} onClick={toggleFavorite} disabled={loading}>
      {isFav ? '♥️' : '🤍'}
    </div>
  );
};

export default FavoriteSetButton;