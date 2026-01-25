
import React, { useContext, useEffect, useState } from 'react';
import '../Form.css';
import { AuthContext } from '../../../context/AuthContext.jsx';
import Button from '../../designComponents/Button/Button.jsx';
import { defaultProfileImage } from '../../../config/constants.js'
import { useNavigate } from 'react-router-dom';
import Card from '../../designComponents/Card/Card.jsx';
import LocationPicker from '../LocationPicker/LocationPicker.jsx';
import Thumbnail from '../../designComponents/Thumbnail/Thumbnail.jsx';


const EditUserForm = () => {
  
  const { user, logout, token, updateUserContext } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    locationName: "",
    locationLat: "",
    locationLng: "",
    bio: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        locationName: user.locationName || "",
        locationLat: user.locationLat || "",
        locationLng: user.locationLng || "",
        bio: user.bio || "",
      });
    }
  },[user]);

 
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;


  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpg", "image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024; 

    if (!validTypes.includes(file.type)) {
      setMessage("Solo se permiten imágenes JPG, PNG o WEBP.");
      e.target.value = "";
      return;
    }
    if (file.size > maxSize) {
      setMessage("La imagen no puede superar los 2MB.");
      e.target.value = "";
      return;
    }

    setImageFile(file);
    setMessage("");
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Error al subir la imagen.");
    return data.secure_url;
  };



const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage("");
  setLoading(true);

  try {
    let imageUrl = null;

    if (imageFile) {
      imageUrl = await uploadToCloudinary(imageFile);
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      locationName: formData.locationName,
      locationLat: formData.locationLat,
      locationLng: formData.locationLng,
      bio: formData.bio,
      ...(formData.password && { password: formData.password }),
      ...(imageUrl && {
        profileImage: {
          url: imageUrl
        }
      })
    };

    const res = await fetch(`${API_URL}/users/${user._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al actualizar usuario");

    updateUserContext(data.user);
    setMessage("Perfil actualizado correctamente");

    setFormData((prev) => ({ ...prev, password: "" }));
    setImageFile(null);
  } catch (error) {
    setMessage(error.message);
  } finally {
    setLoading(false);
  }
};



  return (

    <Card title="Actualiza tu perfil" category="form" style={{maxHeight: "800px"}}>
      <form onSubmit={handleSubmit}>
        <div className='editFormTitle'>
        <Button className="s" onClick={ () => navigate("/overview") }>Volver</Button>
        <Button className="s exit" onClick={logout}>Salir</Button>
        </div>

        <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder={user?.name || "" } />
        <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder={user?.email || ""} />
        <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Contraseña" />
        <LocationPicker
          value={formData.locationName}
          onSelect={(loc) => {
            setFormData(prev => ({
              ...prev,
              locationName: loc.name,
              locationLat: loc.lat,
              locationLng: loc.lng,
            }));
            console.log("Ubicación seleccionada:", loc);
          }}
        />
        <textarea name="bio" value={formData.bio} onChange={handleInputChange} placeholder={user?.bio || ""}></textarea>

        <div className="file-upload-container">
          <label>Actualizar imagen</label>

          <Thumbnail size="s" src={ imageFile ? URL.createObjectURL(imageFile) 
            : user?.profileImage.url || defaultProfileImage } alt={`Imagen de ${user?.name || "usuario"}`} />

          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>


        <Button className='btn s' type="submit" disabled={loading}>
            {loading ? "Actualizando usuario..." : "Guardar"}
        </Button>

        {message && <p className="message">{message}</p>}
      </form>

    </Card>

  );
};

export default EditUserForm;







