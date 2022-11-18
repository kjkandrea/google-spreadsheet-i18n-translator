const {GoogleSpreadsheet} = require('google-spreadsheet');
require('dotenv').config();

const spreadSheet = new GoogleSpreadsheet(process.env.SPREADSHEET_ID);
console.log(spreadSheet);
