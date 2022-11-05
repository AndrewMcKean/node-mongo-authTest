const jwt = require("jsonwebtoken");

module.exports = async(request, response, next) => {
  try {
    //Get the token from the authorization header
    const token = await request.headers.authorization.split(" ")[1];

    //Check if the token matches the supposed origin
    const decodedToken = await jwt.verify(
      token,
      "RANDOM-TOKEN"
    );

    //Retrieve user details of the logged in user
    const user = await decodedToken;
    
    //Pass the user to the endpoint
    request.user = user;
    
    //Pass functionality to the endpoint
    next();
  } catch(e) {
    response.status(401).json({
      e: new Error("Invalid request.")
    });
  }
}