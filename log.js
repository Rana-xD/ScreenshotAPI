var opts = {
    logDirectory: __dirname + '/logs',
    fileNamePattern: '<DATE>.log',
    dateFormat:'YYYY.MM.DD',
    timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
};

var log = require('simple-node-logger').createRollingFileLogger( opts );
var appender = log.getAppenders()[0];
appender.__protected().currentFile;

// rolling file writer uses interval, so we need to exit 
// setTimeout(function() {
//     process.exit( 0 );
// }, 1000);

module.exports = {
    log: log
}