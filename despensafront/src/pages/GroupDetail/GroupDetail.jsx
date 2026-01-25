import React, { useContext, useEffect, useState } from "react";
import Panel from "../../components/designComponents/Panel/Panel";
import Card from "../../components/designComponents/Card/Card";
import Button from "../../components/designComponents/Button/Button";
import { AuthContext } from "../../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { defaultGroupImage, defaultProfileImage } from "../../config/constants";
import GroupEditForm from "../../components/MainComponents/GroupEditForm/GroupEditForm";
import Thumbnail from "../../components/designComponents/Thumbnail/Thumbnail";
import FavoriteSetButton from "../../components/MainComponents/FavoriteSetButton/FavoriteSetButton";
import ChatSendMessageButton from "../../components/MainComponents/ChatSendMessageButton/ChatSendMessageButton";
import '../../components/MainComponents/Form.css';


const GroupDetail = () => {
  const { user, fetchUserResource, token } = useContext(AuthContext);
  const { id } = useParams(); //* id del grupo desde la url
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingUserId, setLoadingUserId] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  //* carga grupo seleccionado en Groups.jsx
  const fetchGroup = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchUserResource(`/groups/${id}`);
      if (!data) throw new Error("Grupo no encontrado.");
      setGroup(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al cargar el grupo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchGroup();
  }, [id, user]);

  if (!user) return <p>Debes iniciar sesión para ver el grupo.</p>;
  if (loading) return <p>Cargando grupo...</p>;
  if (error) return <p>{error}</p>;
  if (!group) return <p>No se encontró el grupo.</p>;

  //* permisos
  const isCreator = group.creator?._id?.toString() === user._id?.toString() || group.creator?.toString() === user._id?.toString();
  const isAdmin = user.isAdmin;
  const canEdit = isCreator || isAdmin;

  const isMember = group.members?.some(
    (m) => ((m.user._id ? m.user._id : m.user).toString() === user._id.toString())
  );
  const hasRequested = group.pendingRequests?.some(
    (req) => ((req.user._id ? req.user._id : req.user).toString() === user._id.toString())
  );

  //* funcs API
  const apiCall = async (url, method = "POST") => {
    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error en la operación");
    return data;
  };

  const requestToJoin = async () => {
    try {
      await apiCall(`${API_URL}/groups/${group._id}/request`, "POST");
      alert("Solicitud enviada correctamente.");
      fetchGroup();
    } catch (err) {
      console.error(err);
      alert("Error al enviar la solicitud.");
    }
  };

  const approveRequest = async (userId) => {
    try {
      setLoadingUserId(userId);
      const data = await apiCall(`${API_URL}/groups/${group._id}/approve/${userId}`, "POST");

      //* actualiza en local
      setGroup((prev) => {
        const newGroup = { ...prev };
        newGroup.pendingRequests = newGroup.pendingRequests.filter(
          (r) => r.user._id !== userId
        );
        newGroup.members.push({ user: data.approvedUser });
        return newGroup;
      });
    } catch (err) {
      console.error(err);
      alert("Error al aprobar solicitud.");
    } finally {
      setLoadingUserId(null);
    }
  };

  const rejectRequest = async (userId) => {
    try {
      setLoadingUserId(userId);
      await apiCall(`${API_URL}/groups/${group._id}/reject/${userId}`, "DELETE");

      setGroup((prev) => {
        const newGroup = { ...prev };
        newGroup.pendingRequests = newGroup.pendingRequests.filter(
          (r) => r.user._id !== userId
        );
        return newGroup;
      });
    } catch (err) {
      console.error(err);
      alert("Error al rechazar solicitud.");
    } finally {
      setLoadingUserId(null);
    }
  };

  const removeMember = async (userId) => {
    if (!window.confirm("¿Eliminar miembro del grupo?")) return;
    try {
      await apiCall(`${API_URL}/groups/${group._id}/member/${userId}`, "DELETE");
      fetchGroup();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar miembro.");
    }
  };

  const promoteToModerator = async (userId) => {
    try {
      await apiCall(`${API_URL}/groups/${group._id}/role/${userId}`, "PATCH");
      fetchGroup();
    } catch (err) {
      console.error(err);
      alert("Error al nombrar moderador.");
    }
  };

  const leaveGroup = async () => {
    if (!window.confirm("¿Quieres abandonar el grupo?")) return;
    try {
      await apiCall(`${API_URL}/groups/${group._id}/leave`, "POST");
      alert("Has abandonado el grupo.");
      fetchGroup();
    } catch (err) {
      console.error(err);
      alert("Error al abandonar el grupo.");
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm("¿Eliminar grupo definitivamente?")) return;
    try {
      await apiCall(`${API_URL}/groups/${group._id}`, "DELETE");
      navigate("/groups");
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el grupo.");
    }
  };


  const goToUserDetail = (userId) => {
    navigate(`/users/${userId}`);
  };

  return (


    <Panel
      category="groups"
      user={user}
      title={group.name}
      subtitle={`Creado por ${group.creator.name} en ${group.locationName}. ${group.members.length} miembros (${group.moderators.length} moderadores). ${group.isPrivate ? "Privado" : "Público"}.`}
      info={`${group.description || "Sin descripción"}`}
      backButton={true}
      image={group.image || defaultGroupImage}
      >



      {/* info grupo */}
      <Card title="Información general" category="groups">
        <li className="line-info"><strong>Descripción:</strong> {group.description || "Sin descripción"}</li>
        <li className="line-info"><strong>Ubicación:</strong> {group.locationName || "No especificada"}</li>
        <li className="line-info"><strong>Tipo:</strong> {group.isPrivate ? "Privado" : "Público"}</li>
        <li className="line-info"><strong>Miembros:</strong> {group.members?.length || 0}</li>
        <li className="line-info"><strong>Moderadores:</strong> {group.moderators?.length || 0}</li>
        <li>
          <div className='line-buttons' >
            <FavoriteSetButton targetId={group._id} targetType="group" />
            <ChatSendMessageButton entity={group} type="group"/>
          </div>
        </li>
      </Card>

      {/* miembros */}
      <Card title="Miembros" category="groups">
        <ul>
          {group.members?.length > 0 ? (
            group.members.map((m) => (
              <li key={m.user._id}>
                <Thumbnail size="s" src={m.user.profileImage.url !== "" ? m.user.profileImage.url : defaultProfileImage} alt={"Member Image"}/>
                <strong className="line-link"
                    onClick={() => goToUserDetail(m.user._id)}>
                  {m.user.name}
                  </strong>
                  {m.role}
                {canEdit && m.user._id !== user._id && (
                  <>
                    <Button className="button xs" onClick={() => promoteToModerator(m.user._id)}>Nombrar moderador</Button>
                    <Button className="button xs exit" onClick={() => removeMember(m.user._id)}>Eliminar</Button>
                  </>
                )}
              </li>
            ))
          ) : (
            <li>No hay miembros aún.</li>
          )}
        </ul>
      </Card>



      {/* acciones de grupo */}
      
      <Card title={`Opciones de ${canEdit ? "administrador" : "usuario" }`} category="groups">

        {!isMember && !hasRequested && (
          <Button onClick={requestToJoin} className="button xs" >Solicitar unirse</Button>
        )}

        {!isMember && hasRequested && <p>Solicitud pendiente...</p>}
        {isMember && !canEdit && (
          <Button className="button xs exit" onClick={leaveGroup}>Abandonar grupo</Button>
        )}


        {/* solicitudes pendientes */}
        {group.pendingRequests?.length > 0 && canEdit && (
          <Card title="Solicitudes pendientes" category="groups">
            <ul>
              {group.pendingRequests.map((req) => (
                <li className="line-info" key={req.user._id}>
                  <Thumbnail size="s" src={req.user.profileImage.url || defaultGroupImage} alt={req.user.name}/>

                  <p>{req.user.name} - {req.user.location}</p>
                  <Button
                    className="button xs"
                    onClick={() => approveRequest(req.user._id)}
                    disabled={loadingUserId === req.user._id}
                    >
                    Aceptar
                  </Button>
                  <Button
                    className="button xs exit"
                    onClick={() => rejectRequest(req.user._id)}
                    disabled={loadingUserId === req.user._id}
                    >
                    Rechazar
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {canEdit && (
          <Card title="Opciones del grupo" category="groups">
            <Button className="button xs" onClick={() => setShowEditForm(prev => !prev)}>
                {showEditForm ? "Cancelar" : "Editar grupo"}
            </Button>
              {showEditForm && (
                <GroupEditForm
                  group={group}
                  onUpdated={() => {
                    fetchGroup();   
                    setShowEditForm(false);
                  }}
                />
              )}
            
              {/* {isCreator && <Button className="button xs exit" onClick={handleDeleteGroup}>Eliminar grupo</Button>} */}
          </Card>)}

      </Card>

    </Panel>



  );
};

export default GroupDetail;
