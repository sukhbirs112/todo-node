// Set of tests relating to the database models that can be run.

const async = require('async')
const { pool, AppUser, TodoItem } = require('./dbconnect');


// Set test table names
AppUser.setTableName('appusertest');
TodoItem.setTableName('todoitemtest');
TodoItem.setReferenceTableName(AppUser.APPUSER_TABLE_NAME);
// Table will be removed at end or if error occurs in testing.

// Test Steps
// - Check if appuser table exists
// - if exists, drop table
// - Check if todoitem table exists
// - if exists, drop table

// - Create appuser table
// - Check if appuser table exists
// - Create todoitem table
// - Check if todoitem table exists

// - Add 2 test users
// - Check If users were created
// - Add TodoItems for first user
// - Check if TodoItems were created
// - 
// - Try to add some rows that violate constaints
// - Use all functions that do a query that returns a single or few rows
// - Get Count of rows
// - Do query that gets all rows and comapre to count
// - Drop table
// - Check to make sure table had been dropped


async.waterfall([

	(cb) => {
		console.log('- Check if todoitem table exists already');
		TodoItem.existsTable((err, exists, res) => {
			if (err) {
				cb(err);
			}
			else {
				if (exists) {
					console.log(`Table ${TodoItem.TODOITEM_TABLE_NAME} exists.`);
				}
				else {
					console.log(`Table ${TodoItem.TODOITEM_TABLE_NAME} does not exist.`);
				}
				cb(null, exists);
			}
		});
	},
	(exists, cb) => {

		if (exists) {
			TodoItem.dropTable((err, res) => {
				if (err) {
					cb(err, null);
				}
				else {
					console.log(`DROP TABLE ${TodoItem.TODOITEM_TABLE_NAME}`);
					cb(null);
				}
			});
		}
		else {
			cb(null);
		}

	},
	(cb) => {
		console.log('- Check if appuser table exists already');
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
			AppUser.dropTable((err, res) => {
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
		console.log('- Try to create appuser table');
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
		console.log('- Check if appuser table exists')
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
		console.log('- Try to create todoitem table');
		TodoItem.createTable((err, res) => {
			if (err) {
				cb(err);
			}
			else {
				console.log(`Table ${TodoItem.TODOITEM_TABLE_NAME} Created.`);
				cb(null);
			}
		});
	},
	(cb) => {
		console.log('- Check if todoitem table exists')
		TodoItem.existsTable((err, exists, res) => {
			if (err) {
				cb(err);
			}
			else {
				if (exists) {
					console.log(`Table ${TodoItem.TODOITEM_TABLE_NAME} exists.`);
					cb(null);
					return;
				}
				else {
					console.log(`Table ${TodoItem.TODOITEM_TABLE_NAME} does not exist.`);
					cb(new Error('The table that should have been created cannot be found.'));
					return;
				}
			}
		});
	},




	(cb) => {
		console.log('- Attempt adding a row (1), user test 1');
		AppUser.add('test 1', 'test_pass1', (err, res) => {
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
		console.log('- Attempt adding a row (2), user test 2');
		AppUser.add('test 2', 'test_pass2', (err, res) => {
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
		console.log('- Add todoitem to user test 2');
		TodoItem.add(2, 'title 1', 'description 1', false, (err, res) => {
			if (err) {
				cb(err);
			}
			else {
				console.log('title: title 1, description: description 1');
				cb(null)
			}
		});
	},
	(cb) => {
		console.log('- Add todoitem to user test 2');
		TodoItem.add(2, 'title 2', 'description 2', false, (err, res) => {
			if (err) {
				cb(err);
			}
			else {
				console.log('title: title 2, description: description 2');
				cb(null)
			}
		});
	},
	(cb) => {
		console.log('- Add todoitem to user test 1');
		TodoItem.add(1, 'title 3', 'description 3', false, (err, res) => {
			if (err) {
				cb(err);
			}
			else {
				console.log('title: title 3, description: description 3');
				cb(null)
			}
		});
	},
	


	(cb) => {
		console.log('- Find TodoItem By Id');
		TodoItem.getById(1, (err, res) => {
			if (err) {
				cb(err);
			}
			else {
				if (res.rowCount == 0) {
					cb(new Error(`Could not find todoitem`));
				}
				else {
					console.log(`User found: ${res.rowCount > 0} (expected to be true)`);
					cb(null);
				}
			}
		});
	},

	(cb) => {
		console.log('- Get Count');
		TodoItem.count((err, count, res) => {
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
		TodoItem.all((err, res) => {
			if (err) {
				cb(err);
			}
			else {
				if (res.rowCount != count) {
					cb(new Error('Count of users does not match count of rows returned.'));
				}
				else {
					console.log(`Count of users matches count of rows returned. (${count})`);
					cb(null);
				}
			}
		})
	},
	(cb) => {
		console.log('- Get All Rows for user test 2');
		TodoItem.allForUser(2, (err, res) => {
			if (err) {
				cb(err);
			}
			else {
				if (res.rowCount != 2) {
					cb(new Error('Incorrect number of rows returned.'));
				}
				else {
					console.log(`Correct number of rows returned. (${res.rowCount})`);
					cb(null);
				}
			}
		})
	},

	(cb) => {
		TodoItem.dropTable((err, res) => {
			if (err) {
				cb(err, null);
			}
			else {
				console.log(`DROP TABLE ${TodoItem.TODOITEM_TABLE_NAME}`);
				cb(null);
			}
		});
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
	}


],
	(err, result) => {
		if (err) {
			throw err;
		}
		else {
			console.log('Test Executed without Errors.');
		}
		pool.end(() => { console.log('pool closed.'); });
	});


process.on('beforeExit', (code) => {
	pool.end(() => { console.log('pool closed.'); });
});
