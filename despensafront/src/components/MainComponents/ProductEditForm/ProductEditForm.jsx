import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext.jsx';
import Button from '../../designComponents/Button/Button.jsx';
import Card from '../../designComponents/Card/Card.jsx';
import LocationPicker from '../LocationPicker/LocationPicker.jsx';
import Thumbnail from '../../designComponents/Thumbnail/Thumbnail.jsx';
import '../Form.css';

const ProductEditForm = ({ product, onUpdated }) => {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

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

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: data }
    );

    const result = await res.json();
    if (!res.ok) throw new Error(result.error?.message);
    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {

      let image = product.image;

     if (imageFile) {
        image = await uploadToCloudinary(imageFile);
     }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/products/${product._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({...formData, image}),
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
        
        <ul>
          <li>
            <LocationPicker
              value={formData.locationName}
              onSelect={(loc) => setFormData(prev => ({
                ...prev,
                locationName: loc.name,
                locationLat: loc.lat,
                locationLng: loc.lng,
              }))}
            />
          </li>

          <li>
            <div className="form-row" style={{ display: 'flex', gap: '10px' }}>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} style={{ flex: 1 }} />
              <select name="unit" value={formData.unit} onChange={handleInputChange} style={{ flex: 1 }}>
                <option value="kilos">Kilos</option>
                <option value="litros">Litros</option>
                <option value="unidades">Unidades</option>
              </select>
            </div>
          </li>

          <li>
            <select name="status" value={formData.status} onChange={handleInputChange}>
              <option value="available">Disponible</option>
              <option value="reserved">Reservado</option>
              <option value="completed">Finalizado</option>
            </select>

          </li>
          
          <li>
            <textarea name="description" value={formData.description} onChange={handleInputChange} />
          </li>

          <li>

              <div className="file-upload-container">
                <Thumbnail 
                  size="m" 
                  src={imageFile ? URL.createObjectURL(imageFile) : product.image.url} 
                />

                <input type="file" onChange={(e) => setImageFile(e.target.files[0])} />

              </div>
          </li>
        </ul>
        

        <Button type="submit" disabled={loading} className="button s">
          {loading ? "Guardando..." : "Actualizar Producto"}
        </Button>
        {message && <p>{message}</p>}
      </form>
    </Card>
  );
};

export default ProductEditForm;