const cors = require("cors");
const morgan = require("morgan");
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes/post.routes');
const error = require('./middleware/error.handler');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 9000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('tiny'));

app.use('/instagram/messaging', routes);

app.use(error.errorHandler)

app.listen(PORT, () => {
    console.log(`IG MESSAGING SERVER RUNNING ON PORT: ${PORT}`);
});
