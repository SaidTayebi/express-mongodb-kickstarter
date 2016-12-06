import express     from 'express';
import bodyParser  from 'body-parser';
import morgan      from 'morgan';
import mongoose    from 'mongoose';
import path        from 'path';
import compression from 'compression';
import helmet      from 'helmet';
import config      from './config';
import apiRoutes   from './app/routes/api';

const app = express();
mongoose.Promise = global.Promise;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(compression());
app.use(helmet());

// configure our app to handle CORS requests
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  next();
});

// log all requests to the console
app.use(morgan('dev'));

mongoose.connect(config.database);

// API ROUTES ------------------------
app.use('/api', apiRoutes(app, express));

// MAIN CATCHALL ROUTE ---------------
// has to be registered after API ROUTES
app.get('*', (req, res) => {
  if (process.env.NODE_ENV === 'development') {
    res.sendFile(path.join(`${__dirname}/../frontend/index.html`));
  } else {
    res.sendFile(path.join(`${__dirname}/../dist/index.html`));
  }


});

// START THE SERVER
// ====================================
app.listen(config.port);
console.log(`Magic happens on port ${config.port}`);
