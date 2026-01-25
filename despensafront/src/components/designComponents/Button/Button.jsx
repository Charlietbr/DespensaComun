import React from 'react'
import './Button.css'
import { ThemeContext } from '../../../context/ThemeContext'
import { useContext } from 'react'

const Button = (props) => {
    const { mode } = useContext(ThemeContext);

    /* clase de tema light - dark */
    const classes = `${props.className || ''} ${mode}`;

  return (
    <button type={props.type}
            onClick={props.onClick}
            disabled={props.disabled}
            className={classes}>

        {props.children}

    </button>
  )
}

export default Button
