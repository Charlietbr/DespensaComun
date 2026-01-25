import React, { useContext, useEffect, useState } from "react";
import Panel from "../../components/designComponents/Panel/Panel";
import Card from "../../components/designComponents/Card/Card";
import Button from "../../components/designComponents/Button/Button";
import { AuthContext } from "../../context/AuthContext";
import Thumbnail from "../../components/designComponents/Thumbnail/Thumbnail";
import { defaultProfileImage } from "../../config/constants";
import ChatSendMessageButton from "../../components/MainComponents/ChatSendMessageButton/ChatSendMessageButton";
import './Transactions.css';

const currentCategory = "transactions";

const Transactions = () => {
  const { user, fetchUserResource } = useContext(AuthContext);
  const [receivedTransactions, setReceivedTransactions] = useState([]);
  const [sentTransactions, setSentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackData, setFeedbackData] = useState({ transactionId: null, rating: 5, comment: "" });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await fetchUserResource(`/transactions/my-transactions`);
      const allTrans = Array.isArray(data) ? data : [];
      const myId = user._id.toString();

      setReceivedTransactions(allTrans.filter(t => (t.receiver?._id || t.receiver)?.toString() === myId));
      setSentTransactions(allTrans.filter(t => (t.initiator?._id || t.initiator)?.toString() === myId));
    } catch (err) {
      console.error("Error cargando transacciones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchTransactions(); }, [user]);

  const handleStatusUpdate = async (id, newStatus) => {
    const res = await fetchUserResource(`/transactions/${id}/status`, {
      method: 'PATCH',
      body: { status: newStatus }
    });
    if (res) fetchTransactions();
  };

  const handleOpenFeedback = (id) => {
    setFeedbackData({ transactionId: id, rating: 5, comment: "" });
    setShowFeedbackForm(true);
  };

  const enviarValoracion = async () => {
    const res = await fetchUserResource(`/transactions/${feedbackData.transactionId}/feedback`, {
      method: 'POST',
      body: { rating: feedbackData.rating, comment: feedbackData.comment }
    });
    if (res) {
      setShowFeedbackForm(false);
      fetchTransactions();
    }
  };

  //* fila de transacción
  const renderTransactionItem = (t, isReceived) => {
    const otherUser = isReceived ? t.initiator : t.receiver;
    const hasReviewed = t.feedback?.some(f => (f.reviewer?._id || f.reviewer) === user._id);
    
    return (
      <li key={t._id}>
        <div style={{display: "flex", alignItems:"center"}}>
          <Thumbnail src={otherUser?.profileImage?.url || defaultProfileImage} size="s" />
          <div className="line-buttons">
            {/* chat dispo si pendiente o aceptado */}
            <ChatSendMessageButton 
              entity={otherUser} 
              type="private" 
              label={`Chat con ${otherUser?.name}`} 
              disabled={t.status === 'rechazado' || t.status === 'cancelado'}
            />
            <p><strong>{isReceived ? otherUser?.name : "Tú"}</strong> {isReceived ? "te pide" : "has pedido"} <strong>{t.offeredProduct?.name}</strong></p>
            </div>
              <p className={`${t.status}`} style={{fontSize:"smaller"}}>{t.status.toUpperCase()}</p>
            <div>
          </div>
        </div>

        <div>
          {/* receptor - acepatar o rechazar*/}
          {isReceived && t.status === 'pendiente' && (
            <div className="line-buttons">
              <Button className="button xs" onClick={() => handleStatusUpdate(t._id, 'aceptado')}>Aceptar</Button>
              <Button className="button xs exit" onClick={() => handleStatusUpdate(t._id, 'rechazado')}>Rechazar</Button>
            </div>
          )}


          {/* estado entrega si trato aceptado */}
          {isReceived && t.status === 'aceptado' && (
            <div className="line-buttons" style={{display:"flex", flexWrap:"wrap"}}>
              <span>¿Entregado?</span>
              <Button className="button xs" onClick={() => handleStatusUpdate(t._id, 'concluido')}>Sí, entregado</Button>
              <Button className="button xs exit" onClick={() => handleStatusUpdate(t._id, 'cancelado')}>No, cancelar</Button>
            </div>
          )}

          {/* valorar si ha acabado */}
          {(t.status === 'concluido' || t.status === 'cancelado') && (
            <div className="line-buttons">
              {!hasReviewed ? (
                <Button className="button xs" onClick={() => handleOpenFeedback(t._id)}>Valorar experiencia</Button>
              ) : (
                <span className="success-text">Valoración enviada</span>
              )}
            </div>
          )}

          {/* anular - solo quien inicia si está pdte */}
          {!isReceived && t.status === 'pendiente' && (
            <div className="line-buttons">
              <Button className="button xs exit" onClick={() => handleStatusUpdate(t._id, 'cancelado')}>Anular petición</Button>

            </div>
          )}
        </div>
      </li>
    );
  };

  if (loading) return <p>Cargando transacciones...</p>;

  return (
    <Panel category={currentCategory} user={user} title="Trueques" subtitle="Sigue el estado de tus intercambios" backButton={true}>
      
      {showFeedbackForm && (
        <div className="backdrop-opinion">
          <div className="form-opinion-flotante">
            <Card category="form" title="Valorar trueque">
              <div className="stars">
                {[1,2,3,4,5].map(s => (
                  <span key={s} onClick={() => setFeedbackData({...feedbackData, rating: s})} style={{color: s <= feedbackData.rating ? '#FFD700' : '#ccc', cursor: 'pointer', fontSize: '2rem'}}>★</span>
                ))}
              </div>
              <textarea className="input-text" placeholder="Tu comentario..." value={feedbackData.comment} onChange={(e) => setFeedbackData({...feedbackData, comment: e.target.value})} />
              <div className="enviopinion">
                <Button className="s" onClick={enviarValoracion}>Enviar</Button>
                <Button className="s exit" onClick={() => setShowFeedbackForm(false)}>Cerrar</Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      <Card title={`Solicitudes para ti (${receivedTransactions.length})`} category="transactions">
        <ul>{receivedTransactions.map(t => renderTransactionItem(t, true))}</ul>
      </Card>

      <Card title={`Tus peticiones enviadas (${sentTransactions.length})`} category="transactions">
        <ul>{sentTransactions.map(t => renderTransactionItem(t, false))}</ul>
      </Card>
    </Panel>
  );
};

export default Transactions;