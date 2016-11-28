import User from '../models/user';
import jwt from 'jsonwebtoken';

import config from '../../config';
const superSecret = config.secret;


  const getById = (req, res) =>{
    User.findById(req.params.user_id, (err, user) => {
      if (err) res.send(err);

      // return that user
      res.json(user);
    });
  };

  const authenticate = (req, res) => {
    // find the user
    User.findOne({
      email: req.body.email
    }).select('lastName firstName password email').exec((err, user) => {

      if (err) throw err;

      // no user with that username was found
      if (!user) {
        res.json({
          success: false,
          message: 'Authentication failed. User not found.'
        });
      } else if (user) {

        // check if password matches
        var validPassword = user.comparePassword(req.body.password);
        if (!validPassword) {
          res.json({
            success: false,
            message: 'Authentication failed. Wrong password.'
          });
        } else {

          // if user is found and password is right
          // create a token
          var token = jwt.sign({
            user: user
          }, superSecret, {
            expiresIn: 1440 // expires in 24 hours
          });

          // return the information including token as JSON
          res.json({
            success: true,
            message: 'Enjoy your token!',
            token: token,
            user: user
          });

        }

      }
    });
  };

export default {
  getById,
  authenticate
};
