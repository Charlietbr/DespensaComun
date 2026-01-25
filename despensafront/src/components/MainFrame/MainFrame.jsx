import './MainFrame.css'

import React, { Children } from 'react'
import Card from '../designComponents/Card/Card'

const MainFrame = (props) => {
  return (
    <div className='main-frame'>

      {props.children}
    </div>
  )
}

export default MainFrame
