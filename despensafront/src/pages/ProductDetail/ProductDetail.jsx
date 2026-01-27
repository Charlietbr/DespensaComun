import React, { useContext, useEffect, useState } from "react";
import Panel from "../../components/designComponents/Panel/Panel";
import Card from "../../components/designComponents/Card/Card";
import Button from "../../components/designComponents/Button/Button";
import { AuthContext } from "../../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { defaultProfileImage } from "../../config/constants";
import FavoriteSetButton from "../../components/MainComponents/FavoriteSetButton/FavoriteSetButton";
import ChatSendMessageButton from "../../components/MainComponents/ChatSendMessageButton/ChatSendMessageButton";
import Thumbnail from "../../components/designComponents/Thumbnail/Thumbnail";
import './ProductDetail.css';
import TransactionForm from "../../components/MainComponents/TransactionForm/TransactionForm";
import ProductEditForm from "../../components/MainComponents/ProductEditForm/ProductEditForm"

const ProductDetail = () => {
    const { user, fetchUserResource } = useContext(AuthContext);
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [showTransactionForm, setShowTransactionForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    const fetchProduct = async () => {
        setLoading(true);
        setError("");
        try {
          const data = await fetchUserResource(`/products/${id}`);
          if (!data) throw new Error("Producto no encontrado.");
          setProduct(data);
        } catch (err) {
          console.error(err);
          setError(err.message || "Error al cargar el producto.");
        } finally {
          setLoading(false);
        }
    };

  useEffect(() => {
    if (user) fetchProduct();
      }, [id, user]);

    if (!user) return <p>Debes iniciar sesión para ver los detalles.</p>;
    if (loading) return <p>Cargando producto...</p>;
    if (error) return <p>{error}</p>;
    if (!product) return <p>No se encontró el producto.</p>;


  const ownerId = product.owner?._id?.toString() || product.owner?.toString();
  const currentUserId = user?._id?.toString();

  const isOwner = ownerId === currentUserId;
  const isAdmin = user?.role === "admin";
  const canEdit = isOwner || isAdmin;
 

  const handleDelete = async () => {
      if (!window.confirm("¿Seguro que quieres eliminar este producto?")) return;
      try {
        await fetchUserResource(`/products/${id}`, { method: "DELETE" });
        navigate("/products");
      } catch (err) {
        alert("Error al eliminar el producto.");
      }
  };

  return (
    <Panel
      category="products"
      user={user}
      title={product.name}
      subtitle={`${product.quantity} ${product.unit} disponibles para ${product.category}`}
      info={product.description || "Sin descripción adicional."}
      backButton={true}
      image={product.image?.url || ""}
    >


      <Card title="Detalles del producto" category="products">
        <li className="line-info"><strong>Categoría:</strong> {product.category}</li>
        <li className="line-info"><strong>Estado:</strong> {product.status === 'available' ? 'Disponible' : 'Reservado'}</li>
        <li className="line-info"><strong>Cantidad:</strong> {product.quantity} {product.unit}</li>
        <li className="line-info"><strong>Ubicación:</strong> {product.locationName}</li>
        {product.estimatedHarvestDate && (
          <li className="line-info">
            <strong>Fecha estimada:</strong> {new Date(product.estimatedHarvestDate).toLocaleDateString()}
          </li>
        )}

        {!isOwner && (
          <div className="line-buttons">
            <FavoriteSetButton targetId={product._id} targetType="product" />
            <ChatSendMessageButton entity={product.owner} type="private" />
          </div>
        )}


      </Card>

      <Card title="Información del Productor" category="users">
        <div style={{padding: '10px'}}>
          <Thumbnail 
            src={product.owner?.profileImage?.url || defaultProfileImage} 
            size="m" 
          />
          <div>
            <strong>{product.owner?.name}</strong>
            <p>{product.owner?.locationName || "Ubicación no especificada"}</p>
          </div>
        </div>
        

      </Card>

      <Card title="Acciones" category="products">
        {canEdit ? (
          <>
              {!isOwner &&
            <div> 
              {!showTransactionForm ? (

                <Button className="button xs" 
                        onClick={() => setShowTransactionForm(true)}
                        disabled={product.quantity <= 0 || product.status === 'reserved'} //* bloqueado
                      >
                  {product.quantity <= 0 || product.status === 'reserved' 
                    ? 'Producto Agotado/Reservado' 
                    : (product.category === 'donación' ? 'Solicitar producto' : 'Proponer intercambio')
                  }
                </Button>
              ) : (
                <TransactionForm 
                  product={product} 
                  onCancel={() => setShowTransactionForm(false)} 
                  onTradeCreated={() => {
                    setShowTransactionForm(false);
                    navigate('/overview'); //! falta!!!
                  }}
                />
              )}
            </div>
              }
            <div>
              <p style={{padding: "15px 5px 5px 5px", fontSize: "smaller"}}>Opciones disponibles</p>
              <Button className="button xs" onClick={() => (setShowEditForm(true))}>
                Editar Producto
              </Button>

              {showEditForm && (
                <ProductEditForm
                  product={product}
                  onUpdated={() => {
                  fetchProduct();
                  setShowEditForm(false);
                  }}
                />
              )}



              <Button className="button xs exit" onClick={handleDelete}>
                Eliminar de la despensa
              </Button>
            </div>
          </>
        ) : (
          <div>
            {!showTransactionForm ? (
              <Button className="button s" onClick={() => setShowTransactionForm(true)}>
                {product.category === 'donación' ? 'Solicitar producto' : 'Proponer intercambio'}
              </Button>
            ) : (
              <TransactionForm 
                product={product} 
                onCancel={() => setShowTransactionForm(false)} 
                onTradeCreated={() => {
                  setShowTransactionForm(false);
                  navigate('/overview'); //! falta!!!
                }}
              />
            )}
          </div>
        )}
      </Card>
    </Panel>
  );
};

export default ProductDetail;