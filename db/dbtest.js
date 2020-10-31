// Set of tests relating to the database models that can be run.

const async = require('async')
const { pool, AppUser } = require('./dbconnect');


// Set a test table name
AppUser.setTableName('appusertest');
// Table will be removed at end or if error occurs in testing.

// Test Steps
// - Check if table exists
// - if exists, drop table
// - Create table
// - Check if table exists, err if it does not
// - Add some test rows
// - Try to add some rows that violate constaints
// - Use all functions that do a query that returns a single or few rows
// - Get Count of rows
// - Do query that gets all rows and comapre to count
// - Drop table
// - Check to make sure table had been dropped


async.waterfall([

	// Check if table exists
	(cb) => {
		console.log('- Check if table exists already');
		AppUser.existsTable((err, exists, res) => {
			if (err) {
				cb(err);
			}
			else {
				if (exists) {
					console.log(`Table ${AppUser.APPUSER_TABLE_NAME} exists.`);	
				}
				else {
					console.log(`Table ${AppUser.APPUSER_TABLE_NAME} does not exist.`);
				}
				cb(null, exists);
			}
		});
	},
	(exists, cb) => {

		if (exists) {
			AppUser.dropTable((err, res)=>{
				if (err) {
					cb(err, null);
				}
				else {
					console.log(`DROP TABLE ${AppUser.APPUSER_TABLE_NAME}`);
					cb(null);
				}
			});	
		}
		else {
			cb(null);
		}
	
	},
	(cb) => {
		console.log('- Try to create table');
		AppUser.createTable((err, res) => {
			if (err) {
				cb(err);
			}
			else {
				console.log(`Table ${AppUser.APPUSER_TABLE_NAME} Created.`);
				cb(null);
			}
		});
	},
	(cb) => {
		console.log('- Check if table exists')
		AppUser.existsTable((err, exists, res) => {
			if (err) {
				cb(err);
			}
			else {
				if (exists) {
					console.log(`Table ${AppUser.APPUSER_TABLE_NAME} exists.`);	
					cb(null);
					return;
				}
				else {
					console.log(`Table ${AppUser.APPUSER_TABLE_NAME} does not exist.`);
					cb(new Error('The table that should have been created cannot be found.'));
					return;
				}
			}
		});
	},
	(cb) => {
		console.log('- Attempt adding a row (1)');
		AppUser.add('test 1','test_pass1', (err, res) => {
			if (err) {
				cb(err);
			}
			else {
				console.log('User Added');
				cb(null);
			}
		});
	},
	(cb) => {
		console.log('- Attempt adding a row (2)');
		AppUser.add('test 2','test_pass2', (err, res) => {
			if (err) {
				cb(err);
			}
			else {
				console.log('User Added');
				cb(null);
			}
		});
	},
	(cb) => {
		console.log('- Attempt adding a row (3)');
		AppUser.add('test 3','test_pass3', (err, res) => {
			if (err) {
				cb(err);
			}
			else {
				console.log('User added');
				cb(null);
			}
		});
	},
	(cb) => {
		console.log('- Attempt adding a row that violates constraint: duplicate username (4)');
		AppUser.add('test 3','test_pass4', (err, res) => {
			if (err) {
				console.log('Constraint violated, as expected');
				cb(null);
			}
			else {
				console.log('User added when they should now have been');
				cb(new Error('User with duplicate name added'));
			}
		});
	},
	(cb) => {
		console.log('- Attempt adding a row that violates constraint: username min length (5)');
		AppUser.add('tes','test_pass4', (err, res) => {
			if (err) {
				console.log('Constraint violated, as expected');
				cb(null);
			}
			else {
				cb(new Error('User with username length less than allowed.'));
			}
		});
	},
	(cb) => {
		console.log('- Attempt adding a row that violates constraint: username max length (6)');
		AppUser.add('test 1234567891234567','test_pass6', (err, res) => {
			if (err) {
				console.log('Constraint violated, as expected');
				cb(null);
			}
			else {
				cb(new Error('User with username length more than allowed.'));
			}
		});
	},
	(cb) => {
		console.log('- Find User By Id');
		AppUser.getById(2,(err, res) => {
			if (err) {
				cb(err);
			}
			else {
				if (res.rowCount != 1) {
					cb(new Error('Failed to find a user.'));
				}
				else {
					console.log(`User ${res.rows[0].id} ${res.rows[0].username}`);
					cb(null)
				}
			}
		});
	},
	(cb) => {
		console.log('- Find User By Id');
		AppUser.getById(4,(err, res) => {
			if (err) {
				cb(err);
			}
			else {
				if (res.rowCount != 0 ) {
					cb(new Error('A row has been found when is should not have been.'));
				}
				else {
					console.log(`User found: ${ res.rowCount > 0 } (expected to be false)`);
					cb(null);
				}
			}
		});
	},
	(cb) => {
		console.log('- Find User by username');
		AppUser.getByUsername('test 3',(err, res) => {
			if (err) {
				cb(err);
			}
			else {
				if (res.rowCount != 1) {
					cb(new Error('Failed to find user.'));
				}
				else {
					console.log(`User ${res.rows[0].id} ${res.rows[0].username}`);
					cb(null);
				}
			}
		});
	},
	(cb) => {
		console.log('- Find User by username');
		AppUser.getByUsername('test 4',(err, res) => {
			if (err) {
				cb(err);
			}
			else {
				if (res.rowCount != 0) {
					cb(new Error('Found a user that should not have been found.'));
				}
				else {
					console.log('No row found for a non-existent user');
					cb(null);
				}
			}
		});
	},
	(cb) => {
		console.log('- Find User name by matching a string');
		AppUser.getByUsernameContains('est',(err, res) => {
			if (err) {
				cb(err);
			}
			else {
				if (res.rowCount != 3) {
					cb(new Error('Did not find all matching rows'));
				}
				else {
					console.log('All matching rows found.');
					cb(null);
				}
			}
		});
	},
	(cb) => {
		console.log('- Get Count');
		AppUser.count((err, count, res) => {
			if (err) {
				cb(err);
			}
			else {
				if (count != 3) {
					cb(new Error('Count is incorrect'));
				}
				else {
					console.log(`Count of all users: ${count}`);
					cb(null, count);
				}
			}
		});
	},
	(count, cb) => {
		console.log('- Get All Rows');
		AppUser.all((err, res)=>{
			if (err) {
				cb(err);
			}
			else {
				if (res.rowCount != count) {
					cb(new Error('Count of users does not match count of rows returned.'));
				}
				else {
					console.log('Count of users matches count of rows returned.');
					cb(null);
				}
			}
		})
	},
	(cb) => {
		AppUser.dropTable((err, res) => {
			if (err) {
				cb(err, null);
			}
			else {
				console.log(`DROP TABLE ${AppUser.APPUSER_TABLE_NAME}`);
				cb(null);
			}
		});	
	},
],
	(err, result) => {
		if (err) {
			throw err;
		}
		else {
			console.log('Test Executed without Errors.');
		}
		pool.end(()=>{console.log('pool closed.');});
});


process.on('beforeExit', (code) => {
	pool.end(()=>{console.log('pool closed.');});
});
