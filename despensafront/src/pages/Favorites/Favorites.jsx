import React, { useContext, useEffect, useState } from "react";
import Panel from "../../components/designComponents/Panel/Panel";
import Card from "../../components/designComponents/Card/Card";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import PanelSearchBar from "../../components/designComponents/PanelSearchBar/PanelSearchBar";
import SetFavorite from "../../components/MainComponents/FavoriteSetButton/FavoriteSetButton";
import pera from '../../assets/img/icons/peras/pera_inlove.png'
import Thumbnail from "../../components/designComponents/Thumbnail/Thumbnail";
import { defaultProfileImage } from "../../config/constants";
import ChatSendMessageButton from "../../components/MainComponents/ChatSendMessageButton/ChatSendMessageButton";

const currentCategory = "favorites";
const title = "Tus Favoritos";
const subtitle = "Encuentra aquí todo lo que te ha gustado";
const image = pera;

const Favorites = () => {
  const { user, fetchUserResource } = useContext(AuthContext);
  const navigate = useNavigate();

  const [favs, setFavs] = useState({ products: [], groups: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchFavorites = async () => {
      setLoading(true);
      try {
     
        const data = await fetchUserResource(`/favorites`);
        const organized = {
          products: data.filter(f => f.targetType?.toLowerCase() === 'product' && f.targetId),
          groups: data.filter(f => f.targetType?.toLowerCase() === 'group' && f.targetId),
          users: data.filter(f => f.targetType?.toLowerCase() === 'user' && f.targetId)
        };
        setFavs(organized);
      } catch (err) {
        console.error("Error al cargar favoritos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, fetchUserResource]);


  //! filtrados de lsa búsquedas
  const filterBySearch = (list) => {
    return list.filter(f => 
      f.targetId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.targetId?.locationName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredProducts = filterBySearch(favs.products);
  const filteredGroups = filterBySearch(favs.groups);
  const filteredUsers = filterBySearch(favs.users);

  if (loading) return <p>Cargando favoritos...</p>;

return (
    <Panel category={currentCategory} user={user} title={title} subtitle={subtitle} backButton={true} image={image}>
      <header>
        <PanelSearchBar 
          placeholder="Buscar en tus favoritos..." 
          emitSearch={(val) => setSearchTerm(val)} 
        />
      </header>

      {/* PRODUCTOS */}
      <Card title={`Productos (${filteredProducts.length})`} category="products">
        <ul>
          {filteredProducts.length > 0 ? filteredProducts.map((f) => (
            <li key={f._id} >
              <span className="line-link" onClick={() => navigate(`/products/${f.targetId?._id}`)} style={{ cursor: 'pointer' }}>
                📦 {f.targetId?.name}
              </span>
              <div className="line-buttons" >
                <SetFavorite targetId={f.targetId?._id} targetType="Product" />
              </div>
            </li>
          )) : <li>{searchTerm ? "No hay productos que coincidan." : "No tienes productos favoritos."}</li>}
        </ul>
      </Card>

      {/* GRUPOS */}
      <Card title={`Grupos (${filteredGroups.length})`} category="groups">
        <ul>
          {filteredGroups.length > 0 ? filteredGroups.map((f) => (
            <li key={f._id} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="line-link" onClick={() => navigate(`/groups/${f.targetId?._id}`)} style={{ cursor: 'pointer' }}>
                👥 {f.targetId?.name}
              </span>
              <div className="line-buttons" >
                <SetFavorite targetId={f.targetId?._id} targetType="group" />
              </div>
            </li>
          )) : <li>{searchTerm ? "No hay grupos que coincidan." : "No tienes grupos favoritos."}</li>}
        </ul>
      </Card>

      {/* USUARIOS */}
      <Card title={`Usuarios (${filteredUsers.length})`} category="users">
        <ul>
          {filteredUsers.length > 0 ? filteredUsers.map((f) => (
            <li key={f._id}>
              <Thumbnail size="s" src={f.targetId?.profileImage?.url || defaultProfileImage} />
              <strong className="line-link" onClick={() => navigate(`/users/${f.targetId?._id}`)}>
                {f.targetId?.name}: 
              </strong>
              {" "}{f.targetId?.locationName || "Sin ubicación"}
              
              <div className='line-buttons'>
                <SetFavorite 
                  targetId={f.targetId?._id} 
                  targetType="user" 
                  onToggle={(isFav) => {
                    if (!isFav) {
                      setFavs(prev => ({
                        ...prev,
                        users: prev.users.filter(item => item._id !== f._id)
                      }));
                    }
                  }}
                />
                <ChatSendMessageButton entity={f.targetId} type="private"/>
              </div>
            </li>
          )) : <li>{searchTerm ? "No hay usuarios que coincidan." : "No tienes usuarios favoritos."}</li>}
        </ul>
      </Card>
    </Panel>
  );
};

export default Favorites;