exports.errorHandler = async(err,req,res,next) => {
    res.sendStatus(err.status || 500);
};