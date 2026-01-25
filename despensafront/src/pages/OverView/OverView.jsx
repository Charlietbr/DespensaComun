


import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { defaultProfileImage } from '../../config/constants.js';
import { defaultGroupImage } from '../../config/constants.js';
import Button from '../../components/designComponents/Button/Button';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/designComponents/Card/Card.jsx';
import Thumbnail from '../../components/designComponents/Thumbnail/Thumbnail.jsx';
import ChatSendMessageButton from '../../components/MainComponents/ChatSendMessageButton/ChatSendMessageButton.jsx';
import FavoriteSetButton from '../../components/MainComponents/FavoriteSetButton/FavoriteSetButton.jsx';
import './OverView.css'


const OverView = () => {
  const navigate = useNavigate();
  const { user, logout, fetchUserResource } = useContext(AuthContext);

  const [products, setProducts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [messages, setMessages] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  const handleLogout = () => {
    logout();
    navigate("/Home");
  };

  const memoizedProducts = useMemo(() => products, [products]);
  const memoizedGroups = useMemo(() => groups, [groups]);
  const memoizedFavorites = useMemo(() => favorites, [favorites]);
  const memoizedTransactions = useMemo(() => transactions, [transactions]);
  const memoizedReviews = useMemo(() => reviews, [reviews]);
  const memoizedUsers = useMemo(() => users, [users]);

  useEffect(() => {
    if (!user?._id) return;

    const fetchData = async () => {
      
      setLoading(true);
      try {
        const results = await Promise.allSettled([
          fetchUserResource(`/products/user/${user._id}`),
          fetchUserResource(`/groups/user/${user._id}`),
          fetchUserResource(`/conversations/user/${user._id}`),
          fetchUserResource(`/favorites`),
          fetchUserResource(`/transactions/my-transactions`),
          fetchUserResource(`/transactions/user-feedback/${user._id}`) 
        ]);

            console.log("check datos desde overview:", {
          productos: results[0].value,
          grupos: results[1].value,
          mensajes: results[2].value,
          favoritos: results[3].value, //!
          tratos: results[4].value,    //!
          opiniones: results[5].value
        });

        setProducts(results[0].status === 'fulfilled' ? (results[0].value || []) : []);
        setGroups(results[1].status === 'fulfilled' ? (results[1].value || []) : []);
        setMessages(results[2].status === 'fulfilled' ? (results[2].value || []) : []);
        setFavorites(results[3].status === 'fulfilled' ? (results[3].value || []) : []);
        setTransactions(results[4].status === 'fulfilled' ? (results[4].value || []) : []);
        
        const revData = results[5].status === 'fulfilled' ? results[5].value : [];
        setReviews(Array.isArray(revData) ? revData : []);

        if (user.role === "admin") {
          const usrs = await fetchUserResource(`/users`);
          setUsers(Array.isArray(usrs) ? usrs : []);
        }
      } catch (error) {
        console.error("Error en fetchData:", error);
        setReviews([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchData();

  }, [user?._id, fetchUserResource]);
  

  if (!user) return <p>Debes iniciar sesión o registrarte para ver tu perfil.</p>;
  if (loading) return <p>Cargando datos...</p>;

  return (
    <div className="overview">
          <header>
            <div className='overviewUser' >
                {user.profileImage.url === "" ? (
                  <img className='profileImageSmall' src={defaultProfileImage} alt="Foto de usuario" />
                ) : (
                  <img className='profileImageSmall' src={ user.profileImage.url } alt={user.name} />
                )}

                <h3>{user.name}</h3>

            </div>
            <div className='overviewUserInfo'>
              { user.role === "admin" && <p>Administrador</p> }
              <p>Miembro desde: {(user.createdAt.split("T")[0]).split("-")[2]}/{(user.createdAt.split("T")[0]).split("-")[1]}/{(user.createdAt.split("T")[0]).split("-")[0]}</p>
              {user.location !== "" && <p> {user.location} </p> || <p>Ubicación pendiente...</p> } 
              {user.bio !== "" && <p> {user.bio} </p> || <p>Biografía pendiente...</p> } 
              <p>⭐️ {user.rating} ({user.numReviews} opiniones)</p>
              <ul>
                  <li>
                    <Link to='/Home' >Editar perfil</Link>
                  </li>
                  <li>|</li>
                  <li>
                    <p style={{ cursor: 'pointer' }} onClick={handleLogout}>Cerrar Sesión</p>
                  </li>
              </ul>

            </div>

          </header>

      <section className={`userCategories`} >

            {/* //* Cards de USUARIO */}

            <Card title='Productos'
                  category='products'
                  footerButton='createNew'
                  onClick={()=> navigate(`/Products`)}
                  style={{ cursor: 'pointer', maxHeight: '300px' }}>

                <ul>
                  {memoizedProducts.length > 0 ? (
                    memoizedProducts.map(p => <li key={p._id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Thumbnail size='s' src={p.image.url}/>
                          <div className='line-link'>
                            {p.name}
                          </div>
                      </div>
                          <div className='line-buttons' >
                            <FavoriteSetButton targetId={p._id} targetType="product" />
                          </div>
                      </li>)
                  ) : (
                    <p>No tienes productos.</p>
                  )}
                </ul>
            </Card>

            <Card title='Tus grupos'
                  category='groups'
                  footerButton='createNew'
                  onClick={()=> navigate(`/Groups`)}
                  style={{ cursor: 'pointer', maxHeight: '300px' }}>

                <ul>
                  {memoizedGroups.length > 0 ? (
                    memoizedGroups.map(g => 
                    <li key={g._id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Thumbnail size='s' src={g.image || defaultGroupImage}/>
                          <div className='line-link'>
                            {g.name}
                          </div>
                      </div>
                      <div className='line-buttons' >
                        <FavoriteSetButton targetId={g._id} targetType="group" />
                        <ChatSendMessageButton entity={g} type="group"/>
                      </div>
                      </li>)
                  ) : (
                    <p>No perteneces a ningún grupo.</p>
                  )}
                </ul>
            </Card>

            <Card title='Tus favoritos'
                  category='favorites'
                  footerButton='goTo'
                  onClick={()=> navigate(`/Favorites`)}
                  style={{ cursor: 'pointer', maxHeight: '300px' }}>

                <ul>
                  {memoizedFavorites.length > 0 ? (
                    memoizedFavorites.map(f => {
                      if (!f.targetId) return null;
                      //! thumbnail según tipo
                      let imageUrl = defaultProfileImage;
                      if (f.targetType === 'product') {
                        imageUrl = f.targetId.image?.url || defaultProfileImage;
                      } else if (f.targetType === 'group') {
                        //* si es grupo va el string y si no va defaultGroupImage
                        imageUrl = (typeof f.targetId.image === 'string' && f.targetId.image !== "") 
                                  ? f.targetId.image 
                                  : defaultGroupImage;
                      } else if (f.targetType === 'user') {
                        imageUrl = f.targetId.profileImage?.url || defaultProfileImage;
                    }

                      return (
                        <li key={f._id}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Thumbnail size='s' src={imageUrl} />
                            <span className='line-link' >
                              {f.targetId?.name || "No disponible"}
                            </span>
                          </div>
                          
                          <div className='line-buttons'>
                            <FavoriteSetButton 
                              targetId={f.targetId?._id} 
                              targetType={f.targetType} 
                            />

                            {(f.targetType === 'group' || f.targetType === 'user') && (
                              <ChatSendMessageButton 
                                entity={f.targetId} 
                                type={f.targetType === 'group' ? 'group' : 'private'} 
                              />
                            )}
                          </div>
                        </li>
                      );
                    })
                  ) : (
                    <p>No tienes favoritos.</p>
                  )}
                </ul>
            </Card>



            <Card title='Tus trueques'
                  category='transactions'
                  footerButton='goTo'
                  onClick={()=> navigate(`/Transactions`)}
                  style={{ cursor: 'pointer', maxHeight: '300px' }}>

                <ul>
                  {memoizedTransactions.length > 0 ? (
                    memoizedTransactions.map(t => (
                      <li key={t._id} className="line-info">
                        <div className='line-link'>                    
                          <strong>{t.initiator === user._id ? "Enviada: " : "Recibida: "}</strong>
                          {t.offeredProduct?.name || "Producto"}
                        </div>
                        <span className={`status-badge line-buttons ${t.status}`}>
                          {t.status}
                        </span>
                      </li>
                    ))
                  ) : (
                    <p>No tienes tratos pendientes.</p>
                  )}
                </ul>
            </Card>


            <Card title="Valoraciones recibidas"
                  category="users"
                  style={{ cursor: 'pointer', maxHeight: '300px' }}>
                    
                      <div style={{ textAlign: 'center', padding: '10px' }}>
                        <h2 style={{ margin: 0 }}>⭐️ {user.rating}</h2>
                        <p className="subtitle">{user.numReviews} valoraciones recibidas</p>
                      </div>
                      <ul className="feedback-list">
                        {memoizedReviews?.length > 0 ? (
                          memoizedReviews.map((t) => {
                            const f = t.feedback.find(rev => {
                              const revId = rev.reviewer?._id || rev.reviewer;
                              return revId.toString() !== user._id.toString();
                            });
                            if (!f) return null;
                            return (
                              <li key={t._id} >
                                <strong>{"★".repeat(f.rating)}</strong> "{f.comment}"
                              </li>
                            );
                          })
                        ) : (
                          <p style={{ textAlign: 'center', padding: '10px' }}>Aún no tienes opiniones.</p>
                        )}
                      </ul>
            </Card>         

            {/* //* Cards de ADMINISTRADOR */}

            { user?.role === "admin" && (
                <Card title='Usuarios | Panel de administrador'
                      category='users'
                      footerButton='goTo'
                      onClick={()=> navigate(`/Users`)}
                      style={{ cursor: 'pointer', maxHeight: '300px' }}>

                    <ul>
                      {memoizedUsers.length > 0 ? (
                        memoizedUsers.map(u => <li key={u._id} className='line-info'>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <Thumbnail size='s' src={u.profileImage?.url || defaultProfileImage}/>
                              <div className='line-link' onClick={() => navigate(`/users/${u._id}`)}>
                                {u.name}{" · "}{u.locationName}
                              </div>
                          </div>
                          <div className='line-buttons'>
                            <FavoriteSetButton targetId={u._id} targetType="user" />
                            <ChatSendMessageButton entity={u} type="private"/>
                          </div>
                          </li>)
                      ) : (
                        <p>No se han encontrado usuarios.</p>
                      )}
                    </ul>

                </Card>
              ) }

      </section>
    </div>

  );
};

export default OverView;