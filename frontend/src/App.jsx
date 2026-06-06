import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import { useState, useEffect } from 'react'; 
import { UserProvider } from './usercontext.jsx';

// TODO: Build Pages
import Home from './pages/Home';
import Suggest from './pages/Suggest';
import Rank from './pages/Rank';
import Login from './pages/Login';
import Poll from './pages/Poll';
import Tracker from './components/tracker';

// TODO: Build Navigation
import Navigation from './components/Navigation';
import Footer from './components/Footer';

// define the backend port for API requests
// TODO: move to .env file
const backendPort = 6057;
const backendURL = `http://localhost:${backendPort}/`;

//const userContext = React.createContext();
//function launchUserContext() {
//	const context = React.useContext(userContext);
//
//	if (!context) {
//		throw new Error("context error");
//	}
//
//	return context;
//};
// to use: <userContext.Provider value={value}>


function App() {
    const [trackerData, setTrackerData] = useState([]);

	const getTrackerData = async () => {

		try {
				const response = await fetch(backendURL + 'tracker', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json'
					}
				})

				const rows = await response.json();
				console.log(rows);
				setTrackerData(rows['json_output']);

		} catch (error) {
			console.error(error);
		}

	}

	useEffect( () => {
		getTrackerData();
	}, []);



	// store backend response
//	const [message, setMessage] = useState([])

//	const getData = async function () {

		// skip if data already fetched
//		if (message.length > 0) return;

//		try {
			// GET request to backend
//			const response = await fetch(backendURL);

			// convert to JSON
//			const rows = await response.json();

			// update message state with response data
//			setMessage(JSON.stringify(rows));

//		} catch (error) {
//			console.log(error);
//		}
//	};

	// load table on page load
//	useEffect(() => {
//		getData();
//	}, []);

//	const [currentUser, setCurrentUser] = useState(() => {
		// load from local storage
//		const saved_user = localStorage.getItem('user_info');
//console.log(saved_user);
//return saved_user ? JSON.parse(saved_user) : 'friend';
//);
//const value = [currentUser, setCurrentUser];

    // allow user profile to persist in local storage
    //useEffect(() => {
    //    localStorage.setItem('user_info', currentUser);
    //}, [currentUser]);




	return (
		<UserProvider>
			<Navigation />

			<div className="content-container">
				<div className="siteTitle">
					<h2>BOOKCLUB BUILDER</h2>
				</div>
				<Routes>
					<Route path= "/login" element = {<Login backendURL={backendURL} />}/>
					<Route path="/" element = {<Home />} backendURL = {backendURL} trackerData= {trackerData} />
					<Route path="/suggest" element = {<Suggest backendURL={backendURL} trackerData />} />
					<Route path="/rank" element = {<Rank backendURL={backendURL} />} />
					<Route path="/poll" element = {<Poll backendURL={backendURL} />} />
				</Routes>

	            <div className="tracker-holder">
                <Tracker backendURL={backendURL} trackerData={trackerData} updateTracker = {setTrackerData} />
            </div>
			</div>

		</UserProvider>
	);

} export default App;

