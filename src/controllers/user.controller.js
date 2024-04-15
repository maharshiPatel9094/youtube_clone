// the main function of this is to wrap thing so we dont have to try catch every time or resolve promises every time 
import {asyncHandler} from "../utils/asyncHandler.js"


const registerUser = asyncHandler( async (req,res) => {
    return res.status(200).json({
        message: "ok"
    })
})

export {registerUser} 