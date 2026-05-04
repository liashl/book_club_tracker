import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import "./Navigation.css";

function Navigation() {

    // showMenu true if mobile (hamburger) menu should display
    const [showMenu, setShowMenu] = useState(false);

    return (
        <nav>
            <span className="welcome">Welcome TestUser</span>
            <div className="menu" onClick={ () => {
                setShowMenu(!showMenu);
            }}>
                <span></span>
                <span></span>
                <span></span>   
            </div>
            <ul className={ showMenu ? "open" : ""}>
                <li>
                    <NavLink to="/" onClick={ () => {
                        setShowMenu(false);
                    }}>Home</NavLink>
                </li>
                <li>
                    <NavLink to="/suggest" onClick={ () => {
                        setShowMenu(false);
                    }}>Suggest</NavLink>
                </li>
                <li>
                    <NavLink to="/rank" onClick = { () => {
                        setShowMenu(false);
                    }}>Rank</NavLink>
                </li>
            </ul>
        </nav>
    )
} export default Navigation;