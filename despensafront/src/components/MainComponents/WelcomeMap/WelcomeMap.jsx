import React, { useContext, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { createUserIcon } from "../../../utils/userMarkerIcon";
import { defaultProfileImage } from '../../../config/constants';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';



//* ajuste de zoom a productos
const AutoFitBounds = ({ products }) => {
  const map = useMap();
  
  //! controlar el error de bounds del mapa si fallan las coordenadas del seed (nombres distintos prod-user)
  const validPoints = products.filter(p => 
    p.locationLat && 
    p.locationLng && 
    p.locationLat !== "" && 
    p.locationLng !== ""
  );
  
  if (validPoints.length > 0) {
    const bounds = validPoints.map(p => [
      parseFloat(p.locationLat), 
      parseFloat(p.locationLng)
    ]);
    map.fitBounds(bounds);
  } else {
    map.setView([40.4168, -3.7038], 10); 
  }
  
  useEffect(() => {
    if (products && products.length > 0) {
      const bounds = L.latLngBounds(
        products
        .filter(p => p.locationLat && p.locationLng)
        .map(p => [parseFloat(p.locationLat), parseFloat(p.locationLng)])
      );
      //* padding a bordes. se pegan los productos
      map.fitBounds(bounds, { padding: [120, 120] });
    }
  }, [products, map]);
  
  return null;
};

const WelcomeMap = ({ mapLat, mapLng, products }) => {
  const centerPosition = [parseFloat(mapLat), parseFloat(mapLng)];
  
  const {user} = useContext(AuthContext);
  const navigate = useNavigate();


  return (
    <MapContainer
      center={centerPosition}
      zoom={8}
      style={{ height: "450px", width: "100%", borderRadius: "12px" }}
      scrollWheelZoom={true}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

    
      <AutoFitBounds products={products} />

      {products?.map((product) => {
        if (!product.locationLat || !product.locationLng) return null;

        return (
          <Marker 
            key={product._id} 
            position={[parseFloat(product.locationLat), parseFloat(product.locationLng)]}
            icon={createUserIcon(product.image?.url || defaultProfileImage)}
          >
            <Popup>
              
              <div style={{ textAlign: 'center', minWidth: '100px', cursor: user ? 'pointer' : 'default'}}
                   onClick={() => {
                    if (user) {
                      {navigate(`/products/${product._id}`)
                    }}
                    }}
                    >
                
                <strong style={{ display: 'block', marginBottom: '5px' }}>{product.name}</strong>
                <img 
                  src={product.image?.url || defaultProfileImage} 
                  alt={product.name} 
                  style={{ width: "80px", height: "80px", objectFit: 'cover', borderRadius: "8px" }} 
                />
                <p style={{ margin: '5px 0 0', fontSize: '0.8rem' }}>{product.category}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default WelcomeMap;