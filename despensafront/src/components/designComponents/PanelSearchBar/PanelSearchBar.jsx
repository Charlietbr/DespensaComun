import React from 'react'

const PanelSearchBar = ({placeholder=`buscar...`, emitSearch}) => {


  return (
    <div className='panel-search-bar' >
      <input  type="search" 
              placeholder={placeholder}
              onChange={(e) => emitSearch(e.target.value)}
              style={{color: "var(--line-link-color)"}}>
      </input>
      
    </div>
  )
}

export default PanelSearchBar