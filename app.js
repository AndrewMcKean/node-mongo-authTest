const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./db/userModel");
const auth = require("./auth");


// body parser configuration
app.use(bodyParser.json({limit: '2mb'}));
app.use(bodyParser.urlencoded({limit: '2mb', extended: true }));


app.get("/", (request, response, next) => {
  response.json({ message: "Hi Therapy Box! (If this is me troubleshooting, the server is up)" });
  next();
});

const dbConnect = require("./db/dbConnect");

dbConnect();

// Curb Cores Error by adding a header here
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

//Register endpoint
app.post("/register", (request, response) => {
  //Hash the password
  bcrypt
    .hash(request.body.password, 10)
    .then((hashedPassword) => {
      //Create a new user instance and collect the data
      const user = new User({
        email: request.body.email,
        username: request.body.username,
        password: hashedPassword,
        profileImg: request.body.profileImg,
        photoMap: request.body.photoMap,
        taskMap: request.body.taskMap,
      });

      //Save the new user
      user
        .save()
        //Return success if the new user is added to the database successfully
        .then((result) => {
          response.status(201).send({
            message: "User Created Successfully",
            result,
          });
        })
        //Catch error if the new user wasn't added successfully to the database
        .catch((error) => {
          response.status(500).send({
            message: "Error creating user",
            error,
          });
        });
    })
    //Catch error if the password hash isn't successful
    .catch((e) => {
      response.status(500).send({
        message: "Password was not hashed successfully",
        e,
      });
    });
});

//login endpoint
app.post("/login", (request, response) => {
  //Check if email exists
  User.findOne({ email: request.body.email })

    //If email exists
    .then((user) => {
      //Compare the password entered and the hashed password found
      bcrypt
        .compare(request.body.password, user.password)

        //If the passwords match
        .then((passwordCheck) => {

          //Check if password matches
          if(!passwordCheck) {
            return response.status(400).send({
              message: "Incorrect password",
              error,
            });
          }

          //Create JWT token
          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
              userName: user.username,
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );

          //Return success response
          response.status(200).send({
            message: "Login Successful",
            email: user.email,
            username: user.username,
            profileImg: user.profileImg,
            photoMap: user.photoMap,
            taskMap: user.taskMap,
            token,
          });
        })
        //Catch error if password doesn't match
        .catch((error) => {
          response.status(400).send({
            message: "Incorrect password",
            error,
          });
        });
    })
    //Catch error if email doesn't exist
    .catch((e) => {
      response.status(404).send({
        message: "Email not found",
        e,
      });
    });
});

//Update photo endpoint
app.post("/updatephotos", (request, response) => {
  //Find user
  User.findOne({ email: request.body.email })

    //If email exists
    .then((user) => {
        user.photoMap = request.body.photoMap;
        user.save()
          .then(
            //Return success response
            response.status(200).send({
            message: "Images saved successfully.",
          })
          )
        })


    // catch error if email does not exist
    .catch((e) => {
      response.status(404).send({
        message: "Email not found",
        e,
      });
    });
});

//Update tasks endpoint
app.post("/updatetasks", (request, response) => {
  //Find user 
  User.findOne({ email: request.body.email })

  //If email exists
    .then((user) => {
      user.taskMap = request.body.taskMap;
      user.save()
      .then(
        //Return success response
        response.status(200).send({
          message: "Tasks updated successfully.",
        })
      )
    })

    //Catch error if email does not exist
    .catch((e) => {
      response.status(404).send({
        message: "Email not found",
        e,
      });
    });
});

// dashboard endpoint for authenticated users
app.get("/dashboard", auth, (request, response) => {
  response.json({ message: "You are authorized" });
});

module.exports = app;
