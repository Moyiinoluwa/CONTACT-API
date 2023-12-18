//This file handles the errorhandling. Export it to the app.js and call it as a function
const Constant = require('../Constants');
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
    //this JSON parse the error message from javascript to JSON
       // res.json({title: 'NOT FOUND', message: err.message, stakeTrace: err.stake})
        switch (statusCode) {
            case Constant.VALIDATION_ERROR:
                res.json({
                    title: "Validation failed",
                    message: err.message,
                    stakeTrace: err.stack,
                });
                break;
            case Constant.NOT_FOUND :
                res.json({
                    title: 'NOT FOUND',
                    message: err.message,
                    stakeTrace: err.stack
                })
                break;
                case Constant.UNAUTHORIZED:
                res.json({
                    title: "Not Authorized",
                    message: err.message,
                    stakeTrace: err.stack,
                });
                break;
                case Constant.FORBIDDEN:
                res.json({
                    title: "not allowed",
                    message: err.message,
                    stakeTrace: err.stack,
                });
                break
                case Constant.SERVER_ERROR:
                res.json({
                    title: "Server error",
                    message: err.message,
                    stakeTrace: err.stack,
                });
            default:
                console.log('Theres no error')
                break;
        }


};

module.exports = errorHandler;