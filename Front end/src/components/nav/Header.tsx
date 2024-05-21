import React from 'react'

import './Header.css'

export default function Header() {

    return (
        <header id='app-header'>
            <span className='material-icons'>drawer</span>
            <nav>
                <h2>CircuBridge</h2>
                <div id='project-title'>
                    <span>Cycling- and pedestrian bridge</span>
                </div>
            </nav>
        </header>
    )
}
