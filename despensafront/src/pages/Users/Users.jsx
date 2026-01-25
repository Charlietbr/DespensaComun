import React, { useContext, useEffect, useState } from "react";
import Panel from '../../components/designComponents/Panel/Panel'
import Card from '../../components/designComponents/Card/Card'
import Button from '../../components/designComponents/Button/Button'
import { AuthContext } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import PanelSearchBar from '../../components/designComponents/PanelSearchBar/PanelSearchBar'
import Thumbnail from "../../components/designComponents/Thumbnail/Thumbnail";
import { defaultProfileImage } from "../../config/constants";
import ChatSendMessageButton from '../../components/MainComponents/ChatSendMessageButton/ChatSendMessageButton.jsx';
import FavoriteSetButton from '../../components/MainComponents/FavoriteSetButton/FavoriteSetButton.jsx';



//! Estas variables definen el SETUP DEL PANEL
const currentCategory = "users";
const title = "Usuarios";
const subtitle = "Panel de ADMINISTRADOR";
const info = "Listado de usuarios.";

const Users = () => {
  const { user, fetchUserResource } = useContext(AuthContext);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) return;

    const loadUsers = async () => {
      setLoading(true);
      setError("");

      try {
        const fetchedUsers = await fetchUserResource("/users");

        const safeUsers = Array.isArray(fetchedUsers) ? fetchedUsers : [];

        setUsers(safeUsers);

        console.log("Respuesta /users:", fetchedUsers);
          
      } catch (err) {
        console.error("Error al cargar usuarios:", err);
        setError("No se pudieron cargar los usuarios. Intenta recargar.");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
    
  }, [user, fetchUserResource]);


  if (!user) return <p>Debes iniciar sesión como administrador para ver el listado de usuarios.</p>;
  if (loading) return <p>Cargando usuarios...</p>;
  if (error) return <p>{error}</p>;

  //! NAVEGAR A UserDetail
  const goToUserDetail = (userId) => {
    navigate(`/users/${userId}`);
  };


  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.locationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) return <p>Debes iniciar sesión para ver el listado de usuarios.</p>;
  if (loading) return <p>Cargando usuarios...</p>;
  if (error) return <p>{error}</p>;




return (
    <Panel category={currentCategory} user={user} title={title} subtitle={subtitle} info={info} backButton={true}>
      <header>
            <PanelSearchBar 
              placeholder={`Buscar por nombre, email o lugar...`} 
              emitSearch={(val) => setSearchTerm(val)}
            />
      </header>

      <Card title={`Resultados (${filteredUsers.length})`} category={currentCategory}>
        <ul>
          {filteredUsers.length > 0 ? (filteredUsers.map((u) => (
              <li key={u._id}>
                <Thumbnail size="s" src={u.profileImage?.url || defaultProfileImage} />
                <div>
                  <strong
                    className="line-link"
                    onClick={() => navigate(`/users/${u._id}`)}>
                    {u.name}
                  </strong>
                  <span >
                    {`  ${u.locationName}` || "Sin ubicación"} {u.role === "admin" && " | (Admin)"}
                  </span>
                </div>
                
                  <div className='line-buttons'>
                      <FavoriteSetButton targetId={u._id} targetType="user" />
                      <ChatSendMessageButton entity={u} type="private"/>
                  </div>

              </li>
            ))
          ) : (

            <li>{searchTerm ? "No se han encontrado usuarios con ese criterio." : "No hay usuarios registrados."}</li>
          
          )}
        </ul>
      </Card>
    
    
    </Panel>
  );
};

export default Users;
