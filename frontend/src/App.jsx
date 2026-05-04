import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import { useState, useEffect } from 'react'; 

// TODO: Build Pages
import Home from './pages/Home';
import Suggest from './pages/Suggest';
import Rank from './pages/Rank';

// TODO: Build Navigation
import Navigation from './components/Navigation';
import Footer from './components/Footer';

// define the backend port for API requests
// TODO: move to .env file
const backendPort = 6057;
const backendURL = `http://localhost:${backendPort}/`;

function App() {

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

	return (
		<>
			<Navigation />

			<div className="content-container">
				<div className="siteTitle">
					<h2>BOOKCLUB BUILDER</h2>
				</div>
				<Routes>
					<Route path="/" element = {<Home />} />
					<Route path="/suggest" element = {<Suggest backendURL={backendURL} />} />
					<Route path="/rank" element = {<Rank backendURL={backendURL} />} />
				</Routes>
			</div>

		</>
	);

} export default App;
