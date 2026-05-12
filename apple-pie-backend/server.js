const dotenv = require('dotenv');
dotenv.config();

const app = require('./app.js');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor Apple Pie corriendo en puerto ${PORT}`);
});
