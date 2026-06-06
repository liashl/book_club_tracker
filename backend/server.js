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

/*
*	GET: DIAGNOSTIC INFORMATION FOR DATABASE CONNECTION
*		- Can be used to verify that the Bookclub Builder is running
*/
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

/*
*	GET: INDIVIDUAL SUGGESTION (for editing purposes)
*/
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

/* 
*	POST: BOOK SUGGESTIONS INPUT (Target: Bookclub Builder database)
*/
app.post('/suggest/create', async function (req,res) {
	try {
		// parse data from frontend
		let data = req.body;

		const test_club = 2;
		const test_reader = 1;

		// validate data & filter
		// TODO: this was our other small pool microservice!

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

/*
*	GET: DATA TO RANK (Target: Bookclub Builder database)
*		- provides randomly-ordered lists of book suggestions for Rank page
*/
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

/*
*	POST: USER AUTHENTICATION INFORMATION (Target: User authentication microservice)
*		- allows bookclub members to register for the site
*/
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

/*
*	POST: LOGIN TO THE SITE (Target: User Authentication microservice)
*/
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
		console.error("Error executing /login", error);
		res.status(500).send("An error occured connecting to user-auth service (route: /login")
	}
})

/* 
*	POST: Create a new ranker data object to track book choice changes (Target: ranker microservice)
*/
app.post('/ranker/create', async (req, res) => {

	try {

		const ranker_host = `http://${process.env.RANKER_HOST}:${process.env.RANKER_PORT}`;

		const data = await req.body;
		const order_keyword = 'row';
		const index_keyword = 'suggestionID';

		const request_object = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				records: data,
				order_keyword: order_keyword,
				index_keyword: index_keyword
			})
		};
		const compiled = await request_object;
		
		//console.log(compiled);

		const response = await fetch(ranker_host + '/', compiled);

		const output = await response;
		res.status(output.status).json({'success':true})
		console.log(output);

	} catch (error) {
		console.error("Error executing '/ranker/create'", error);
		res.status(500).send({"message":"An error occurred connecting to the ranker service"})
	}

})

/*
*	POST: record ranking movement from one position to another (Target: ranker microservice)
*/
app.post('/ranker/move', async (req, res) => {
	try {

		// baseURL for the ranker microservice
		const ranker_host = `http://${process.env.RANKER_HOST}:${process.env.RANKER_PORT}`;

		const data = await req.body;
		//console.log(data);
		const response = await fetch(ranker_host + '/move', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});

		const output = await response;
		//console.log(output);
		res.status(200).json({'success':true});

	} catch (error) {
		console.error("Error executing /ranker/move", error);
		res.status(500).send("An error occurred while connecting to the ranker service")
	}

})


/*
*	GET: list of changes from the active ranking session
*		- can be used to create a poll
*/
app.get('/ranker/changes', async (req, res) => {
	try {

		// baseURL for the ranker microservice
		const ranker_host = `http://${process.env.RANKER_HOST}:${process.env.RANKER_PORT}`;

		const response = await fetch(ranker_host + '/changes', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			} 
		});

		const output = await response;
		const json_output = await output.json();
		console.log(json_output);

		for (const change of json_output) {

			// build sql query
			store_change_query = "CALL changes_add_new(?,?);";
			const suggestion = change['suggestionID'];
			const chg = change['change'];

			const [fields] = await db.query(store_change_query, [suggestion, chg]);
			console.log(fields);
		}
		res.status(200).json(json_output);

	} catch (error) {
		console.error("An error occurred while connecting to the rnaker service: /changes:", error);
		res.status(500).send("An error occurred while connecting to the ranker service: /changes");
	}
})

/*
*	GET: get the top books recorded by ranking sessions for a poll (Bookclub Builder database)
*		- this provides us with the titles that we pass to microservice to build the poll 
*/
app.get('/poll', async (req, res) => {

	try {
	// TODO: enable different clubs
	const top_books_query = "call get_top_books(2);";

	// query database and call stored procedure
	const [top_books] = await db.query(top_books_query);


	res.status(200).json(top_books);

	} catch (error) {
		console.error("An error occurred querying for top books", error);
		res.status(500).json({"message":"error: poll"});
	}
});

