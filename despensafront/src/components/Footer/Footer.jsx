import React from 'react'
import './Footer.css'
import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'



const Footer = () => {

  const {user, setUser} = useContext(AuthContext);

  return (
    <div className='footer'>

      { user ? (
        <p>Has iniciado sesión como { user.role === "admin" ? 'administrador' : "" } : {user.name}.</p> ) : (
          <p>No estás logueado.</p>
        )
        
      }
    </div>
  )
}

export default Footer
