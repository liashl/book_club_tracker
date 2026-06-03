import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import "./Navigation.css";
//import {launchUserContext} from '../App.jsx';
import {useProfile} from '../usercontext.jsx';

function Navigation() {

    // showMenu true if mobile (hamburger) menu should display
    const [showMenu, setShowMenu] = useState(false);

    // current username
    // const [currentUser, setCurrentUser] = launchUserContext();

    // unpack globalUser from context
    const {globalUser, onUserChange} = useProfile();


    return (
        <nav>
            <span className="welcome">Welcome {globalUser}</span>
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