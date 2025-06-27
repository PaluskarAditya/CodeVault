const bcrypt = require('bcryptjs');

const hashPass = async pass => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(pass, salt);
}

module.exports = hashPass