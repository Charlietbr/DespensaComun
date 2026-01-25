import React, { useContext, useEffect, useState } from "react";
import Panel from "../../components/designComponents/Panel/Panel";
import Card from "../../components/designComponents/Card/Card";
import Button from "../../components/designComponents/Button/Button";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import PanelSearchBar from "../../components/designComponents/PanelSearchBar/PanelSearchBar";
import FavoriteSetButton from "../../components/MainComponents/FavoriteSetButton/FavoriteSetButton";
import ProductCreateForm from "../../components/MainComponents/ProductCreateForm/ProductCreateForm";

const currentCategory = "products";
const title = "Despensa";
const subtitle = "Gestiona tus excedentes y descubre qué ofrecen otros vecinos...";

const Products = () => {
  const { user, fetchUserResource } = useContext(AuthContext);
  const navigate = useNavigate();

  const [userProducts, setUserProducts] = useState([]);
  const [otherProducts, setOtherProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const [fetchedUserProducts, fetchedAllProducts] = await Promise.all([
        fetchUserResource(`/products/user/${user._id}`),
        fetchUserResource(`/products`),
      ]);
      setUserProducts(Array.isArray(fetchedUserProducts) ? fetchedUserProducts : []);
      const others = (Array.isArray(fetchedAllProducts) ? fetchedAllProducts : [])
        .filter((p) => p.owner?._id !== user._id && p.owner !== user._id);
      setOtherProducts(others);
    } catch (err) {
      console.error("Error al cargar productos:", err);
      setError("No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);


  //! lío con los estados por el stock. COMPOROBAR!!!!
  const renderStockBadge = (product) => {
    const { quantity, status, unit } = product;
      
    //* reservado o stock a cero
    if (quantity === 0 || status === "reserved") {
      return <span className="badge-ui reserved">Reservado / Sin stock</span>;
    }
      
    //* stock bajo
    if (quantity <= 2) {
      return (
        <span className="badge-ui low-stock">
          ¡Últimas {quantity} {unit}!
        </span>
      );
    }
      
    //* disponible
    return <span className="badge-ui available">{quantity} {unit} disponibles</span>;
  };


  //! filtrar las búsquedas. + LOCATION Y CAT
  const filteredUserProducts = userProducts.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOtherProducts = otherProducts.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.owner?.locationName?.toLowerCase().includes(searchTerm.toLowerCase())
  );





  if (!user) return <p>Debes iniciar sesión para ver la despensa.</p>;
  if (loading) return <p>Cargando productos...</p>;



  return (
    <Panel category={currentCategory} user={user} title={title} subtitle={subtitle} backButton={true}>
      <header>
        <PanelSearchBar 
          placeholder="Buscar por nombre, categoría o ubicación..." 
          emitSearch={(val) => setSearchTerm(val)}
        />
      </header>

{/* Productos del usuario */}
      <Card title={`Tus productos en intercambio (${filteredUserProducts.length})`} category={currentCategory}>
        <ul>
          {filteredUserProducts.length > 0 ? (
            filteredUserProducts.map((p) => (
              <li key={p._id} style={{ marginBottom: "10px" }}>
                <div onClick={() => navigate(`/products/${p._id}`)} style={{ cursor: "pointer" }}>
                  <strong className="line-link">{p.name}</strong> -  ({p.category})
                  <div style={{ marginTop: "5px" }}>
                    {renderStockBadge(p)}
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li>{searchTerm ? "No hay coincidencias en tus productos." : "No tienes productos publicados."}</li>
          )}
        </ul>

        <div style={{ marginTop: "15px" }}>
          <Button className="button xs" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? "Cancelar" : "Publicar nuevo producto"}
          </Button>
        </div>

        {showCreateForm && (
          <div>
            <ProductCreateForm 
              onCreated={() => {
                fetchProducts(); 
                setShowCreateForm(false); 
              }} 
            />
          </div>
        )}
      </Card>

{/* Productos disponibles de otros usuarios */}
      <Card title={`Productos disponibles (${filteredOtherProducts.length})`} category={currentCategory}>
        <div >
          {filteredOtherProducts.length > 0 ? (
            filteredOtherProducts.map((p) => (
              <li key={p._id}>
                <div 
                  onClick={() => navigate(`/products/${p._id}`)}
                  style={{ cursor: "pointer", flex: 1, opacity: (p.quantity === 0 || p.status === 'reserved') ? 0.6 : 1 }}
                >
                  <strong className="line-link" >{p.name}</strong>
                  <p>
                    ({p.owner?.locationName || "Vecino cercano"})
                  </p>
                    <div style={{ marginTop: "5px" }}>
                    {renderStockBadge(p)}
                  </div>
                </div>
                <FavoriteSetButton targetId={p._id} targetType="product" />
              </li>
            ))
          ) : (
            <p>{searchTerm ? "No se han encontrado productos con esos criterios." : "No hay productos disponibles de otros usuarios."}</p>
          )}
        </div>
      </Card>
    </Panel>
  );
};

export default Products;