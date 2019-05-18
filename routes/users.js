const express = require('express');
const router = express.Router();

var jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const pool = require('../config/database').pool;

//Get all users
router.get('/', async function (req, res, next) {
    const data = await pool.query('SELECT * from USER');

    // jwt.verify("tokenhere", process.env.JWT_SECRET, function(err, decoded) {
    //     if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    //
    //     res.status(200).send(JSON.parse(JSON.stringify(decoded)));
    // });

});

//Create user
router.post('/register', async function (req, res, next) {
    const {email, password, phone, role} = req.body;
    const userExist = await pool.query('select email from user where email = ?', [email]);

    if (userExist.length === 0) {
        const hashsalt = await bcrypt.hash(password, 10);
        const data = await pool.query(`insert into user(email,password,phone,role) values (?,?,?,?)`, [email, hashsalt, phone, role]);
        res.send(
            {
                "message": "Success"
            }
        ).status(200)
    } else {
        res.send(
            {
                "message": "Problem"
            }
        ).status(200)
    }
});

//Login user
router.post('/login', async function (req, res, next) {

    const {email, password} = req.body;
    const userExist = await pool.query('select email from user where email = ?', [email]);

    if (userExist.length !== 0) {
        const data = await pool.query(`select * from user where email = ?`, [email]);
        if(await bcrypt.compare(password, data[0].password)){
            var token = jwt.sign({ id: data[0].id }, process.env.JWT_SECRET, {
                expiresIn: 86400 // expires in 24 hours
            });
            res.send(
                {
                    "message": "Success",
                    "token": token
                }
            ).status(200)

        }else{
            res.send(
                {
                    "message": "Problem"
                }
            ).status(200)
        }

    } else {
        res.send(
            {
                "message": "Problem"
            }
        ).status(200)
    }

});

module.exports = router;