import React from "react";
import "./Panel.css";
import { defaultGroupImage } from "../../../config/constants";
import Button from "../Button/Button";
import { useNavigate } from "react-router-dom";
import Thumbnail from "../Thumbnail/Thumbnail";



const Panel = ({
  category = "",
  user,
  title,
  subtitle,
  image,
  info,
  children,
  backButton = false /* si se incluye true muestra el botón de navegar hacia la página anterior*/
}) => {
  
  const navigate = useNavigate();
  
  if (!user) {
    

    return <p>Debes iniciar sesión para acceder a esta sección.</p>;
  }

  return (
    <div className={`panel ${category}`}>

        {backButton && (
          <div>
            <div className="back-button" onClick={() => navigate(-1)}>
              ←
            </div>
          </div>
        )}
        <header>
            <div>
                <Thumbnail size="m" src={image} alt={title}/>
            </div>


            <div className="panelInfo">
                <div className="panelName" >
                    <h2>{title}</h2>
                    <h5>{subtitle}</h5>
                    <p>{info}</p>
                </div>
            </div>

        </header>

        <section className={`panelList ${category}`}>
          {children}
        </section>

    </div>
  );
};

export default Panel;
