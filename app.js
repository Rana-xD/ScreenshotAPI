const express = require('express');
const dotenv = require('dotenv');
// const ipfilter = require('express-ipfilter').IpFilter
const IpDeniedError = require('express-ipfilter').IpDeniedError
const app = express();
dotenv.config();



const ips = ['::ffff:160.86.236.137','::ffff:18.180.24.82','::ffff:3.115.214.232','::ffff:18.138.255.31','::ffff:54.150.85.172'];
// app.use(ipfilter(ips, { mode: 'allow' }));

if (app.get('env') === 'development') {
	app.use((err, req, res, _next) => {
	  console.log('Error handler', err)
	  if (err instanceof IpDeniedError) {
		res.status(403)
	  } else {
		res.status(err.status || 500)
	  }
  
	  res.send({
		message: 'You are forbidden',
		error: err
	  })
	})
  }
  
  // production error handler
  // no stacktraces leaked to user
app.use((err, req, res, _next) => {
    console.log('Error handler', err)
    res.status(err.status || 500)
    res.send({
      message: err.message,
      error: {}
    })
})


module.exports = app;

app.listen(process.env.PORT);