import React from 'react'
import peraTriste from '../../assets/img/icons/peras/pera_lost.png'
import Card from '../../components/designComponents/Card/Card'
import './NotFound.css'

const NotFound = () => {
  return (
    <div className='nf-card-container' >
            <Card title="Oh, no hemos encontrado la ruta que buscas...">
            <img className='nf-img' src={peraTriste} alt="No hemos encontrado la ruta que buscas" />
            </Card>
    </div>
  )
}

export default NotFound
