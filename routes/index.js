var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/User');
var RateLimit = require('express-rate-limit');

var RequestLimiter = new RateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    delayAfter: 1, // begin slowing down responses after the first request
    delayMs: 3 * 1000, // slow down subsequent responses by 3 seconds per request
    max: 5, // start blocking after 5 requests
    message: "Too many accounts created from this IP, please try again after an hour"
});

/* GET home page. */
router.get('/', function (req, res, next) {
    User
        .count({})
        .exec(function (err, count) {
            User
                .find({"bet.yes": {$ne: null}})
                .sort('-createdAt')
                .limit(5)
                .exec(function (err, users) {
                    if (users) {
                        res.render('index', {
                            title: 'Referandumu Tahmin Edin',
                            user: req.user,
                            total: count,
                            users: users
                        });
                    } else res.render('index', {
                        title: 'Referandumu Tahmin Edin',
                        user: req.user,
                        total: count,
                        users: []
                    });

                })
        })
});

router.get('/auth/twitter', passport.authenticate('twitter'));
router.get('/auth/twitter/callback', passport.authenticate('twitter', {
    successRedirect: '/'
}));

router.get('/logout', RequestLimiter, function (req, res) {
    req.logOut();
    res.redirect('/');
})

router.post('/update-bet', RequestLimiter, function (req, res) {
    User.findOne({"_id": req.user._id}).exec(function (err, user) {
        if (!err) {
            if (user) {
                user.bet.yes = req.body.yes;
                user.bet.no = req.body.no;
                if ((Number(user.bet.yes) + Number(user.bet.no)) > 100 || (Number(user.bet.yes) + Number(user.bet.no) < 100)) {
                    res.send('Matematik alert.');
                } else {
                    user.save(function (err) {
                        res.redirect('/');
                    })
                }
            } else {
                res.redirect('/');
            }
        } else {
            res.redirect('/');
        }
    })
})


module.exports = router;
