const bcrypt = require('bcryptjs');

const comparePass = async (plainPassword, hashedPassword) => {
    try {
        return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (err) {
        console.error('Comparison error:', err);
        return false;
    }
}

module.exports = comparePass;