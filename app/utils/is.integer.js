module.exports.isInteger = (str) => {
    if (!str || !/^-?\d+$/.test(str)) {
      return false;
    }
    const num = Number(str);
    return Number.isInteger(num);
};