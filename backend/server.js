// ============================================

// server.js - MAIN BACKEND FILE (starts everything)

// Run with: npm run dev  or  npm start

// ============================================



require('dotenv').config();

const express = require('express');

const mongoose = require('mongoose');

const cors = require('cors');

const helmet = require('helmet');



// route files - each file handles one part of the api

const authRoutes = require('./routes/authRoutes');       // login register

const pizzaRoutes = require('./routes/pizzaRoutes');   // menu pizzas

const orderRoutes = require('./routes/orderRoutes');     // orders

const paymentRoutes = require('./routes/paymentRoutes'); // razorpay payment

const errorHandler = require('./middleware/errorHandler');

const requestLogger = require('./middleware/requestLogger');

const { importCatalog } = require('./utils/importCatalog'); // seed menu if DB is empty



const app = express();



// which frontend urls are allowed to call this api (cors)

var allowedOrigins = [

  'http://localhost:5173',

  'http://localhost:3000',

  'https://pizza-palace-gules.vercel.app',

];

if (process.env.CLIENT_URL) {

  var extraUrls = process.env.CLIENT_URL.split(',');

  for (var i = 0; i < extraUrls.length; i++) {

    allowedOrigins.push(extraUrls[i].trim());

  }

}



app.use(helmet());

app.use(

  cors({

    origin: function (origin, callback) {

      // no origin = ok (like postman)

      if (!origin || allowedOrigins.indexOf(origin) !== -1) {

        callback(null, true);

      } else {

        callback(new Error('Not allowed by CORS'));

      }

    },

    credentials: true,

  })

);

app.use(express.json()); // read json from request body

app.use(requestLogger()); // print requests in console



// health check - open in browser to see if server is running

app.get('/api/health', function (req, res) {

  res.status(200).json({ success: true, message: 'Pizza Palace API is running' });

});



// connect all routes

app.use('/api/auth', authRoutes);

app.use('/api/pizzas', pizzaRoutes);

app.use('/api/orders', orderRoutes);

app.use('/api/payments', paymentRoutes);



app.use(errorHandler); // catch errors at the end



var PORT = process.env.PORT || 5000;



// start db and server

const startServer = async function () {

  try {

    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB connected');

    await importCatalog(); // put menu items in db if empty

    app.listen(PORT, function () {

      console.log('Server running on port ' + PORT);

    });

  } catch (error) {

    console.error('Failed to start server:', error.message);

    process.exit(1);

  }

};



if (require.main === module) {

  startServer();

}



module.exports = app;

