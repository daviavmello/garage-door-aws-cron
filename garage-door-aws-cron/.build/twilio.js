"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
var accountSid = process.env.TWILIO_ACCOUNT_SID;
var authToken = process.env.TWILIO_AUTH_TOKEN;
var twilio = require("twilio");
exports.client = new twilio(accountSid, authToken);
//# sourceMappingURL=twilio.js.map