const fs = require('fs');
const util = require('util');
const logFile = 'app.log'; // Define the log file name

// Create a write stream for the log file
const logFileStream = fs.createWriteStream(logFile, { flags: 'a' });

// Original console.log
const originalConsoleLog = console.log;

// Override console.log
console.log = function(message, ...optionalParams) {
    // Write to the original console.log
    originalConsoleLog(message, ...optionalParams);

    // Format the message as util.format for string substitution
    const formattedMessage = util.format(message, ...optionalParams) + '\n';

    // Write to the log file
    logFileStream.write(formattedMessage);
};