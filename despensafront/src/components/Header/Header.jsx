import React, { useContext, useMemo } from 'react';
import './Header.css';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import ThemeToggleButton from '../designComponents/ThemeToggleButton/ThemeToggleButton';
import Button from '../../components/designComponents/Button/Button';
import { Link, NavLink } from 'react-router-dom';
import { defaultProfileImage } from '../../config/constants';
import ChatButton from '../MainComponents/ChatButton/ChatButton'
import logoPera from '../../assets/img/icons/Favicon_temp.png';
import { useNavigate } from 'react-router-dom';

import whiteLogo from '../../assets/img/photos/logodespensaWhite.webp';
import blueLogo from '../../assets/img/photos/logodespensaBlue.webp';


const Header = () => {
  const { user, logout, profileImage } = useContext(AuthContext);
  const { mode } = useContext(ThemeContext);
  const navigate = useNavigate()


  return (
    <header className={`header ${mode}`}>

        <div className={`logo-container ${mode}`} onClick={() => {navigate("/")}}>
          <img src={logoPera} alt="Logo de Despensa Común"/>
        </div>

        <ul>

            <li>
              <Link to="/">
                <img id='title-container' src={mode === "dark" ? whiteLogo : blueLogo} alt="Título La despensa común" />
              </Link>
            </li>

            <li>
              <div className='userIO' >
                    {user ? (
                      <>
                        <div> 
                          <NavLink to="/OverView">
                              {({isActive}) => isActive ? `${user.name}` : `·· Ver tu tablón ··`}
                          </NavLink>
                        </div>
                      </>
                    ) : (
                      <div> <Link to='/Home'>·· Entrar ··</Link></div>
                    )}
              </div>
            </li>            

        </ul>

        <ChatButton/>

        <div className='theme-button-container'>
            <li>
                <ThemeToggleButton />
            </li>
        </div>

    </header>
  );
};

export default React.memo(Header);
