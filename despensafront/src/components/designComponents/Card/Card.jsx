import React from 'react'
import './Card.css'

import { Link } from 'react-router-dom'

const Card = (props) => {


  return (
    <div className={`card ${props.category || ''}`} onClick={props.onClick} style={props.style}>
        <h4 className='title' >{props.title}</h4>

        <div className='cardContent'>
          {props.children}
        </div>


        { props.footerButton && (
        <footer>
            <Link to={`/${props.category}`}>...más</Link>
        </footer>
        )
        }

    </div>
  )
}

export default Card
