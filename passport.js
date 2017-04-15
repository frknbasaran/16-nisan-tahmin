var passport = require('passport'),
    config = require('./config'),
    TwitterStrategy = require('passport-twitter').Strategy,
    UserModel = require('./models/User');

passport.serializeUser(function (user, done) {
    done(null, user._id);
})

passport.deserializeUser(function (id, done) {
    UserModel.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(new TwitterStrategy({
    consumerKey: config.consumerKey,
    consumerSecret: config.consumerSecret,
    callbackURL: '/auth/twitter/callback',
    passReqToCallback: true
}, function (req, accessToken, tokenSecret, profile, done) {

    UserModel
        .findOne({"email": profile.username + "@twitter.com"})
        .exec(function (err, user) {
            if (err) done(err, user);
            else {
                if (user) {
                    req.logIn(user, function (err) {
                        if (err) {
                            return next(err);
                        } else done(err, user);
                    });
                } else {
                    var user = new UserModel();
                    // Twitter will not provide an email address.  Period.
                    // But a person’s twitter username is guaranteed to be unique
                    // so we can "fake" a twitter email address as follows:
                    user.email = profile.username + "@twitter.com";
                    user.tokens.push({kind: 'twitter', accessToken: accessToken, tokenSecret: tokenSecret});
                    user.name = profile.displayName;
                    user.nick = profile.username;
                    user.photo = profile._json.profile_image_url;
                    user.save(function (err) {
                        req.logIn(user, function (err) {
                            if (err) {
                                return next(err);
                            } else done(err, user);
                        });
                    });
                }
            }
        })

}));
