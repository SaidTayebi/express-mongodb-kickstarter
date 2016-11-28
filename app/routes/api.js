import jwt from 'jsonwebtoken';
import User from '../models/user';
import config from  '../../config';
import userController from '../controllers/userController';

// super secret for creating tokens
const superSecret = config.secret;

export default (app, express) => {

  const apiRouter = express.Router();

  apiRouter.post('/users', (req, res) => {
    const user = new User();
    user.lastName = req.body.lastName;
    user.firstName = req.body.firstName;
    user.email = req.body.email;
    user.password = req.body.password;

    user.save((err) => {
      if (err) {
        console.log(err);
        // duplicate entry
        if (err.code === 11000)
          return res.json({ success: false, message: `A user with the email ${user.email} already exists`});
        else {
          console.log(err);
          return res.json({success: false, message: err.message});
        }
      } else {
        return res.json({success: true, message: `User ${user.email} successfully created`});
      }

    });

  });

  // route to authenticate a user (POST http://localhost:8080/api/authenticate)
  apiRouter.post('/authenticate', userController.authenticate);

  // route middleware to verify a token
  apiRouter.use((req, res, next) => {
    // do logging
    console.log('Somebody just came to our app!');

    // check header or url parameters or post parameters for token
    const token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {

      // verifies secret and checks exp
      jwt.verify(token, superSecret, (err, decoded) => {
        if (err) {
          res.status(403).send({
            success: false,
            message: 'Failed to authenticate token.'
          });
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;

          next(); // make sure we go to the next routes and don't stop here
        }
      });

    } else {

      // if there is no token
      // return an HTTP response of 403 (access forbidden) and an error message
      res.status(403).send({
        success: false,
        message: 'No token provided.'
      });

    }
  });

  apiRouter.route('/users')
    .get((req, res) => {
      User.find({}, (err, users) => {
        if (err) res.send(err);

        // return the users
        res.json(users);
      });
    });

  apiRouter.route('/users/:user_id')

    // get the user with that id
    .get(userController.getById)

    // update the user with this id
    .put((req, res) => {
      User.findById(req.params.user_id, (err, user) => {

        if (err) res.send(err);

        // set the new user information if it exists in the request
        if (req.body.lastName) user.lastName = req.body.lastName;
        if (req.body.firstName) user.firstName = req.body.firstName;
        if (req.body.password) user.password = req.body.password;
        // save the user
        user.save((err, data) => {
          if (err) res.send(err);

          // return a message
          res.json({ message: 'User updated!' });
        });

      });
    })

    // delete the user with this id
    .delete((req, res) => {
      User.findByIdAndRemove(req.params.user_id, (err, user) => {
        if (err) res.send(err);
        res.json({ message: 'user Successfully deleted'});
      });
    });

  // api endpoint to get user information
  apiRouter.get('/me', (req, res) => {
    res.send(req.decoded);
  });

  return apiRouter;
};
