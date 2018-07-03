var moment = require('moment-timezone');
var validate = require('jsonschema').validate;

var d = moment(new Date());
console.log(d.tz('America/Los_Angeles').format('YYYY-MM-DD HH:mm:ss'));

var json_ex = [{
    "scribe_id": 1977,
    "scribe_name": "Aastha Mahajan",
    "scribe_email": "aastha.m@idsil.com",
    "partner_name": "IDS",
    "login_time": "2018-06-27T14:59:36.000Z",
    "browser": "Chrome 64",
    "join_time": "2018-06-27 08:05:58",
    "last_activity": "2018-06-27 15:47:34",
    "user_type": "primary_scribe",
    "doctor_name": "Douglas Souvignier",
    "doctor_email": "souvigd@pamf.org"
},
    {
        "scribe_id": 934,
        "scribe_name": "Aarti Sharma",
        "scribe_email": "aarti.s@idsil.com",
        "partner_name": "IDS",
        "login_time": "2018-06-28T13:58:29.000Z",
        "browser": "Chrome 64",
        "join_time": "2018-06-28 08:11:31",
        "last_activity": "2018-06-28 09:09:15",
        "user_type": "trainee_scribe",
        "doctor_name": "Kristi Blomberg",
        "doctor_email": "kblomberg@mercydesmoines.org"
    }
];
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

console.log(json_ex.length);
var validator = validate((json_ex[0]), schema);
console.log(validator.errors.length);

console.log(encodeURIComponent(String("'scribe_id' = '934'")));