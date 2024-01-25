const Constant = require('../Constants');
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
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