import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {Icon} from 'react-icons-kit';
import {eyeOff} from 'react-icons-kit/feather/eyeOff';
import {eye} from 'react-icons-kit/feather/eye';
import "./LoginForm.css";
//import {launchUserContext} from '../App.jsx';
import {useProfile} from '../usercontext.jsx';

function LoginForm({backendURL}) {

    //const [currentUser, setCurrentUser] = launchUserContext();
    const {globalUser, onUserChange, globalAuth, onAuthChange} = useProfile();


    // initialize data variables
    const [formData, setFormData] = useState({
        user_name: '',
        org_id: '1',
        password: '',
    });

    const [coverPass, setCoverPass] = useState('password');

    //const [passToggle, setPassToggle] = useState('password');
    //const [icon, setIcon] = useState(eyeOff);

    let navigate = useNavigate();


    const handleToggle = () => {
        if (passToggle === 'password') {
            setIcon(eye);
            setPassToggle('text');
        }
        else {
            setIcon(eyeoff);
            setPassToggle('password');
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };


    const handleChangePword = (e) => {
        const { name, value} = e.target;
        console.log(name);
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        setCoverPass ( " " + "*".repeat(value.length));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const uname = formData['user_name'];

        try {


            const response = await fetch(backendURL + 'login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData),
            });

            const output = await response.json()
            console.log(output);
            
            // handle success logging in
            if (output["success"]) {
                // change the current user to the correct username
                onAuthChange(true);
                onUserChange(uname);
                navigate('/')
            }
            //setCurrentUser('changed user');
            // console.log(globalUser);
            // console.log(currentUser);
            // navigate('/')

        } catch (error) {
            console.error('Error during log-in form submission:', error);
        }
    };


    return (
        <form className="logForm" onSubmit={handleSubmit}>
            <div className="formContainer">

                <div className="formItem">
                    <label htmlFor="user_name">
                        <div className="formLabel">Username</div>
                        <div className="formInput">
                            <textarea 
                                autoFocus="true"
                                placeholder="username"
                                name="user_name"
                                id="user_name"
                                type="text"
                                value={formData.user_name}
                                rows={1}
                                maxLength={50}
                                onChange={handleChange}
                            />
                        </div>
                    </label>
                </div>

                <div className="formItem">
                    <label htmlFor="password">
                        <div className="formLabel">Password</div>
                        <div className="formInput password">
                            <textarea 
                                autoFocus="true"
                                placeholder=""
                                name="password"
                                id="password"
                                type="text"
                                value={formData.password}
                                rows={1}
                                maxLength={50}
                                onChange={handleChangePword}
                            />
                            <span className="passwordMask">
                            {coverPass}
                            </span>
                        </div>
                    </label>
                </div>
        
                <div className="formItem">

                        <button type="submit">Log In</button>
                </div>

            </div>       
        </form>
    );

} export default LoginForm;
