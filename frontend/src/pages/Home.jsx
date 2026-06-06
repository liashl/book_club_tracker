import { useEffect, useState } from 'react';

import Help from '../components/help';
import { Link, useNavigate } from 'react-router-dom';
import {useProfile} from '../usercontext.jsx';


function Home( {backendURL} ) {

    let navigate = useNavigate();
    const {globalUser, onUserChange, globalAuth, onAuthChange} = useProfile();

    useEffect(() => {
        if (!globalAuth) {
            navigate('/login')
    }},[globalAuth, navigate]);


    return (
        <>
            <div className="pageTitle">
                <hr />
                <h1>Dashboard</h1>
                <hr />
            </div>

            <div className="homepageDescription">
                <Help pageRole={"home"} />
                <div className="dashboardChunk">
                    <Link to="/suggest"><span>Suggest a Book!</span></Link>
                </div>
                <div className = "dashboardChunk">
                    <Link to="/rank"><span>See Suggestions</span></Link>
                </div>
            </div>

        </>
    )
} export default Home;