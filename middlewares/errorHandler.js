const errorHandler = (err, req, res, next) => { // Log the error stack trace for debugging purposes
  console.error(err.stack); 

  res.status(500).json({ 
    success: false,
    message: err.message || "Server Error",
  });
};

module.exports = errorHandler;