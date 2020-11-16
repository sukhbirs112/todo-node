const { json } = require('body-parser');
const express = require('express');

const router = express.Router();

// Postgres pg pool
const { pool, AppUser, TodoItem } = require('../db/dbconnect');

router.get('/test', (req, res) => {
    res.status(200).json({
        yoyo: 'yo... yo?'
    });
});


// Get All TodoItems for a logged in user.
router.get('/get', (req, res) => {

    let id = req.session.user.id;
    TodoItem.allForUser(id, (err, dbres) => {
        if (err) {
            res.status(200).json({
                success: false,
                msg: 'Failed to load TodoItems'
            });
        }
        else {
            res.status(200).json({
                success: true,
                msg: 'Successfully loaded TodoItems',
                todoItems: dbres.rows,
                count: dbres.rowCount
            });
        }
    });
});

router.post('/add', (req, res) => {
    console.log('post /api/todo/add');
    let appuserid = req.session.user.id;
    let title = req.body.title;
    let description = req.body.description;
    let complete = req.body.complete;

    TodoItem.add(appuserid, title, description, complete, (err, dbres) => {
        if (err) {
            res.status.json({
                success: false,
                msg: 'Failed to add TodoItem'
            });
            return;
        }
        else {
            if (dbres.rowCount != 1 || !dbres.rows[0].id) {
                res.status.json({
                    success: false,
                    msg: 'Failed to add TodoItem'
                });
                return;
            }
            else {
                res.status(200).json({
                    success: true,
                    msg: 'TodoItem successfully added',
                    id: dbres.rows[0].id,
                    datecreated: dbres.rows[0].datecreated
                });
                return;
            }
        }
    });
});


router.post('/update', (req, res) => {

    let appuserid = req.session.user.id;
    // id of todo item
    let id = req.body.id;
    let title = req.body.title;
    let description = req.body.description;
    let complete = req.body.complete;

    TodoItem.update(id, appuserid, title, description, complete, (err, dbres) => {
        if (err) {
            res.status.json({
                success: false,
                msg: 'Failed to update TodoItem'
            });
            return;
        }
        else {
            res.status(200).json({
                success: true,
                msg: 'TodoItem successfully updated',
                rows: dbres.rows
            });
            return;
        }
    });
});

module.exports = router;