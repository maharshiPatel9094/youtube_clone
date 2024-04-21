// the main function of this is to wrap thing so we dont have to try catch every time or resolve promises every time
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// method for generating refresh and access token
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // save refresh token in db
    user.refreshToken = refreshToken;
    await user.save({ ValidateBeforeSave: false });

    // return
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      " Something Went Wrong While Generating Access And Refresh Token "
    );
  }
};


// registering the user
const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation -- not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary
  // create user object- create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return response

  const { fullName, email, username, password } = req.body;
  // console.log("email: ", email);
  // validation
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // checking if user already exist or not
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "user with email or username already exist");
  }

  // check for images , avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // upload them to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  // creating entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  // _id is by default created by mongodb
  // so we will confirm that our user is created or not
  // remove password and refresh token

  const createdUser = await User.findById(user._id).select(
    // things you dont want
    "-password -refreshToken"
  );

  //check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  //   return response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully"));

  // you can also check one by one like this
  // if(fullName === ""){
  // throw new ApiError(400, "fullname is required")
  // }
});


// login the user
const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // check validation for username or email
  // find the user in db
  // password check
  // access and refresh token generate for the user
  // send in form of cookies

  // get data
  const { email, userName, password } = req.body;

  // check if user got email or username for login
  if (!userName && !email) {
    throw new ApiError(400, " Email or userName are mandatory for login !!! ");
  }

  // find the user
  const user = await User.findOne({
    // mongo operator or
    // find one of them
    $or: [{ userName, email }],
  });

  // what if we do not got the user
  if (!user) {
    throw new ApiError(400, " User never Existed !!!!  ");
  }

  // check the password
  // from user model get isPasswordCorrect() method
  // returns true or false
  const isPasswordValid = await user.isPasswordCorrect(password);

  // if password is incorrect throw error
  if (!isPasswordValid) {
    throw new ApiError(400, " Please Enter A Valid Password !! ");
  }

  // generate the access and refresh token
  // call the mthod
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // send cookie
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedUser,
          accessToken,
          refreshToken,
        },
        " User Logged In Successfully !!! "
      )
    );
});


// logout the user 
const logoutUser = asyncHandler(async (req,res) => {
  // get user
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set : {
        refreshToken: undefined,
      }
    },
    {
      new: true,
    }
  )

  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200, {} , " User Logout Successfullty !!! "))

})


// refresh access token
const refreshAccessToken = asyncHandler(async(req,res)=> {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if (!incomingRefreshToken) {
    throw new ApiError(401, " Unauthorized Request !!! ")
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    )
  
    const user = await User.findById(decodedToken?._id)
  
    if (!user) {
      throw new ApiError(401, " Invalid Refresh Token !!! ")
    }
  
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401," Refresh Token Is Expired Or Used !!! ")
    }
  
    const options ={
      httpOnly: true,
      secure: true,
    }
    
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
  
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
      new ApiResponse(
        200,
        {accessToken, refreshToken:newRefreshToken},
        " Access Token Refreshed Successfully !!! "
      )
    )
  } catch (error) {
    throw new ApiError(401, error?.message || " Invalid Refresh Token ")
  }
  
})

export { 
  registerUser, 
  loginUser,
  logoutUser,
  refreshAccessToken,
};
