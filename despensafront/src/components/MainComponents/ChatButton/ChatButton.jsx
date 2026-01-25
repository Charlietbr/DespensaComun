import React, { useState } from 'react'
import './ChatButton.css'
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';



const ChatButton = () => {

  const [allRead, setAllRead] = useState();
    
  const navigate = useNavigate();
  const location = useLocation();

  const toggleChat = () => {
    const params = new URLSearchParams(location.search);
    if (params.get('showChat')) {
      params.delete('showChat');
    } else {
      params.set('showChat', 'true');
    }
    navigate({search: params.toString()});
  };

  return (

    <div onClick={toggleChat} className={`chat-button-container`} >
      <p>📨</p>
    </div>
  )
}

export default ChatButton
