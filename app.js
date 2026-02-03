const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");


const app = express();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/auth', require('./routes/auth.routes'));
app.use('/products', require('./routes/product.routes'));
app.use('/reservations', require('./routes/reservation.routes'));
app.use('/checkout', require('./routes/checkout.routes'));

module.exports = app;
