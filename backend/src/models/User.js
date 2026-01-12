// import mongoose from "mongoose";

// const UserSchema = new mongoose.Schema({
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//     }, fullName: {
//         type: String,
//         required: true
//     },
//     password: {
//         type: String,
//         required: true,
//         minlength: 6
//     },
//     profilePic: {
//         type: String,
//         default: ""
//     },
//     bio: {
//         type: String,
//         default: ""
//     }
// }, { timestamps: true });

// const User = mongoose.model("User", UserSchema);

// export default User;









import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
            maxlength: [55, "Email cannot be longer than 55 characters"],
        },
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            minlength: [2, "Name must be at least 2 characters"],
            trim: true,
            maxlength: [30, "Name cannot be longer than 30 characters"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false,
        },
        profilePic: {
            type: String,
            default: "",
        },
        bio: {
            type: String,
            minlength: [10, "Bio must be at least 10 characters"],
            maxlength: [25, "Bio cannot exceed 25 characters"],
            default: "",
            trim: true,
        },
        resetPasswordToken: {
            type: String,
        },
        resetPasswordExpiry: {
            type: Date,
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
