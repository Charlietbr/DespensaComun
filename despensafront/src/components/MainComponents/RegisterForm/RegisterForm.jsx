import React, { useState, useEffect, useContext } from 'react';
import '../Form.css';
import Button from '../../designComponents/Button/Button.jsx';
import Card from '../../designComponents/Card/Card.jsx';
import LocationPicker from '../LocationPicker/LocationPicker.jsx';
import { AuthContext } from '../../../context/AuthContext.jsx';
import Thumbnail from '../../designComponents/Thumbnail/Thumbnail.jsx';
import { defaultProfileImage } from '../../../config/constants.js';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const RegisterForm = () => {

  const { login } = useContext(AuthContext);
  const { user, logout, token, updateUserContext } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    locationName: "",
    locationLat: "",
    locationLng: "",
    bio: ""
  });

  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  //! limpiar contraseña al cargar
  useEffect(() => {
    setFormData(prev => ({ ...prev, password: "" }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

  return {
    url: data.secure_url,
    public_id: data.public_id || "",
  };
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {

   

      if (!formData.locationLat || !formData.locationLng) {
        throw new Error("Debes seleccionar una población válida de la lista.");
      }
      
      let profileImage = "";

      if (imageFile) {
        profileImage = await uploadToCloudinary(imageFile); 
      }

      const payload = { ...formData, profileImage };

      const res = await fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Error al registrar usuario");

        if (data.token && data.user) {
               
                login(data.user, data.token); 
                
                await Swal.fire({
                  title: '¡Bienvenido!',
                  text: 'Cuenta creada con éxito. Redirigiendo...',
                  icon: 'success',
                  timer: 3000,
                  showConfirmButton: false,
                  heightAuto: false
                });

                navigate("/overview");
        }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error',
        heightAuto: false
      });
    
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Crea tu perfil de usuario" category="form" style={{maxHeight: "800px"}}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          placeholder="Nombre"
        />

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          placeholder="Correo"
        />

        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
          placeholder="Contraseña"
        />

 
        <LocationPicker
          value={formData.locationName}
          onSelect={(loc) => {
            setFormData(prev => ({
              ...prev,
              locationName: loc.name,
              locationLat: loc.lat,
              locationLng: loc.lng,
            }));
            console.log("Ciudad seleccionada:", loc);
          }}
        />
        
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          placeholder="Descríbete o añade una cita"
        />

        <div className='file-upload-container'>
          <label>Añade una imagen de perfil</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
         
          <Thumbnail size="s" src={ imageFile ? URL.createObjectURL(imageFile) 
            : user?.profileImage.url || defaultProfileImage } alt={`Imagen de ${user?.name || "usuario"}`} />
   
        </div>

        <Button className='btn m' type="submit" disabled={loading}>
          {loading ? "Creando usuario..." : "Registrarse"}
        </Button>

        {message && <p className="message">{message}</p>}
      </form>
    </Card>
  );
};

export default RegisterForm;
