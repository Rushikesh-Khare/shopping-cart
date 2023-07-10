
const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};

const isBoolean = function(value) {
    return /^(true|false)$/i.test(value);
}

const isValidPrice = function (value) {
    return /^\d+(\.\d+)?$/.test(value);
}

const isValidNumber = function (value) {
    return /^\d+$/.test(value);
}

const isValidEmail = function (value) {
    return /^[\w\.-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*\.[a-zA-Z]{2,}$/
        .test(value);
}

const isValidMobile = function (input) {
    return /^\d{10}$/.test(input);
};

const isValidPassword = function (input) {
    const passwordRegex = /^[a-zA-Z0-9]{8,15}$/;
    return passwordRegex.test(input);
};

const isValidPincode = function (input) {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(input);
};

module.exports = { isValid, isValidEmail, isValidMobile, isValidPassword, isValidPincode, isValidPrice, isValidNumber, isBoolean};