/*
*	POST: Latest poll data (Calls poll microservice to get latest votes)
*/
app.post('/poll/review', async (req, res) => {

	try {

		my_poll = 2;
	
		const poll_host = `http://${process.env.POLL_HOST}:${process.env.POLL_PORT}`;

		const poll_info = await fetch(poll_host + '/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				'myAnswer': {
					my_pollID: my_poll
				}
			})
		});
		console.log(poll_info);

		const results = await poll_info.json();
		const output = results['data'][0];
		res.status(200).json({output})

	} catch (error) {
		console.error("An error occurred getting latest poll info", error)
		res.status(500).json({"message": "error getting poll info"})
	}

	

});

/*
*	POST: increments the count for a given poll option by one count (poll microservice)
*/
app.post('/poll/vote', async (req,res) => {
	try {

		data = await req.body;
		console.log(data);
		const answer = await data['myAnswer'];
		console.log(answer);


		const poll_host = `http://${process.env.POLL_HOST}:${process.env.POLL_PORT}`;

		const poll_info = await fetch(poll_host + '/vote', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				'myAnswer': answer
			})
		});

		const results = await poll_info.json();

		res.status(200).json({results});
	} catch (error) {

		console.error("An error occurred submiting vote", error)
		res.status(500).json({"message": "error submitting vote"})
	}

})

/*
*	POST: Creates a new poll (poll microservice)
* 		- This method also calls the local database to get the books to include
*/
app.post('/poll/create', async (req,res) => {
	try {

	// get local books to include in the call
	const top_books_query = "call get_top_books(2);";

	// query database and call stored procedure
	const [[top_books]] = await db.query(top_books_query);
	output = await top_books;
	console.log(top_books);

	const question = "What book should we read next?";
	answer1 = await output[0]['title'];
	answer2 = await output[1]['title'];
	answer3 = await output[2]['title'];
	answer4 = await output[3]['title'];

	console.log(answer4);
	
	// talk to poll microservice

	const poll_host = `http://${process.env.POLL_HOST}:${process.env.POLL_PORT}`;
	//console.log(poll_host);
	
	const poll_info = await fetch(poll_host + '/create', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			question: question,
			answer1: answer1,
			answer2: answer2,
			answer3: answer3,
			answer4: answer4
		})
	});
	
	response = await poll_info.json();
	results = await response['result'][0];
	output = await results;
	//console.log(results);

	res.status(200).json({output});

	} catch (error) {
		console.error("An error occurred connecting to poll microservice for /poll/create", error);
		res.status(500).json({"message": "error: poll/create"});
	}
})

/*
*	GET: grab the latest information from the tracker microservice
*/
app.get('/tracker', async (req,res) => {


	try {
		const tracker_host = `http://${process.env.TRACKER_HOST}:${process.env.TRACKER_PORT}`;

		const response = await fetch(tracker_host + '/', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
		}});

		const output = await response;
		const json_output = await output.json();
		console.log(json_output);

		res.status(200).json({json_output});

	} catch (error) {
		console.error(error);
		res.status(500).json({"message": "error: poll/create"});
	}
});

/*
*	POST: switch a checkmark on or off in the tracker microservice
*/
app.post('/tracker', async (req,res) => {

	try {
		const tracker_host = `http://${process.env.TRACKER_HOST}:${process.env.TRACKER_PORT}`;
		data = await req.body;
		const node_to_check = await data['name_to_check'];

		console.log(node_to_check);

		const response = await fetch(tracker_host + '/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				'name_to_check': node_to_check
			})
		});

		const output = await response;
		console.log(output);
		const json_output = await output.json();
		console.log(json_output);

		res.status(200).json({json_output});

	} catch (error) {
		res.status(500).json({"message": "error: poll/create"});
		console.error(error);
	}
});



app.listen(PORT, function() {
	console.log('Express started on http://localhost:' + PORT + '; press Cntrl-C to terminate');
});