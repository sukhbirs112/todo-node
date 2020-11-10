// API Server for sending and receiving data related to the todo app
// 

// Postgres pg pool
const { pool, AppUser } = require('./db/dbconnect');


// test
//Server Config
const express = require('express');
const app = express();
const port = 3000;

// Configure Cookie Parser
const cookieParser = require('cookie-parser')
app.use(cookieParser());

// Configure Session Storage
const session = require('express-session');
const MemoryStore = require('memorystore')(session);

app.use(session({
	cookie: { maxAge: 86400000 },
	store: new MemoryStore({
		checkPeriod: 86400000 // prune expired entries every 24h
	}),
	resave: false,
	saveUninitialized: true,
	secret: 'keyboard cat'
}));

// configure csrf security
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });


// use request body parsing middleware to parse json
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// require bcrypt to encrypt passwords
const bcrypt = require('bcryptjs');




app.use((req, res, next) => {
	res.set('Access-Control-Allow-Origin', 'http://localhost:8080');
	res.set('Access-Control-Allow-Headers', 'Content-Type, csrf-token');
	return next();
});

app.get('/api/tododb', (req, res) => {
	// This is test api to test if the db is running and the backend server is connected to it.
	pool.query('SELECT current_date;').then(function (dbres) {
		res.status(200).json({ dbres: dbres.rows });
	}).catch((err) => {
		console.log(err);
		res.status(200).json({ err: err, msg: typeof (err) });
	});
});

app.get('/api/csrf', csrfProtection, (req, res) => {
	let csrfToken = req.csrfToken();
	res.status(200).json({ csrf: csrfToken });
	console.log(`csrf: ${csrfToken}`);
});

// CREATE USER / Sign up a new user
app.post('/api/signup', /*csrfProtection,*/(req, res) => {
	console.log(req.session);
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
		
		// Error Mesage to be shown on flash message.
		em: 'string' | ''

		ec:  Error Code used for debugging.
		ec: 'string' | ''
	*/


	var username = req.body.username;
	var password = req.body.password;

	// Testing if username and password from request are correct.
	/* console.log(`${username} ${password}`);
	res.status(200).json({ username: username, password: password });
	return; */

	// frequently used error message(s)
	const em = `There was an issue creating your account. Try again. If this message repeats, then please contact support.`;

	// Validation of username is done via the add user function of the AppUser Model

	// Must validate username length and other requirements, Uniqueness will be done by database.

	// Must validate user unencrypted password length and other requirements
	if (password.length < AppUser.MIN_PASSWORD_LENGTH || password.length > AppUser.MAX_PASSWORD_LENGTH) {
		res.status(200).json({
			success: false,
			em: `Passwords must be between ${AppUser.MIN_PASSWORD_LENGTH} and ${AppUser.MAX_PASSWORD_LENGTH} characters.`,
			// Password length does not meet requirements
			ec: 'pl'
		});
		return;
	}

	bcrypt.hash(password, 8, (err, hash) => {
		if (err) {
			res.status(200).json({
				success: false,
				em: em,
				// hashing the user's password failed
				ec: 'hf'
			})
			return;
		}
		else {
			// Create User
			AppUser.add(username, hash, (err, dbres) => {
				if (err) {
					let errRes = { success: false };
					if (err.message.includes('unique')) {
						errRes.em = `The username you entered is already in use.`;
						errRes.ec = 'u'
					}
					else {
						errRes.em = em;
						// other error when adding user
						errRes.ec = 'o'
					}

					res.status(200).json(errRes);
					return;
				}
				else {
					// User is successfully added
					res.status(200).json({
						success: true,
						em: '',
						ec: '',
					});
					return;
				}
			});
			return;
		}
	});

});


app.get('/api/', (req, res) => {
	res.status(200).json({ success: true, message: 'Hello world, this is api' });
	//res.status(404).send('404');
});



app.get('/', (req, res) => {
	res.status(404).send('404');
});

app.listen(port, () => {
	console.log(`Server running on port ${port}.`);
});

