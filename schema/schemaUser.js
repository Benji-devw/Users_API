import mongoose from "mongoose";
import passworHash from "password-hash";
import jwt from "jwt-simple";
import secret from "../config/config";

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: false,
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
      required: false,
    },
    username: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      required: true,
    },
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: false,
    },
    avatar: {
      type: String,
      required: false,
    },
    picture: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      default: null,
      required: false,
    },
    country: {
      type: String,
      default: null,
      required: false,
    },
    bio: {
      type: String,
      default: null,
      required: false,
    },
    role: {
      type: String,
      enum: ["user", "admin", "God", "superGod"],
      default: "user",
    },
    postalCode: {
      type: String,
      default: null,
      required: false,
    },
    city: {
      type: String,
      default: null,
      required: false,
    },
    address: {
      type: String,
      default: null,
      required: false,
    },
  },
  { timestamps: { createdAt: "created_at" } }
);

userSchema.methods = {
  authenticate: function (password) {
    return passworHash.verify(password, this.password);
  },
  getToken: function () {
    return jwt.encode(this, secret);
  },
};

export default mongoose.model("User", userSchema);
