import React, { useContext, useEffect, useState } from 'react'

import './Welcome.css'

import Card from '../../components/designComponents/Card/Card'
import { AuthContext } from '../../context/AuthContext'
// import { homeBgImage } from '../../config/constants'
import welcomeBg from '../../assets/img/photos/welcome_bg.webp';
import WelcomeMap from '../../components/MainComponents/WelcomeMap/WelcomeMap'
import { defaultProfileImage } from '../../config/constants'


//*======SETUP DEL MAPA DE BIENVENIDA=======================================

//por defecto Madrid, de momento
const origin = {mapLat: "40.416775", mapLng: "-3.703790"};

//*=========================================================================


const Welcome = (props) => {

  const { user, fetchUserResource } = useContext(AuthContext);
  const [view, setView] = useState('login');
  const [products, setProducts] = useState([]);
  const [error, setError] = useState();

  const API_URL = import.meta.env.VITE_API_URL;

  const getAllProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/Products/`);
      const data = await response.json();
      // console.log("recibido: ", data);
      setProducts(data || []);
      
    } catch (error) {
      console.log("Error al obtener la lista de productos", error);
      setError("No se han podido cargar los productos");
    }

  };

  useEffect(() => {
    getAllProducts();
  }, []);

  

  return (
    <div className='home-container'>

        <img className='background-image' src={welcomeBg} alt="Imagen de fondo de la pantalla de Login o Sign Up" />

        <div id='welcome-content'>
            <section id='welcome-info'>
              <Card title={`¡Hola de nuevo${user ? `, ${user.name}!` : "!"}`} 
                    style={{backgroundColor: "transparent",
                      color:"var(--light-color)"
                    }}>
           
                { user ? (
                  <>
                    <p>
                      Ve a tu tablón para revisar tus productos e intercambios o busca productos directamente en el mapa.
                    </p>
                    <p>¡Seguro que muy cerca tienes productores y consumidores con los que conectar!</p>
                  </>
                    ) : (
                    <>
                      <p>Accede o crea tu cuenta y empieza a conectar con productores y consumidores de tu zona. </p>
                      <p>¡Hagamos juntos una comunidad sostenible!</p>
                    </>
                    )}


              </Card>
                

            </section>

         
            <section>
              <WelcomeMap
                mapLat={origin.mapLat} 
                mapLng={origin.mapLng}
                products={products}  
                />
            </section>
   

        </div>

    </div>


  )
}

export default Welcome
