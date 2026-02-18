import React, { useState, useContext, useEffect } from 'react';
import '../Form.css';
import { AuthContext } from '../../../context/AuthContext.jsx';
import Button from '../../designComponents/Button/Button.jsx';
import Card from '../../designComponents/Card/Card.jsx';
import LocationPicker from '../LocationPicker/LocationPicker.jsx';
import Thumbnail from '../../designComponents/Thumbnail/Thumbnail.jsx';
import '../Form.css';
import { defaultGroupImage } from '../../../config/constants.js';

const ProductCreateForm = ({ onCreated }) => {
  const { user, token, fetchUserResource } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "intercambio",
    quantity: 1,
    unit: "kilos",
    visibility: "public",
    locationName: "",
    locationLat: "",
    locationLng: "",
  });

  const [userGroups, setUserGroups] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  //* grupos del usuario
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const groups = await fetchUserResource(`/groups/user/${user._id}`);
        if (Array.isArray(groups)) setUserGroups(groups);
      } catch (err) {
        console.error("Error cargando grupos para el select:", err);
      }
    };
    if (user) loadGroups();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setMessage("");
    }
  };

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: data
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error?.message);
    return result.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let imageUrl = "";
      if (imageFile) imageUrl = await uploadToCloudinary(imageFile);


      const payload = {
        ...formData,
        isPublic: formData.visibility === "public",
        group: formData.visibility === "public" ? null : formData.visibility,
        image: { url: imageUrl },
      };

      const res = await fetch(`${API_URL}/products/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage(`Producto publicado correctamente.`);
      if (onCreated) onCreated();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Publicar Producto" category="form">
      <form onSubmit={handleSubmit}>
        <ul>
          <li>
            <input type="text" name="name" placeholder="Nombre del producto" value={formData.name} onChange={handleInputChange} required />
          </li>
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
          <div>
            <li>
              <input type="number" name="quantity" min="0" value={formData.quantity} onChange={handleInputChange} required />
              <select name="unit" value={formData.unit} onChange={handleInputChange}>
                <option value="kilos">Kilos</option>
                <option value="litros">Litros</option>
                <option value="unidades">Unidades</option>
                <option value="gramos">Gramos</option>
              </select>
            </li>

          </div>

          {/* select para público o dentro de grupos del usuario */}
          <li>
            <p>¿Dónde quieres publicarlo?</p>
          </li>
          <li>
            <select name="visibility" value={formData.visibility} onChange={handleInputChange}>
              <option value="public">🌍 Despensa Pública (Abierto a todos)</option>
              {userGroups.map(g => (
                <option key={g._id} value={g._id}>
                  👥 Grupo: {g.name}
                </option>
              ))}
            </select>
          </li>
          <li><p>Modalidad: </p></li>
          <li>
            <select name="category" value={formData.category} onChange={handleInputChange}>
              <option value="intercambio">Intercambio</option>
              <option value="donación">Donación</option>
            </select>
          </li>

          <li>
            <textarea name="description" placeholder="Descripción..." value={formData.description} onChange={handleInputChange} />
          </li>

          <li>
              <div className='file-upload-container' >
                <label>Añadir imagen</label>
                <Thumbnail size="m" src={imageFile ? URL.createObjectURL(imageFile) : defaultGroupImage}/>
              </div>
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </li>
        </ul>

        <Button type="submit" disabled={loading} className="button s">
          {loading ? "Publicando..." : "Publicar"}
        </Button>
        {message && <p className="message">{message}</p>}
      </form>
    </Card>
  );
};

export default ProductCreateForm;