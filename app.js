/** BizTime express application. */

const express = require('express');

const app = express();

const companyRoutes = require('./routes/companies');
const invoiceRoutes = require('./routes/invoices');
const industryRoutes = require('./routes/industries');
const ExpressError = require('./expressError');

app.use(express.json());
app.use('/companies', companyRoutes);
app.use('/invoices', invoiceRoutes);
app.use('/industries', industryRoutes);

/** general error handler */

app.use((err, req, res, next) => {
	res.status(err.status || 500);

	return res.json({
		error: err,
		message: err.message
	});
});

/** 404 handler */

app.use(function (req, res, next) {
	// should return a response with a status of 404
	// 404 shouldn't return an actual error
	return res.sendStatus(404);
});
module.exports = app;
