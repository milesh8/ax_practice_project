var express = require('express');
var pg = require('pg');
var path = require('path');
var validate = require('jsonschema').validate;
var moment = require('moment-timezone');
var request = require('request');

var router = express.Router();

//can use VIZOR url as well.
var sample_url = "https://jsonplaceholder.typicode.com/posts";

//example json object array
var json_ex = [];


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
    },
    "required": ["scribe_id", "scribe_name", "scribe_email", "partner_time", "login_time", "browser", "join_time", "last_activity", "user_type", "doctor_name", "doctor_email"]
};

//schema to validate practice data
var practice_schema ={
    "id": "/simpleSampleData",
    "type": "object",
    "properties": {
        "userId": {"type": "integer"},
        "id": {"type": "integer"},
        "title": {"type": "string"},
        "body": {"type": "string"}
    },
    "required": ["userId", "id", "title", "body"]
};

//insert json into database
function insert_json(json) {
    //connect to database
    var pool = connect_db();

    //insert the date and json into the table
    pool.query("INSERT INTO scribes (ts, data) VALUES(current_timestamp, '" + JSON.stringify(json) + "');", function (err, res) {
        console.log(err, res);
        pool.end();
    });
}

//insert practice json into database
function insert_sample_json(json) {
    //connect to database
    var pool = connect_db();

    //insert the date and json into the table
    pool.query("INSERT INTO practice (ts, data) VALUES(current_timestamp, '" + JSON.stringify(json) + "');", function (err, res) {
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

router.post('/', function(req, res) {
    var user_json = JSON.parse("[" + req.body.user_json + "]");

    var success = false;
    for (var json_index = 0; json_index < user_json.length; ++json_index) {
        var validator = validate(user_json[json_index], practice_schema);

        if (validator.valid) {
            insert_sample_json(user_json[json_index]);
            success = true;
        }
        else {
            for (var err_msg_index = 0; err_msg_index < validator.length; ++err_msg_index) {
                console.log(validator[err_msg_index]);
            }
            success = false;
        }
    }
    if (success)
        res.render(path.join(__dirname, '../views', 'user_input_success.html'));
    else
        res.render(path.join(__dirname, '../views', 'user_input_fail.html'));
});

//validate json and insert
router.post('/add', function(req, res) {
    var success = false;
    for (var i = 0; i < json_ex.length; ++i) {
        var validator = validate((json_ex[i]), schema);
        if (validator.valid) {
            //insert json into postgres db
            insert_json(json_ex[i]);
            success = true;
        }
        else {
            for (var err_msg_index = 0; err_msg_index < validator.length; ++err_msg_index) {
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
        if (validator.valid) {
            //insert json into postgres db
            insert_sample_json(json_ex[i]);
            success = true;
        }
        else {
            for (var err_msg_index = 0; err_msg_index < validator.length; ++err_msg_index) {
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