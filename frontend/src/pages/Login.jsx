import { useState, useEffect } from 'react'; 

import LoginForm from '../components/LoginForm';
import Help from '../components/help';

function Login({backendURL}) {


    return (
        <>
            <div className="pageTitle">
                <hr />
                <h1>Log In</h1>
                <hr />
            </div>

            <div className="loginDescription">

                <Help pageRole={"login"} />
                <LoginForm backendURL = {backendURL} />
            </div>

        </>
    )
} export default Login;