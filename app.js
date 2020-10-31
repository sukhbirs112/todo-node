

// Postgres pg pool
const { pool, AppUser } = require('./db/dbconnect');
// test
//Server Config
const express = require('express');
const app = express();
const port = 3000;


// use request body parsing middleware
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// require bcrypt to encrypt passwords
const bcrypt = require('bcryptjs');


app.get('/api/tododb', (req,res) => {
	// This is test api to test if the db is running and the backend server is connected to it.
	pool.query('SELECT current_date;').then(function(dbres){
		res.status(200).json({dbres:dbres.rows});
	}).catch((err) => {
		console.log(err);
		res.status(200).json({err:err, msg:typeof(err)});
	});
});

// CREATE USER / Sign up a new user
app.post('/api/signup', (req, res) => {
	
	// Must be AJAX Request

	/* INPUTS
	 * REQUIRED:
	 * 	req.body.username // string username of the user to be created
	 *	req.body.password // string password of the user to be created
	*/

	/* OUTPUT
	 * returns a response object
	{
		// if the user is signed up successfully then true, else false
		success: true | false, 
		
		// if all applicable body params are valid then true, else false
		valid: true | false, 

		// if !valid then string is the name of the body param that failed validation, else ''
		invalidInputName: '' | 'username' | 'password',

		// if database error other than column contraint errors then true, else false
		// Innocuous name 'server' internally means 'database server error'
		// 
		server: true | false
	*/


	var username = req.body.username;
	var password = req.body.password;
	
	// Validation of username is done via the add user function of the AppUser Model
	
	// Must validate user unencrypted password
	const MIN_PASSWORD_LENGTH = 6
	if (password.length < MIN_PASSWORD_LENGTH) {
		res.status(200, {
			success: false,
			valid: false,
			invalidInputName: 'password',
			server: false
		});
	}



});


app.get('/api/', (req, res) =>{
	res.send('hello world this is api');
	//res.status(404).send('404');
});



app.get('/', (req, res) => {
	res.status(404).send('404');
});

app.listen(port, ()=>{
	console.log(`Server running on port ${port}.`);
});

