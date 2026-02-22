import jwt from "jsonwebtoken";
import {asyncHandler} from "./asyncHandler.js";
import { ErrorHandler } from "./error.js";
import { User } from "../models/user.js";

export const isAuthenticated=asyncHandler(async(req,res,next)=>{
    const {token}=req.cookies;
    if(!token){
        return next(new ErrorHandler("Please login to access this resource ",401    ));

    }
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    req.user=await User.findById(decoded.id).select("-resetPasswordToken -resetPasswordExpire");
    if(!req.user){
        return next(new ErrorHandler("User not found with this id ",401    ));
    }
    next();
})

// The isAuthenticated middleware checks whether a user is logged in by extracting the JWT token from cookies. 
// It verifies the token using the secret key, fetches the user from the database, and attaches the user object to req.user.
//  If the token is missing or invalid, it returns a 401 error.

export const isAuthorized=(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`Role:${req.user.role} is not allowed to access this resource`,403));
        }
        next();
    }
}

// The isAuthorized middleware handles role-based access control. It checks whether the logged-in user's role is allowed to access a specific route,
// and if not, it returns a 403 Forbidden error.So authentication verifies identity, while authorization verifies permissions.