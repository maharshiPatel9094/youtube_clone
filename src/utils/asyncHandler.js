// the main purpose of creating this file is to make a function that can handle the req and res so that we can simple import this function and wrap it


//  this asyncHandler function is a utility that wraps asynchronous request handler functions, ensuring that any errors thrown within them are properly propagated to Express's error handling middleware.



const asyncHandler = (reqHandler) => { return (req,res,next) => {
    Promise.resolve(reqHandler(req,res,next)).catch((err)=> next(err))
}}

export { asyncHandler };

// async handler using try catch 

// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(req, res, next);
//   } catch (error) {
//     res.status(err.code || 500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };
