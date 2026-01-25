import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext.jsx';
import Button from '../../designComponents/Button/Button.jsx';
import Card from '../../designComponents/Card/Card.jsx';
import LocationPicker from '../LocationPicker/LocationPicker.jsx';
import Thumbnail from '../../designComponents/Thumbnail/Thumbnail.jsx';

const ProductEditForm = ({ product, onUpdated }) => {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    quantity: "",
    unit: "",
    status: "",
    locationName: "",
    locationLat: "",
    locationLng: "",
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        category: product.category || "intercambio",
        quantity: product.quantity || 0,
        unit: product.unit || "kilos",
        status: product.status || "available",
        locationName: product.locationName || "",
        locationLat: product.locationLat || "",
        locationLng: product.locationLng || "",
      });
    }
  }, [product]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/products/${product._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Error al actualizar");
      setMessage("¡Producto actualizado!");
      if (onUpdated) onUpdated();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Editar Producto" category="form">
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nombre" />
        
        <LocationPicker
          value={formData.locationName}
          onSelect={(loc) => setFormData(prev => ({
            ...prev,
            locationName: loc.name,
            locationLat: loc.lat,
            locationLng: loc.lng,
          }))}
        />

        <div className="form-row" style={{ display: 'flex', gap: '10px' }}>
          <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} style={{ flex: 1 }} />
          <select name="unit" value={formData.unit} onChange={handleInputChange} style={{ flex: 1 }}>
            <option value="kilos">Kilos</option>
            <option value="litros">Litros</option>
            <option value="unidades">Unidades</option>
          </select>
        </div>

        <select name="status" value={formData.status} onChange={handleInputChange}>
          <option value="available">Disponible</option>
          <option value="reserved">Reservado</option>
          <option value="completed">Finalizado</option>
        </select>

        <textarea name="description" value={formData.description} onChange={handleInputChange} />

        <Button type="submit" disabled={loading} className="button s">
          {loading ? "Guardando..." : "Actualizar Producto"}
        </Button>
        {message && <p>{message}</p>}
      </form>
    </Card>
  );
};

export default ProductEditForm;