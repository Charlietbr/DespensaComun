import React from 'react'
import { defaultGroupImage } from '../../../config/constants'
import './Thumbnail.css'



const Thumbnail = ( {size = 's', src, alt} ) => {

    const image = src || defaultGroupImage;
    const name = alt || "Thumbnail";

    return (
        <img className={`thumbnail-${size}`} src={image} alt={name}/>
  )
}

export default Thumbnail
