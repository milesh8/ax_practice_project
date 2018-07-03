var express = require('express');
var pg = require('pg');
var path = require('path');
var validate = require('jsonschema').validate;
var moment = require('moment-timezone');
var request = require('request');

var router = express.Router();

var sample_url = "https://jsonplaceholder.typicode.com/posts";

//example json object array
var json_ex;

request({
    url: sample_url,
    json: true
}, function(err, resp, body) {
    json_ex = body;
});



//schema to validate
var schema = {
    "id": "/simpleScribe",
    "type": "object",
    "properties": {
        "scribe_id": {"type": "integer"},
        "scribe_name": {"type": "string"},
        "scribe_email": {"type": "string"},
        "partner_name": {"type": "string"},
        "login_time": {"type": "string"},
        "browser": {"type": "string"},
        "join_time": {"type": "string"},
        "last_activity": {"type": "string"},
        "user_type": {"type": "string"},
        "doctor_name": {"type": "string"},
        "doctor_email": {"type": "string"}
    }
};

var practice_schema ={
    "id": "/simpleSample",
    "type": "object",
    "properties": {
        "userId": {"type": "integer"},
        "id": {"type": "integer"},
        "title": {"type": "string"},
        "body": {"type": "string"}
    }
};

//insert json into database
function insert_json(json) {
    //get date
    var local = 'America/Los_Angeles';
    var d = moment(new Date());
    d = d.tz(local).format('YYYY-MM-DD HH:mm:ss');

    //connect to database
    var pool = connect_db();

    //insert the date and json into the table
    pool.query("INSERT INTO scribes (ts, data) VALUES('" + d + "', '" + JSON.stringify(json) + "');", function (err, res) {
        console.log(err, res);
        pool.end();
    });
}

//insert practice json into database
function insert_sample_json(json) {
    //get date
    var local = 'America/Los_Angeles';
    var d = moment(new Date());
    d = d.tz(local).format('YYYY-MM-DD HH:mm:ss');

    //connect to database
    var pool = connect_db();

    //insert the date and json into the table
    pool.query("INSERT INTO practice (ts, data) VALUES('" + d + "', '" + JSON.stringify(json) + "');", function (err, res) {
        console.log(err, res);
        pool.end();
    });
}

//connect to postgres and axpractice db
function connect_db() {
    const pool = new pg.Pool({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'axpractice',
        password: 'password',
        port: '5432'
    });

    return pool;
}

//validate json and insert
router.post('/add', function(req, res) {
    var success = false;
    for (var i = 0; i < json_ex.length; ++i) {
        var validator = validate((json_ex[i]), schema);
        if (validator.errors.length === 0) {
            //insert json into postgres db
            insert_json(json_ex[i]);
            success = true;
        }
        else {
            for (var err_msg_index = 0; i < validator.length; ++err_msg_index) {
                console.log(validator[err_msg_index]);
            }
            success = false;
        }
    }
    if (success) {
        res.send("Successful Insert")
    }

});

//insert sample data
router.post('/add_sample', function(req, res) {
    var success = false;
    for (var i = 0; i < json_ex.length; ++i) {
        var validator = validate((json_ex[i]), practice_schema);
        if (validator.errors.length === 0) {
            //insert json into postgres db
            insert_sample_json(json_ex[i]);
            success = true;
        }
        else {
            for (var err_msg_index = 0; i < validator.length; ++err_msg_index) {
                console.log(validator[err_msg_index]);
            }
            success = false;
        }
    }
    if (success) {
        res.send("Successful Insert")
    }

});

//get query results
router.get('/get', function (req, res) {
    var pool = connect_db();
    var query = decodeURIComponent(req.query.query);

    pool.query("SELECT data FROM scribes WHERE data->>" + query + ";", function(err, result) {
        if (err) throw err;
        res.json(result.rows);
    })
});

//get main page html
router.get('/', function(req, res) {
   res.sendFile(path.join(__dirname, '../views', 'index.html'))
});

module.exports = router;