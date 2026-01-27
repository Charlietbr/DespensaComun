import React from 'react'
import './App.css'
import Header from './components/Header/Header.jsx'
import MainFrame from './components/MainFrame/MainFrame.jsx'
import Footer from './components/Footer/Footer.jsx'
import { Route, Routes } from 'react-router-dom'
import { ThemeContext } from './context/ThemeContext.jsx'
import { useContext } from 'react'

import Home from './pages/Home/Home.jsx';
import Groups from './pages/Groups/Groups.jsx';
import Products from './pages/Products/Products.jsx';
import ProductDetail from './pages/ProductDetail/ProductDetail.jsx'
import Users from './pages/Users/Users.jsx';
import Favorites from './pages/Favorites/Favorites.jsx';
import Transactions from './pages/Transactions/Transactions.jsx';
import OverView from './pages/OverView/OverView.jsx'
import GroupCreateForm from './components/MainComponents/GroupCreateForm/GroupCreateForm.jsx'
import GroupDetail from './pages/GroupDetail/GroupDetail.jsx'
import UserDetail from './pages/UserDetail/UserDetail.jsx'
import ChatOverlay from './pages/ChatOverlay/ChatOverlay.jsx'
import ChatContainer from './components/MainComponents/ChatContainer/ChatContainer.jsx'
import Welcome from './pages/Welcome/Welcome.jsx'
import NotFound from './pages/NotFound/NotFound.jsx'



function App() {
  
  const { mode } = useContext(ThemeContext);

  return (
    <div className={`App`}>

      <Header/>
      <MainFrame>
        <Routes>
          <Route path="*" element={<NotFound/>} />
        
          {/* Rutas header - PASADAS AL OVERVIEW */}
          <Route path="/" element={<Welcome />} />
          <Route path="/home" element={<Home />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/products" element={<Products />} />

          <Route path="/users" element={<Users />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/overview" element={<OverView />} />

          {/* Panel de grupos */}
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/create" element={<GroupCreateForm />} />
        <Route path="/groups/:id" element={<GroupDetail />} />

          {/* Panel de usuarios */}
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id" element={<UserDetail />} />

          {/* Panel de productos */}
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />

      

        </Routes>

      </MainFrame>

        <ChatOverlay>
          <ChatContainer/>
        </ChatOverlay>

      <Footer/>

    </div>
  )
}

export default App
