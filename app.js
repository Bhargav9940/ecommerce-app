//Express for REST APIs
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require('express-mongo-sanitize');
const cors = require("cors");
const cookieParser = require("cookie-parser");
const cloudinary = require("cloudinary");
const connectDB = require("./config/db");


//Should be above all 
require("dotenv").config();

//DB connection
connectDB();

//cloudinary confirgution
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});


//Instantiating REST/Express app
//Express object
const app = express();

//middleware


app.use(helmet());        //for securing header
app.use(mongoSanitize());    //middleware which sanitizes user-supplied data to prevent MongoDB Operator Injection.
app.use(morgan("dev"));          //to print log of requests
app.use(express.json());          //to handle json data
app.use(cors());                   //to bind backend with frontend
app.use(cookieParser());
app.use(express.urlencoded({ extended: true}));


//views
app.set('view engine', 'ejs');


//route
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/cat", categoryRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.get("/", (req, res) => {
    return res.render("login");
});

//PORT
const PORT = process.env.PORT || 8000;

//Running a Server
app.listen(PORT, () => console.log(`Server is running on PORT=${PORT} on ${process.env.NODE_ENV} Mode.`));
