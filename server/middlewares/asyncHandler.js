export const asyncHandler = (theFunction) => (req, res, next) => {
  Promise.resolve(theFunction(req, res, next)).catch(next);
};

// It is a wrapper function used to handle errors in async controllers automatically.
// Instead of writing try-catch in every controller, we use this.