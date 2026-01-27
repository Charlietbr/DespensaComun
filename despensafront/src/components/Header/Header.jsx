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


        <nav className='main-nav'>
            <div className={`logo-container ${mode}`} onClick={() => {navigate("/")}}>
              <img src={logoPera} alt="Logo de Despensa Común"/>
            </div>

            <div className='title-container'>
              <img src={mode === "dark" ? whiteLogo : blueLogo} alt="Título La despensa común" onClick={()=> navigate("/")}/>
            </div>
         
            <div className='theme-button-container'>
                <ThemeToggleButton />
            </div>

        </nav>

        <div className='userIO' >
            {user ? (
               <>
                    <NavLink to="/OverView">
                      {({isActive}) => isActive ? `${user.name}` : `·· Ver tu tablón ··`}
                    </NavLink>
                </>
              ) : (
                <div> <Link to='/Home'>·· Entrar ··</Link></div>
              )}
                </div>
        <ChatButton/>
    </header>
  );
};

export default React.memo(Header);
