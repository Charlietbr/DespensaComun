import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext.jsx";
import Button from "../../designComponents/Button/Button.jsx";
import Card from "../../designComponents/Card/Card.jsx";
import { useNavigate } from "react-router-dom";
import LocationPicker from "../LocationPicker/LocationPicker.jsx";
import Thumbnail from "../../designComponents/Thumbnail/Thumbnail.jsx";
import '../Form.css';
import Swal from "sweetalert2";

const GroupEditForm = ({ group, onUpdated }) => {
  const { token, user } = useContext(AuthContext);
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;


  if (!group || !user) {
    return (
      <Card title="Editar grupo" category="form">
        <p>Cargando grupo...</p>
      </Card>
    );
  }

  const isCreator = group.creator._id === user._id;

  useEffect(() => {
    setFormData({
      name: group.name || "",
      description: group.description || "",
      location: group.location || "",
      isPrivate: group.isPrivate || false,
    });
  }, [group]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
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
    let image = group.image;

    if (imageFile) {
      image = await uploadToCloudinary(imageFile);
    }

    const res = await fetch(`${API_URL}/groups/${group._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...formData, image }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || "Error al actualizar el grupo");
    }

    setMessage("Grupo actualizado correctamente");

    if (typeof onUpdated === "function") {
      onUpdated();
    }
  } catch (err) {
    setMessage(err.message);
  } finally {
    setLoading(false);
  }
};


const handleDeleteGroup = async () => {

    const result = await Swal.fire({
      title: '¿Eliminar grupo definitivamente?',
      text: "Esta acción no se puede deshacer y se perderán todos los datos del grupo.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--exit-button-color, #d33)',
      cancelButtonColor: 'rgb(123, 100, 145)', 
      confirmButtonText: 'Sí, eliminar grupo',
      cancelButtonText: 'Cancelar',
      heightAuto: false
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/groups/${group._id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Error en la respuesta del servidor");


        await Swal.fire({
          title: '¡Grupo eliminado!',
          text: 'El grupo ha sido borrado correctamente.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          heightAuto: false
        });

        navigate("/groups");
      } catch (err) {

        Swal.fire({
          title: 'Error',
          text: 'No ha sido posible eliminar el grupo.',
          icon: 'error',
          confirmButtonColor: 'rgb(123, 100, 145)',
          heightAuto: false
        });
      }
    }
  };

  return (
    <Card title="Editar grupo" category="form">
      <form onSubmit={handleSubmit}>

        <ul>
          <li>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </li>


          <li>
            <textarea
              name="description"
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
          
          <li>

              <div className="file-upload-container">
                <Thumbnail 
                  size="m" 
                  src={imageFile ? URL.createObjectURL(imageFile) : group.image} 
                />

                <input type="file" onChange={(e) => setImageFile(e.target.files[0])} />

              </div>
          </li>
        </ul>





        <Button className="button xs" type="submit" disabled={loading}>
          Guardar cambios
        </Button>


        {message && <p className="message">{message}</p>}

        
        {isCreator && (
          <Button className="button xs exit" onClick={handleDeleteGroup}>
            Eliminar grupo
          </Button>
        )}

        
      </form>


    </Card>
  );
};

export default GroupEditForm;
