import React, { useContext, useEffect, useState } from "react";
import Panel from "../../components/designComponents/Panel/Panel";
import Card from "../../components/designComponents/Card/Card";
import { AuthContext } from "../../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { defaultProfileImage } from "../../config/constants";
import UserMap from "../../components/MainComponents/UserMap/UserMap";

import FavoriteSetButton from "../../components/MainComponents/FavoriteSetButton/FavoriteSetButton";
import ChatSendMessageButton from "../../components/MainComponents/ChatSendMessageButton/ChatSendMessageButton";

const UserDetail = () => {
  const { user, fetchUserResource } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [loadedUser, setLoadedUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");



useEffect(() => {
    if (!user) return;

    const loadPageData = async () => {
      setLoading(true);
      setError("");

      try {
        //! usuario y valoraciones a la vez
        const [userData, feedbackData] = await Promise.all([
          fetchUserResource(`/users/${id}`),
          fetchUserResource(`/transactions/user-feedback/${id}`)
        ]);

        if (!userData || userData._id === undefined) {
          throw new Error("Usuario no encontrado");
        }

        setLoadedUser(userData);
        setReviews(feedbackData || []);
      } catch (err) {
        console.error("Error cargando perfil:", err);
        setError(err.message || "Error al cargar los datos del vecino");
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, [id, user, fetchUserResource]);

  if (!user) return <p>Debes iniciar sesión para ver este usuario.</p>;
  if (loading) return <p>Cargando usuario...</p>;
  if (error) return <p>{error}</p>;
  if (!loadedUser) return <p>No se encontró el usuario.</p>;
  
  const profileImageUrl = loadedUser.profileImage?.url || defaultProfileImage;





  return (
    <Panel
      category="users"
      user={user}
      title={loadedUser.name}
      subtitle={user.role === "admin" ? loadedUser.email : ""}
      info={loadedUser.role === "admin" ? "Administrador" : "Usuario"}
      backButton={true}
      image={profileImageUrl}
    >
      <Card title="Información del usuario" category="users" loadedUser={loadedUser}>
        <ul>
          <li className="line-info">
            <strong>Nombre:</strong> {loadedUser.name}
          </li>
          {user.role === "admin" && (
            <>
              <li className="line-info">
                <strong>Email:</strong> {loadedUser.email}
              </li>
              <li className="line-info">
                <strong>Tipo de usuario:</strong> {loadedUser.role}
              </li>
            </>
          )}
          <li className="line-info">
            <strong>Ubicación:</strong> {loadedUser.locationName}
          </li>
          <div className='line-buttons' >
            <FavoriteSetButton targetId={loadedUser._id} targetType="user" />
            <ChatSendMessageButton entity={loadedUser} type="private"/>
          </div>

        </ul>
      </Card>

      <Card title={`⌖ ${loadedUser.locationName}`} category="users" image={profileImageUrl}>
          <UserMap
          lat={loadedUser.locationLat}
          lng={loadedUser.locationLng}
          name={loadedUser.name}
          location={loadedUser.locationName}
          image={profileImageUrl}
          role={loadedUser.role}
        />
      </Card>

      {/* opiniones */}
      <Card title="Opiniones" category="users">
        <ul className="feedback-list" style={{ padding: '0 10px', listStyle: 'none' }}>
          {reviews.length > 0 ? (
            reviews.map((t) => {
            
              const f = t.feedback.find(f => f.reviewer._id !== loadedUser._id);
              
              if (!f) return null;

              return (
                <li key={t._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#FFD700' }}>{"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}</span>
                    <small style={{ color: '#999' }}>{new Date(t.updatedAt).toLocaleDateString()}</small>
                  </div>
                  <p style={{ fontStyle: 'italic', margin: '5px 0' }}>"{f.comment}"</p>
                  <small>— {f.reviewer?.name} ({t.status})</small>
                </li>
              );
            })
          ) : (
            <p style={{ padding: '10px', color: '#999' }}>Este vecino aún no tiene valoraciones.</p>
          )}
        </ul>
      </Card>

    </Panel>
  );
};

export default UserDetail;
