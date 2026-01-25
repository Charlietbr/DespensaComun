import React, { useState, useEffect, useContext, useRef } from 'react';
import './ChatContainer.css';
import { AuthContext } from '../../../context/AuthContext';
import { ChatContext } from '../../../context/ChatContext';

const ChatContainer = () => {
  const { user, token, fetchUserResource } = useContext(AuthContext);
  const { activeChat, setActiveChat } = useContext(ChatContext);

  const [userGroups, setUserGroups] = useState([]);
  const [privates, setPrivates] = useState([]); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef(null);

  //* CARGA SIDEBAR
  useEffect(() => {
    const fetchSidebarData = async () => {
      if (!user?._id) return;
      try {
        setLoading(true);
        
        const data = await fetchUserResource(`/conversations/user/${user._id}`);
        
        if (data && typeof data === 'object') {
          setUserGroups(data.groups || []);
          setPrivates(data.privates || []);
        }
      } catch (err) {
        console.error("Error al cargar sidebar:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSidebarData();
  }, [user?._id, fetchUserResource]);

  //* CARGA MENSAJES
  useEffect(() => {
    if (!activeChat?._id) return;

    const loadMessages = async () => {
      try {
        const url = activeChat.type === 'group' 
          ? `/messages/group/${activeChat._id}` 
          : `/messages/conversation/${activeChat._id}`;
          
        const data = await fetchUserResource(url);
       
        setMessages(data || []);
      } catch (err) {
        console.error("Error al cargar mensajes:", err);
        setMessages([]); 
      }
    };
    loadMessages();
  }, [activeChat?._id, fetchUserResource]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //* ENVIAR
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const payload = {
      content: newMessage,
      group: activeChat.type === 'group' ? activeChat._id : null,
      conversation: activeChat.type === 'private' ? activeChat._id : null
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        setMessages(prev => [...prev, result.data]);
        setNewMessage("");
      }
    } catch (err) {
      console.error("Error enviando mensaje:", err);
    }
  };

  return (
    <div className="chat-layout">
      <aside className="chat-sidebar">
        {loading ? <p>Cargando chats...</p> : (
          <>
            <h5>Mis Grupos</h5>
            <ul>
              {userGroups.map(group => (
                <li 
                  key={group._id} 
                  className={activeChat?._id === group._id ? 'active' : ''}
                  onClick={() => setActiveChat({ ...group, type: 'group' })}
                >
                  👥 {group.name}
                </li>
              ))}
            </ul>

            <h5 style={{ marginTop: '20px' }}>Mensajes Directos</h5>
            <ul>
              {Array.isArray(privates) && privates.length > 0 ? (
                privates.map((conv) => {
                
                  const contact = conv.participants?.find(p => p._id !== user?._id);
                  return (
                    <li 
                      key={conv._id} 
                      className={activeChat?._id === conv._id ? 'active' : ''}
                      onClick={() => setActiveChat({ 
                        ...conv, 
                        displayName: contact?.name || "Usuario", 
                        type: 'private' 
                      })}
                    >
                      👤 {contact?.name || "Usuario"}
                    </li>
                  );
                })
              ) : (
                <li className="no-chats">No hay conversaciones</li>
              )}
            </ul>
          </>
        )}
      </aside>

      <main className="chat-main">
        {activeChat ? (
          <>
            <header className="chat-header">
              <h4>{activeChat.type === 'private' ? activeChat.displayName : activeChat.name}</h4>
            </header>

            <div className="messages-container">
              {/* map solo si es array */}
              {Array.isArray(messages) && messages.map((msg) => (
                <div 
                  key={msg._id} 
                  className={`message ${(msg.sender?._id || msg.sender) === user?._id ? 'sent' : 'received'}`}
                >
                  <div className='message-header'>
                    <div>
                      {activeChat.type === 'group' && msg.sender?._id !== user._id && (
                        <span className="sender-name">{msg.sender?.name}</span>
                      )}
                    </div>
                    <span className="message-time">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p>{msg.content}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <footer className="chat-footer">
              <form onSubmit={handleSendMessage}>
                <input 
                  className='write-space'
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                />
                <button className='send-message-button' type="submit">▶︎</button>
              </form>
            </footer>
          </>
        ) : (
          <div className="no-chat">Selecciona una conversación</div>
        )}
      </main>
    </div>
  );
};

export default ChatContainer;