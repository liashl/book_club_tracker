// connect to database
// citation: code adapted form boilerplate distributed as part of CS 340 at Oregon State University
const db = require('./db-connector');

//  instantiate express
const express = require('express');
const app = express();

const PORT = 6057;

// middleware
const cors = require('cors');
const req = require('express/lib/request');
app.use(cors({ credentials: true, origin: "*" }));
app.use(express.json());

// route handler
app.get('/', async (req, res) => {
	try {	
		// define queries
		const query1 = 'DROP TABLE IF EXISTS diagnostic;';
		const query2 = 'CREATE TABLE diagnostic(id INT PRIMARY KEY AUTO_INCREMENT, text VARCHAR(255) NOT NULL);';
		const query3 = 'INSERT INTO diagnostic (text) VALUES ("MySQL and React is working!")';
		const query4 = 'SELECT * FROM diagnostic;';

		// execute queries
		await db.query(query1);
		await db.query(query2);
		await db.query(query3);

		// get results
		const [rows] = await db.query(query4);

		// send back results in JSON
		res.status(200).json(rows);
	} catch (error) {
		console.error("Error executing queries:", error);
		// send generic error message to browser
		res.status(500).send("An error occurred executing database queries.");
	}
});

// GET data for suggest page
app.get('/suggest', async (req, res) => {
	try {

		// define query
		const query6 = "SELECT title, author, blurb FROM Suggestions WHERE suggestionID=?";
		const [fields] = await db.query(query6, 2);
		res.status(200).json(fields);

	} catch (error) {
		console.error('error getting single suggestion by ID: ', error);
		res.status(500).send("An error occurred executing database queries.");
	}
})

// POST data for suggest page
app.post('/suggest/create', async function (req,res) {
	try {
		// parse data from frontend
		let data = req.body;

		const test_club = 2;
		const test_reader = 1;

		// validate data & filter
		// TODO

		// create and execute queries
		const query7 = `CALL suggestions_add_one(?, ?, ?, ?, ?, @new_suggestion);`;


		const [[[rows]]] = await db.query(query7, [2,2, data.title, data.author, data.blurb]);
		//const [[[rows]]] = await db.query(query7, [
		//	test_reader,
		//	test_club,
		//	data.title,
		//	data.author,
		//	data.blurb
		//]);

		// console.log(rows);

		//console.log(`CREATE suggestion. ID: ${rows.new_suggestion}`);

		// send success status to frontend
		res.status(200).json({update_id: rows['new_id']});
	} catch (error) {
		console.error('Error executing queries:', error);
		//send generic error message to the browser
		res.status(500).send(
			'An error occurred while executing a database query.'
		);
	}
});


// GET data for rank page
app.get('/rank', async (req,res) => {
	try {
		//define queries
		const query5 = 'call suggestions_get_random(2);';

		// execute and get results
		const [suggestions] = await db.query(query5);
		res.status(200).json(suggestions);
	} catch (error) {
		console.error("Error executing queries:", error);
		res.status(500).send("An error occurred executing database query suggestions_get_random");
	}
});

// POST route for user_auth microservice: /register
app.post('/register', async (req, res) => {
	try {

		// extract variables from request
		const data = req.body;
		const username = data.user_name;
		const org_id = data.org_id;
		const password = data.password;

		// url with port for user-auth service
		const authURL = `http://${process.env.AUTH_HOST}:${process.env.AUTH_PORT}`;
		const response = await fetch(`${authURL}/register`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}, 
			body: JSON.stringify({
				"user_name": user_name,
				"organization_id_number": org_id,
				"password": password 
			})
		});
		output = await response.json()
		console.log(output);
		res.status(200).json(output);


	} catch (error) {
		console.error("Error executing /usertest", error);
		res.status(500).send("An error ocurred connecting to user-auth service");
	}
})

// POST route for user_auth microservice: login
app.post('/login', async (req, res) => {
	try {

		// extract variables from request
		const data = await req.body;
		const user_name = await data.user_name;
		const org_id = await data.org_id;
		const password = await data.password;

		console.log(JSON.stringify({
				"user_name": user_name,
				"organization_id_number": org_id,
				"password": password
			}));

		// url with port for user-auth service
		const authURL = `http://${process.env.AUTH_HOST}:${process.env.AUTH_PORT}`;
		const response = await fetch(`${authURL}/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}, 
			body: JSON.stringify({
				"user_name": user_name,
				"organization_id_number": org_id,
				"password": password
			})
		});
		output = await response.json()
		console.log(output);
		res.status(200).json(output);

	} catch (error) {
		console.error("Error executing /logintest", error);
		res.status(500).send("An error occured connecting to user-auth service (route: /login")
	}
})


// port to listen on
app.listen(PORT, function() {
	console.log('Express started on http://localhost:' + PORT + '; press Cntrl-C to terminate');
});
