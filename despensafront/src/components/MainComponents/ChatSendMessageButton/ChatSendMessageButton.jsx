import React, { useContext } from 'react';
import { ChatContext } from '../../../context/ChatContext';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './ChatSendMessageButton.css'


          //? <FavoriteSetButton targetId={u._id} targetType="user" /> user, group o product


const ChatSendMessageButton = ({ entity, type }) => {
  const { setActiveChat } = useContext(ChatContext);
  const { fetchUserResource, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { search, pathname } = useLocation();

  const handleOpenChat = async (e) => {
    e.stopPropagation();

    try {
      if (type === 'private') {
        const conversation = await fetchUserResource(`/conversations/with/${entity._id}`, {
          method: 'POST'
        });

        if (conversation) {
          const contact = conversation.participants?.find(p => p._id !== user._id);
          
          setActiveChat({
            ...conversation,
            displayName: contact?.name || entity.name || "Usuario",
            type: 'private'
          });
        }
      } else {
        setActiveChat({
          ...entity,
          type: 'group'
        });
      }

 
      const params = new URLSearchParams(search);
      params.set('showChat', 'true');
      
      navigate({
        pathname: pathname,
        search: params.toString()
      });

      setTimeout(() => {
        document.getElementById('chat-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err) {
      console.error("Error al abrir el chat:", err);
    }
  };

  return (
    <div 
      className={`btn-send-message ${type}`}
      onClick={handleOpenChat}
      title={`Enviar mensaje a ${type === 'group' ? 'el grupo' : 'el usuario'}`}
    >
      {type === 'group' ? '💬' : '✉️'}
    </div>
  );
};

export default ChatSendMessageButton;