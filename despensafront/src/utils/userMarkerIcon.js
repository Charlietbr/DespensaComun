import L from "leaflet";
import { defaultProfileImage } from "../config/constants";
import '../components/MainComponents/Form.css'

export const createUserIcon = (mapImage, role) => {
  const borderColor = role === "admin" ? "#fa9b15" : "#347cc9";

  return L.divIcon({
    className: "thumbnail-s",
    html: `

        <img class="thumbnail-s"
          src="${mapImage || defaultProfileImage}" 
          style="width:100%;height:100%;object-fit:cover; border: 3px solid ${borderColor};"
        />

    `,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48],
  });
};
