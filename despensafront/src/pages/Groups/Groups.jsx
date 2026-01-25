import React, { useContext, useEffect, useState } from "react";
import Panel from "../../components/designComponents/Panel/Panel";
import Card from "../../components/designComponents/Card/Card";
import Button from "../../components/designComponents/Button/Button";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import GroupCreateForm from "../../components/MainComponents/GroupCreateForm/GroupCreateForm";
import PanelSearchBar from "../../components/designComponents/PanelSearchBar/PanelSearchBar";


//! Estas variables definen el SETUP DEL PANEL
const currentCategory = "groups";
const title = "Grupos";
const subtitle = "Accede a tus grupos y descubre otros nuevos...";
const info = "";

const Groups = () => {
    const { user, fetchUserResource } = useContext(AuthContext);
    const navigate = useNavigate();

    const [userGroups, setUserGroups] = useState([]);
    const [otherGroups, setOtherGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");
    const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchGroups = async () => {
      setLoading(true);
      setError("");

      try {
        const [fetchedUserGroups, fetchedAllGroups] = await Promise.all([
          fetchUserResource(`/groups/user/${user._id}`),
          fetchUserResource(`/groups`),
        ]);

        const safeUserGroups = Array.isArray(fetchedUserGroups) ? fetchedUserGroups : [];
        const safeAllGroups = Array.isArray(fetchedAllGroups) ? fetchedAllGroups : [];

        setUserGroups(safeUserGroups);

        const userGroupIds = new Set(safeUserGroups.map((g) => g._id.toString()));

        const others = safeAllGroups.filter((g) => {
          if (userGroupIds.has(g._id.toString())) return false;
          if (!g.members || g.members.length === 0) return true;
          return !g.members.some((m) => {
            const memberId = m.user?._id ? m.user._id : m.user;
            return memberId.toString() === user._id.toString();
          });
        });

        setOtherGroups(others);
      } catch (err) {
        console.error("Error al cargar grupos:", err);
        setError("No se pudieron cargar los grupos. Intenta recargar.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user, fetchUserResource]);

  if (!user) return <p>Debes iniciar sesión para ver los grupos.</p>;
  if (loading) return <p>Cargando grupos...</p>;
  if (error) return <p>{error}</p>;

  //! NAVEGAR A DETAILGROUP :)
  const goToGroupDetail = (groupId) => {
    navigate(`/groups/${groupId}`);
  };


  const filteredUserGroups = userGroups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOtherGroups = otherGroups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <>
      <Panel category={currentCategory} user={user} title={title} subtitle={subtitle} info={info} backButton={true}>
        <header>
          <PanelSearchBar 
                placeholder={`buscar en ${title}...`} 
                emitSearch={(value) => setSearchTerm(value)} 
          />
        </header>

        {/* GRUPOS DEL USUARIO */}

        <Card title={`Tus grupos (${filteredUserGroups.length})`} category={currentCategory}>
          <ul>
            {filteredUserGroups.length > 0 ? (filteredUserGroups.map((g) => (

                <li key={g._id}>
                  
                  <strong className="line-link" onClick={() => goToGroupDetail(g._id)}>
                    {`${g.name}: `}
                  </strong>
                  {g.location || "Sin ubicación"} | Miembros: {g.members?.length || 0}
                </li>
              ))
            ) : (
              <li>{searchTerm ? "No hay coincidencias." : "Aún no perteneces a ningún grupo."}</li>
            )}
          </ul>
                <Button className="button xs" onClick={() => setShowEditForm(prev => !prev)}>
                    {showEditForm ? "Cancelar" : "Crear grupo"}
                </Button>

            {/* formulario de creación*/}
            {showEditForm && (
              <GroupCreateForm
                onCreated={() => {
                  fetchGroup();   
                  setShowEditForm(false);
                }}
              />
            )}
        </Card>

        {/* OTROS GRUPOS */}

        <Card title={`Otros grupos (${filteredOtherGroups.length})`} category={currentCategory}>
          <ul>
            {filteredOtherGroups.length > 0 ? (filteredOtherGroups.map((g) => (

                <li key={g._id}>
              
                  <strong className="line-link" onClick={() => goToGroupDetail(g._id)}>
                    {`${g.name}: `}
                  </strong>
                  {g.location || "Sin ubicación"} | Miembros: {g.members?.length || 0}
                </li>
              ))
            ) : (
              <li>{searchTerm ? "No se encontraron grupos con ese nombre." : "No hay otros grupos disponibles."}</li>
            )}
          </ul>
        </Card>
      </Panel>

      

    </>
  );
};

export default Groups;