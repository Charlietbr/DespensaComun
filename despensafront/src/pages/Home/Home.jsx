import React, { useContext, useState } from 'react'

import './Home.css'

import Card from '../../components/designComponents/Card/Card'
import RegisterForm from '../../components/MainComponents/RegisterForm/RegisterForm'
import LoginForm from '../../components/MainComponents/LoginForm/LoginForm'
import EditUserForm from '../../components/MainComponents/EditUserForm/EditUserForm'
import { AuthContext } from '../../context/AuthContext'
import Button from '../../components/designComponents/Button/Button'
import { homeBgImage } from '../../config/constants'

const Home = (props) => {

  const { user, logout } = useContext(AuthContext);
  const [view, setView] = useState('login');

  return (
    <div className='home-container'>

     

              
      {!user ? (
        <div>
          {view === 'login' ? (
            <>
              <LoginForm />
              <p className="line-link" onClick={() => setView('register')}  style={{textAlign: "center"}}>
                ¿No tienes cuenta? Regístrate aquí</p>
            </>
          ) : (
            <>
              <RegisterForm />
              <p className="line-link" onClick={() => setView('login')} style={{textAlign: "center"}}>
                ¿Ya tienes una cuenta? Inicia sesión
              </p>
            </>
          )}
        </div>
      ) : (
        <EditUserForm />
      )}

            {props.children}
        </div>


  )
}

export default Home
