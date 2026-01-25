import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import Button from '../../designComponents/Button/Button';
import Card from '../../designComponents/Card/Card';

const TransactionForm = ({ product, onTradeCreated, onCancel }) => {
  const { user, fetchUserResource } = useContext(AuthContext);
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    quantityOffered: 1, //* cantidad de producto que se pide
    selectedMyProduct: "", //* lo que se ofrece a cambio
    myProductQuantity: 1 //* la cantidad que se ofrece
  });

  useEffect(() => {
    if (product.category === 'intercambio' && user) {
      const loadMyProducts = async () => {
        try {
          //* ruta del inventario /products/my-inventory
          const data = await fetchUserResource('/products/my-inventory');
          if (data) {
            setUserProducts(data.filter(p => p.status === 'available' && p.quantity > 0));
          }
        } catch (err) {
          console.error("Error cargando inventario:", err);
        }
      };
      loadMyProducts();
    }
  }, [product.category, user, fetchUserResource]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    //* validación
    if (Number(formData.quantityOffered) > product.quantity) {
      setMessage(`No puedes solicitar más de ${product.quantity} unidades.`);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const receiverId = product.owner._id || product.owner;

      const payload = {
        receiver: receiverId,
        offeredProduct: product._id,
        quantityOffered: Number(formData.quantityOffered),
        category: product.category,
        requestedProducts: product.category === 'intercambio' ? [{
          user: user._id,
          product: formData.selectedMyProduct,
          quantity: Number(formData.myProductQuantity)
        }] : []
      };

      const res = await fetchUserResource('/transactions', {
        method: 'POST',
        body: payload
      });

      if (res) {
        setMessage("¡Propuesta enviada con éxito!");
        //* dar tiempo para leer
        setTimeout(() => onTradeCreated(), 2000);
      }
    } catch (err) {
      //* error si falla stock
      setMessage(err.message || "Error al enviar la propuesta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={`Proponer ${product.category}`} category="form">
      <form onSubmit={handleSubmit}>
        <label>¿Qué cantidad de <strong>{product.name}</strong> solicitas?</label>
        <p style={{ fontSize: '0.8rem', color: '#666' }}>Máximo disponible: {product.quantity}</p>
        <input 
          type="number" 
          min="1" 
          max={product.quantity}                    //? bloqueo de flechas
          value={formData.quantityOffered}
          onChange={(e) => {
            const val = Number(e.target.value);
                                                    //? bloqueo de escritura
            if (val > product.quantity) return;
            setFormData({...formData, quantityOffered: val});
          }}
          required
        />

        {product.category === 'intercambio' && (
          <>
            <label style={{ marginTop: '10px', display: 'block' }}>¿Qué ofreces a cambio?</label>
            <select 
              value={formData.selectedMyProduct}
              onChange={(e) => {
                const selectedId = e.target.value;
                const p = userProducts.find(item => item._id === selectedId);
                setFormData({
                  ...formData, 
                  selectedMyProduct: selectedId,
                  //* reset de cantidad si es menor que uno
                  myProductQuantity: 1
                });
              }}
              required
            >
              <option value="">Selecciona uno de tus productos...</option>
              {userProducts.map(p => (
                <option key={p._id} value={p._id}>{p.name} (Stock: {p.quantity})</option>
              ))}
            </select>

            {formData.selectedMyProduct && (
              <div style={{ marginTop: '10px' }}>
                <label>Cantidad de tu producto que entregas:</label>
                <input 
                  type="number" 
                  min="1"
                  //* max stock del producto seleccionado
                  max={userProducts.find(p => p._id === formData.selectedMyProduct)?.quantity || 1}
                  value={formData.myProductQuantity}
                  onChange={(e) => setFormData({...formData, myProductQuantity: Number(e.target.value)})}
                  required
                />
              </div>
            )}
          </>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <Button 
            type="submit" 
            className="button s" 
            disabled={loading || (product.category === 'intercambio' && !formData.selectedMyProduct) || formData.quantityOffered <= 0}
          >
            {loading ? "Enviando..." : "Enviar Propuesta"}
          </Button>
          <Button type="button" className="button s exit" onClick={onCancel}>Cancelar</Button>
        </div>
        
        {message && (
          <p style={{ 
            marginTop: '10px', 
            color: message.includes("éxito") ? "green" : "red",
            fontWeight: 'bold' 
          }}>
            {message}
          </p>
        )}
      </form>
    </Card>
  );
};

export default TransactionForm;