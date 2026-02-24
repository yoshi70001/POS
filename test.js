const bcrypt = require("bcryptjs/dist/bcrypt");

const hashedPassword = bcrypt.hashSync('admin123', 10);

console.log("Contraseña hasheada:", hashedPassword);