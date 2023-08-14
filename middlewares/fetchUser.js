const jwt = require("jsonwebtoken");

const fetchUser = (req, res, next) => {
  const token = req.header("Auth-Token");
  if (!token) {
    return res.status(401).json({ status: 401, statusText: "Unauthorized" });
  }

  try {
    const data = jwt.verify(token, process.env.SECRET_KEY);
    req.user = data.user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ status: 401, statusText: "Unauthorized" });
  }
};

module.exports = fetchUser;
