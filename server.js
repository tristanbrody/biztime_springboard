/** Server startup for BizTime. */
require('dotenv').config();

const app = require('./app');

app.listen(3000, function () {
	console.log('Listening on 3000');
});
