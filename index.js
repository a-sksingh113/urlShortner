require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser")
const { connectToMongoDB } = require("./config/connection");
const {checkForAuthentication, restrictTo} = require("./middleware/auth")


const URL = require("./models/url");


const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRoute");
const userRoute = require("./routes/user")


const app = express();
const PORT = 8001;

//connecting to mongodb
connectToMongoDB("process.env.MONGO_URL")
  .then(() => console.log("connected to mongodb"))
  .catch((err) => console.log(err, "error in connecting to mongodb"));


app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));


app.use(express.json()); //middleware
app.use(express.urlencoded({ extended: false })); //middleware
app.use(cookieParser());
app.use(checkForAuthentication);


//route for url
app.use("/url",restrictTo(["NORMAL","ADMIN"]),  urlRoute);
app.use("/", staticRoute);
app.use("/user", userRoute);
app.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  console.log("Received shortId:", shortId);
  try {
    const entry = await URL.findOneAndUpdate(
      {
        shortId,
      },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
          },
        },
      }
    );

    if (!entry) {
      return res.status(404).json({ error: "No such shortId found" });
    }

    res.redirect(entry.redirectURL);
  } catch (error) {
    console.error("Error during redirect:", error);
  }
});

app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
