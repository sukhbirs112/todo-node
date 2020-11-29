// API Server for sending and receiving data related to the todo app


const apiHost = 'http://localhost:3000/';
const host = 'http://localhost:8080/';
const ngHost = 'http://localhost:4200/';

// Postgres pg pool
const { pool, AppUser, TodoItem } = require('./db/dbconnect');



// test
//Server Config
const express = require('express');
const app = express();
const { createProxyMiddleware } = require('http-proxy-middleware');
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


// Authentication Middleware
const authRestrictMiddleWare = (req, res, next) => {
	// 
	if (req.session.user && req.session.user.id) {
		return next();
	}
	else {
		res.redirect(`${host}login`);
	}
}

const authPromoteMiddleWare = (req, res, next) => {
	if (req.session.user && req.session.user.id) {
		res.redirect(`${host}todo`);
	}
	else {
		return next();
	}
}

// Ajax request only MiddleWare

const ajaxOnlyMiddleWare = (req, res, next) => {
	if (req.xhr) {
		return next();
	}
	else {
		// If not a ajax request, redirect user to home
		res.redirect(host);
	}
}

// import routes
const todoItemRouter = require('./routes/todoitem');





// configure universal middleware
app.use((req, res, next) => {
	res.set('Access-Control-Allow-Origin', host);
	res.set('Access-Control-Allow-Headers', 'Content-Type, csrf-token');
	return next();
});



// Configure routes

app.use('/api/todo', ajaxOnlyMiddleWare, authRestrictMiddleWare, todoItemRouter);

app.get('/api/tododb', (req, res) => {
	// This is test api to test if the db is running and the backend server is connected to it.
	pool.query('SELECT current_date;').then(function (dbres) {
		res.status(200).json({ dbres: dbres.rows });
	}).catch((err) => {
		res.status(200).json({ err: err, msg: typeof (err) });
	});
});

app.get('/api/csrf', ajaxOnlyMiddleWare, csrfProtection, (req, res) => {
	let csrfToken = req.csrfToken();
	res.status(200).json({ csrf: csrfToken });
});


app.get('/api/user', ajaxOnlyMiddleWare, csrfProtection, authRestrictMiddleWare, (req, res) => {
	res.status(200).json({ success: true, username: req.session.user.username, msg: 'Username' });
 });


// LOGIN USER 
app.post('/api/login', ajaxOnlyMiddleWare, csrfProtection, (req, res) => {

	/* INPUTS
	 * REQUIRED:
	 * 	req.body.username // string username of the user to be created
	 *	req.body.password // string password of the user to be created
	*/

	/* OUTPUT
	 * returns a response object
	{
		// if the user is successfully logged in then true, else false
		success: true | false, 
		
		// UI friendly message from server.
		msg: 'string' | ''
	*/

	var username = req.body.username;
	var password = req.body.password;

	if (typeof (username) != 'string' || username.length == 0) {
		res.status(200).json({
			success: false,
			msg: 'You must provide a username.',
		});
		return;
	}

	if (typeof (password) != 'string' || password.length == 0) {
		res.status(200).json({
			success: false,
			msg: 'You must provide a password.',
		});
		return;
	}


	AppUser.getByUsername(username, (err, dbres) => {
		if (err) {
			res.status(200).json({
				success: false,
				msg: 'An error occured. You may try again. If this message repeats, then please contact support.',
			});
			return;
		}
		else {
			if (dbres.rowCount == 0) {
				res.status(200).json({
					success: false,
					msg: 'Incorrect username or password.',
				});
				return;
			}
			else if (dbres.rowCount == 1) {
				let user = dbres.rows[0];
				bcrypt.compare(password, user.password, (err, bcres) => {
					if (err) {
						res.status(200).json({
							success: false,
							msg: 'An error occured. You may try again. If this message repeats, then please contact support.',
						});
						return;
					}
					else {
						if (bcres) {
							req.session.user = { id: user.id, username: user.username };
							res.status(200).json({
								success: true,
								msg: 'Successfully Authenticated.',
							});
							return;
						}
						else {
							res.status(200).json({
								success: false,
								msg: 'Incorrect username or password.',
							});
							return;
						}
					}
				})
				return;
			}
			else if (res.rowCount > 1) {
				res.status(200).json({
					success: false,
					msg: 'An error occured. You may try again. If this message repeats, then please contact support.',
				});
				return
			}
		}
	});

});

// CREATE USER / Sign up a new user
app.post('/api/signup', ajaxOnlyMiddleWare, csrfProtection, (req, res) => {


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
		
		// UI friendly message from server.
		msg: 'string' | ''
	*/


	var username = req.body.username;
	var password = req.body.password;

	// frequently used error message(s)
	const msg = `There was an issue creating your account. You may try again. If this message repeats, then please contact support.`;

	// Validation of username is done via the add user function of the AppUser Model

	// Must validate username length and other requirements, Uniqueness will be done by database.

	// Must validate user unencrypted password length and other requirements
	if (password.length < AppUser.MIN_PASSWORD_LENGTH || password.length > AppUser.MAX_PASSWORD_LENGTH) {
		res.status(200).json({
			success: false,
			msg: `Passwords must be between ${AppUser.MIN_PASSWORD_LENGTH} and ${AppUser.MAX_PASSWORD_LENGTH} characters.`,
		});
		return;
	}

	bcrypt.hash(password, 8, (err, hash) => {
		if (err) {
			res.status(200).json({
				success: false,
				msg: msg,
			})
			return;
		}
		else {
			// Create User
			AppUser.add(username, hash, (err, dbres) => {
				if (err) {
					let errRes = { success: false };
					if (err.message.includes('unique')) {
						errRes.msg = `The username you entered is already in use.`;
					}
					else {
						errRes.msg = msg;
					}
					res.status(200).json(errRes);
					return;
				}
				else {
					// User is successfully added
					res.status(200).json({
						success: true,
						msg: 'Your account was successfully created.'
					});
					return;
				}
			});
			return;
		}
	});

});


app.get('/api/', ajaxOnlyMiddleWare, (req, res) => {
	res.status(200).json({ success: true, message: 'Hello world, this is api' });
	//res.status(404).send('404');
});




// CHECK AUTH / Check if a user has an authenticated session
app.get('/todo', authRestrictMiddleWare, createProxyMiddleware({
	target: ngHost, router: {
		'': `${ngHost}/todo`
	},
	changeOrigin: true
}));
app.get('/signup', authPromoteMiddleWare, createProxyMiddleware({
	target: ngHost, router: {
		'': `${ngHost}/signup`
	}
}));
app.get('/login', authPromoteMiddleWare, createProxyMiddleware({
	target: ngHost, router: {
		'': `${ngHost}/login`
	},
	changeOrigin: true
}));

// LOGOUT USER / log out a user
app.get('/logout', (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			res.redirect('http://localhost:8080/logout');
			return;
		}
		else {
			res.redirect('http://localhost:8080');
			return;
		}
	})
});



app.get('/', (req, res) => {
	res.status(404).send('404');
});

app.listen(port, () => {
	console.log(`Server running on port ${port}.`);
});

