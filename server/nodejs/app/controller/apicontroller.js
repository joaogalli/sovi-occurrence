var Lojista = require('../models/lojista');
var User = require('../models/user');
var Publish = require('../models/publish');

module.exports = function (apiRoutes, passport, jwt, config, log, async) {
    // create a new user account (POST http://localhost:8080/api/register)
    apiRoutes.post('/register', function (req, res) {
        log.debug('Starting new lojista register');

        if (!req.body.name || !req.body.password || !req.body.nomelojista || !req.body.cnpj) {
            log.debug('Register is missing fields.');
            return res.json({ success: false, msg: 'validation.register.missingfields' });
        } else {
            // Validates the existence of User.name, before lojista saving
            async.parallel([function (callback) {
                User.find({ 'name': req.body.name }, function (err, docs) {
                    if (err) {
                        log.error(err);
                        res.json({ success: false, msg: "validation.register.error" });
                    } else if (!docs || docs.length === 0) {
                        log.debug('No user found');
                        callback();
                    } else {
                        log.info(docs);
                        res.json({ success: false, msg: "validation.register.user.nameexists" });
                    }
                });
            }], function () {
                var newLojista = new Lojista({
                    nome: req.body.nomelojista,
                    cnpj: req.body.cnpj
                });
                newLojista.save(function (err) {
                    if (err) {
                        log.error(err);
                        if (err.code === 11000) {
                            log.info('Duplicated CNPJ: ' + newLojista.cnpj);
                            return res.json({ success: false, msg: "validation.register.lojista.duplicatedcnpj" });
                        } else {
                            log.error(err);
                            return res.json({ success: false, msg: "validation.register.error" });
                        }
                    } else {
                        log.debug('Lojista created: ' + newLojista);

                        var newUser = new User({
                            name: req.body.name,
                            password: req.body.password,
                            lojista: newLojista._id
                        });
                        // save the user
                        newUser.save(function (err) {
                            if (err) {
                                console.error(err);
                                return res.json({ success: false, msg: 'validation.register.user.nameexists' });
                            }
                        
                            // Cria um token e manda para já ficar logado
                            var token = jwt.encode(newUser, config.secret);
                            res.json({ success: true, token: 'JWT ' + token });
                        });
                    }
                });
            });
        }
    });
 
    // route to authenticate a user (POST http://localhost:8080/api/authenticate)
    apiRoutes.post('/authenticate', function (req, res) {
        User.findOne({
            name: req.body.name
        }, function (err, user) {
            if (err) throw err;

            if (!user) {
                res.send({ success: false, msg: 'validation.authentication.usernotfound' });
            } else {
                // check if password matches
                user.comparePassword(req.body.password, function (err, isMatch) {
                    if (isMatch && !err) {
                        // if user is found and password is right create a token
                        var token = jwt.encode(user, config.secret);
                        // return the information including token as JSON
                        res.json({ success: true, token: 'JWT ' + token });
                    } else {
                        res.send({ success: false, msg: 'validation.authentication.wrongpassword' });
                    }
                });
            }
        });
    });

    apiRoutes.get('/publishes', function (req, res) {
        log.debug(req.query)

        // var query = {};

        // if (req.query.before) {
        //     Publish.findOne({ _id: req.query.before }, function (err, publish) {
        //         if (err) {
        //             log.error(err);
        //             res.status(500).send({ success: false, msg: err });
        //             return;
        //         }
        //         if (publish) {
        //             query.creation = { $gt: publish.creation };
        //         }
        //     });
        // } else if (req.query.after) {
        //     Publish.findOne({ _id: req.query.after }, function (err, publish) {
        //         if (err) {
        //             log.error(err);
        //             res.status(500).send({ success: false, msg: err });
        //             return;
        //         }
        //         if (publish) {
        //             query.creation = { $lt: publish.creation };
        //         }
        //     });
        // }

        async.waterfall([
            // Find the first or last Publish
            function (callback) {
                log.debug('Publish.findOne')
                Publish.findOne({ _id: req.query.before || req.query.after }, function (err, publish) {
                    if (err) {
                        log.error(err);
                        callback(err);
                    } else {
                        callback(null, publish);
                    }
                });
            },
            // If publish found, set in the query
            function (publish, callback) {
                log.debug('Add publish to query')
                var mongoQuery = {};
                if (req.query.before) {
                    mongoQuery.creation = { $gt: publish.creation };
                } else if (req.query.after) {
                    mongoQuery.creation = { $lt: publish.creation };
                }
                callback(null, mongoQuery);
            },
            // If there is a lojistaId add to the query
            function (mongoQuery, callback) {
                log.debug('Add Lojista to query')
                if (req.query.lojistaId) {
                    mongoQuery.lojista = req.query.lojistaId;
                }
                callback(null, mongoQuery);
            }
        ],
            function (err, result) {
                if (err) {
                    log.error(err);
                }
                log.info(result);
                findPublishes(result, res);
            });
    });

    var findPublishes = function (query, res) {
        log.debug('Find publishes query: ' + JSON.stringify(query));
        Publish.find(query).limit(12).sort({ creation: -1 }).populate('lojista').then(function (docs) {
            var result = [];
            for (var i = 0; i < docs.length; i++) {
                var publish = docs[i];
                result[i] = {
                    id: publish._id,
                    message: publish.message,
                    creation: publish.creation,
                    lojista: {
                        id: publish.lojista._id,
                        nome: publish.lojista.nome
                    }
                };
            }
            res.status(200).send({ success: true, size: result.length, msg: result });
        }, function (err) {
            res.status(500).send({ success: false, msg: err });
        });
    }

    // Publish
    apiRoutes.post('/publish', passport.authenticate('jwt', { session: false }), function (req, res) {
        log.info('Starting Publish');
        var token = getToken(req.headers);

        if (token) {
            var decoded = jwt.decode(token, config.secret);
            User.findOne({
                name: decoded.name
            }, function (err, user) {
                if (err) throw err;
                if (!user) {
                    return res.status(403).send({ success: false, msg: 'validation.publish.usernotfound' });
                } else {
                    var publish = new Publish({
                        message: req.body.message,
                        creation: new Date(),
                        lojista: user.lojista
                    });
                    publish.save(function (err) {
                        if (err) {
                            log.error(err);
                            res.json({ success: false, msg: 'validation.publish.errorpublishing' });
                        } else {
                            res.json({ success: true });
                        }
                    });
                }
            });
        } else {
            return res.status(403).send({ success: false, msg: 'validation.publish.notauthenticated' });
        }
    });

    var getToken = function (headers) {
        if (headers && headers.authorization) {
            var parted = headers.authorization.split(' ');
            if (parted.length === 2) {
                return parted[1];
            } else {
                return null;
            }
        } else {
            return null;
        }
    };

};