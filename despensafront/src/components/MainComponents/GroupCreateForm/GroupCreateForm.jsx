import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Form.css';
import { AuthContext } from '../../../context/AuthContext.jsx';
import Button from '../../designComponents/Button/Button.jsx';
import Card from '../../designComponents/Card/Card.jsx';
import '../Form.css'
import LocationPicker from '../LocationPicker/LocationPicker.jsx';
import Thumbnail from '../../designComponents/Thumbnail/Thumbnail.jsx';
import { defaultGroupImage } from '../../../config/constants.js';

const GroupCreateForm = ({onCancel}) => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    isPrivate: false,
    locationName: "",
    locationLat: "",
    locationLng: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);



  const API_URL = import.meta.env.VITE_API_URL;
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      setMessage("Formato de imagen no válido.");
      return;
    }

    if (file.size > maxSize) {
      setMessage("La imagen no puede superar los 2MB.");
      return;
    }

    setImageFile(file);
    setMessage("");
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
    return result.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let image = "";
      if (imageFile) {
        image = await uploadToCloudinary(imageFile);
      }

      const payload = {
        ...formData,
        image,
      };

      const res = await fetch(`${API_URL}/groups/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage(`Grupo creado correctamente: ${data.group.name}`);
      setFormData({ name: "", description: "", location: "", isPrivate: false });
      setImageFile(null);

      navigate("/groups");

      if (onCancel) onCancel();

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Crear grupo" category="form">
      <form onSubmit={handleSubmit}>

        <ul>
          <li>
            <input
              type="text"
              name="name"
              placeholder="Nombre del grupo"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </li>

          <li>
            <textarea
              name="description"
              placeholder="Descripción del grupo"
              value={formData.description}
              onChange={handleInputChange}
            />
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
          
          <li>
            <label className="checkbox">
              Grupo privado
              </label>
              <input
                type="checkbox"
                name="isPrivate"
                checked={formData.isPrivate}
                onChange={handleInputChange}
              />
          </li>

              <div className='file-upload-container' >
                <label>Añadir imagen</label>
                <Thumbnail size="m" src={imageFile ? URL.createObjectURL(imageFile) : defaultGroupImage}/>
              </div>
              <input type="file" accept="image/*" onChange={handleFileChange} />

        </ul>


        <Button type="submit" disabled={loading} className="button s">
          {loading ? "Creando grupo..." : "Crear grupo"}
        </Button>

        {message && <p className="message">{message}</p>}

      </form>
    </Card>
  );
};

export default GroupCreateForm;
