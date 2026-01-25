import React, { useContext } from 'react'
import { useState } from 'react'
import '../Form.css'
import { AuthContext } from '../../../context/AuthContext.jsx';
import Button from '../../designComponents/Button/Button.jsx';
import Card from '../../designComponents/Card/Card.jsx';


const LoginForm = () => {

  const{ login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  
  const API_URL = import.meta.env.VITE_API_URL;

  const loginSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password})
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token);
        setMessage(`Bienvenido, ${data.user.name}.`);
        
        //! GUARDAR TOKEN e info de usuario para el contexto *******
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

      } else {
        setMessage('Error de autenticación.');
      };

    } catch (error) {
      console.error('Fallo en la solicitud: ', error);
      setMessage('Error de autenticación...');
    }
  };

  return (

        <Card title="Acceder" category="form">
            <form onSubmit={loginSubmit}>

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
                <Button className='btn m' type="submit" >
                  Entrar
                </Button>
              {message && <p>{message}</p>}
            </form>
        </Card>
  );
};


export default LoginForm
