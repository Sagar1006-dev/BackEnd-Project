import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user details from fronend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return response



  //  spep 1 --get user details from fronend

  const {fullName, email, username, password} = req.body
  console.log("email:", email);

  // step2 --validation - not empty
  // if (fullName === "") {
  //   throw new ApiError(400, "fullname is reqired")
  // }
  if (
    [fullName, email, username, password].some((field)=>field?.trim() === "")
  ) {
      throw new ApiError(400, "All fields are required")
  } 

  //  step 3 -- check if user already exists: username, email
   const existedUser = User.findOne({
    $or: [{ username },{ email }]
   })
   if (existedUser) {
    throw new ApiError(409, "User with email or username already exists")
   }

   // step 4 -- check for images, check for avatar
   const avatarLocalPath = req.files?.avtar[0]?.path;
   const coverImageLocalPath = req.files?.coverImage[0]?.path;


   // step5 --upload them to cloudinary, avatar
   if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)
   
   if (!avatar) {
     const avatar = await uploadOnCloudinary(avatarLocalPath)
   }

   // step 6 --  create user object - create entry in db
   const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
   })
  //  step 7 -- // remove password and refresh token field from response

   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
   )
   // step 8-- check for user creation
   if (!createdUser) {
       throw new ApiError(500, "Something went wrong while registering the user")
   }

  // step 9 -- return response
    return res.status(201).json(
      new ApiResponse(200, createdUser, "User registered Successfully")
    )


});

export { registerUser };
