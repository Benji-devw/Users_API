import mongoose from "mongoose";
import passwordHash from "password-hash";
import jwt from "jwt-simple";
import secret from "../config/config";

const userSchema = mongoose.Schema(
     {
          username: {
               type: String,
               lowercase: true,
               trim: true,
               unique: true,
               required: true
          },
          email: {
               type: String,
               lowercase: true,
               trim: true,
               unique: true,
               required: true
          },
          password: {
               type: String,
               required: true
          }
     },
     { timestamps: { createdAt: "created_at" } }
);

userSchema.methods = {
     authenticate: function (password) {
          return passwordHash.verify(password, this.password);
     },
     getToken: function () {
          return jwt.encode(this, secret);
     }
};

export default mongoose.model("User", userSchema);
