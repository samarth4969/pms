import { User } from "../models/user.js";

export const createUser=async(userData)=>{
    try {
        const user=new User(userData);
        return await user.save();
    } catch (error) {
        throw new Error(`Error creating user : ${error.message}`);
    }
}
export const updateUser=async(id,updateData)=>{
    try {
        
        return await User.findByIdAndUpdate(id,updateData,{
            new:true,
            runValidators:true,
        }).select("-password");
    } catch (error) {
        throw new Error(`Error updating user : ${error.message}`);
    }
}

export const getUserById=async(id)=>{
    return await User.findById(id).select("-password -resetPasswordToken -resetTokenExpiry");

    
}

export const deleteUser=async(id)=>{
    const user=await User.findById(id);
    if(!user){
        throw new Error("User not found");
    }
    return await user.deleteOne();
}

export const allUsers = async () => {
  const query = { role: { $ne: "Admin" } };

  const users = await User.find(query)
    .select("-password -resetPasswordToken -resetPasswordExpire")
    .sort({ createdAt: -1 }); // ✅ CORRECT PLACE

  return users;
};
