import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


const app = express()

// use() is used for all middlewares and cofiguration 
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// accepting json data and limit set
// body-parser is by default set to express
app.use(express.json({limit: "16kb"}))

// accepting data through url 
app.use(express.urlencoded({extended: true, limit: "16kb"}))

// stores public assest like pdfs, folders, images
app.use(express.static("public"))

//using cookie parser configuration
app.use(cookieParser())


export { app }