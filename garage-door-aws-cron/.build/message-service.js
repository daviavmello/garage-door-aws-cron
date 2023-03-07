"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = exports.getBodyMessage = void 0;
var dotenv = require("dotenv");
dotenv.config();
var myq_1 = require("@hjdhjd/myq");
var twilio_1 = require("./twilio");
var username = process.env.MY_Q_EMAIL;
var password = process.env.MY_Q_PASSWORD;
var from = process.env.TWILIO_FROM_NUMBER;
var to = process.env.TWILIO_TO_NUMBER;
var fetchGarageDoorState = new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
    var myQ, devicesInfo, garageDoor, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                myQ = new myq_1.myQApi(username, password);
                return [4 /*yield*/, myQ.refreshDevices()];
            case 1:
                _a.sent();
                devicesInfo = myQ.devices;
                garageDoor = devicesInfo.find(function (v) { return v.device_platform === "myq"; });
                resolve(garageDoor === null || garageDoor === void 0 ? void 0 : garageDoor.state);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                reject(error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
var getDate = function (date) {
    var messageDate = new Date(date);
    var todayDate = new Date(); // Check if messageDate is less than 24 hours ago
    var timeDiff = todayDate.getTime() - messageDate.getTime();
    var diffInDays = timeDiff / (1000 * 60 * 60 * 24);
    if (diffInDays < 1) {
        // Format time in AM/PM format
        var hours = messageDate.getHours();
        var minutes = messageDate.getMinutes().toString().padStart(2, "0");
        var amPm = hours >= 12 ? "pm" : "am";
        var formattedHours = hours % 12 || 12;
        return "".concat(formattedHours, ":").concat(minutes, " ").concat(amPm);
    }
    else {
        // Format date in month/day/year format
        var month = messageDate.getMonth() + 1;
        var day = messageDate.getDate();
        var year = messageDate.getFullYear();
        return "".concat(month, "/").concat(day, "/").concat(year);
    }
};
var getBodyMessage = function () {
    return fetchGarageDoorState
        .then(function (garageDoorState) {
        var lastUpdate = new Date(garageDoorState === null || garageDoorState === void 0 ? void 0 : garageDoorState.last_update);
        var timeAgo = getDate(lastUpdate);
        return {
            statusCode: 200,
            message: "\nCurrent garage state: ".concat(garageDoorState === null || garageDoorState === void 0 ? void 0 : garageDoorState.door_state, "\nLast time updated: ").concat(timeAgo),
        };
    })
        .catch(function (error) {
        return {
            statusCode: 500,
            message: "\nThe following error has occurred: ".concat(error.message),
        };
    });
};
exports.getBodyMessage = getBodyMessage;
var sendMessage = function () { return __awaiter(void 0, void 0, void 0, function () {
    var messageResponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.getBodyMessage)()];
            case 1:
                messageResponse = _a.sent();
                return [4 /*yield*/, twilio_1.client.messages.create({
                        body: messageResponse === null || messageResponse === void 0 ? void 0 : messageResponse.message,
                        from: from,
                        to: to,
                    })];
            case 2:
                _a.sent();
                return [2 /*return*/, messageResponse];
        }
    });
}); };
exports.sendMessage = sendMessage;
//# sourceMappingURL=message-service.js.map