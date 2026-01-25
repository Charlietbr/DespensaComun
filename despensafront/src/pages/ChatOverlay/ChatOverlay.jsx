
import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import './ChatOverlay.css';



const ChatOverlay = ({ children }) => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const isOpen = params.get('showChat') === 'true';

  if (!isOpen) return null;

  const closeChat = () => {
    const newParams = new URLSearchParams(search);
    newParams.delete('showChat');
    navigate({ search: newParams.toString() });
  };

  return createPortal(
    <div className="chat-backdrop" onClick={closeChat}>
      {/* parar - que el chat no se cierre */}
      <div className="chat-container" onClick={(e) => e.stopPropagation()}>
        <header className="chat-header">
          <h3>Tus Mensajes</h3>
          <div className='close-chat-button' onClick={closeChat}>✕</div>
        </header>
        <div className="chat-content">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ChatOverlay;