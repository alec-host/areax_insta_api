const cors = require("cors");
const morgan = require("morgan");
const express = require('express');
const bodyParser = require('body-parser');
const postRoutes = require('./routes/post.routes');
const getRoutes = require('./routes/get.routes');
const error = require('./middleware/error.handler');
const { APP_SERVER_PORT } = require("./constants/app_constants");

const app = express();
const PORT = APP_SERVER_PORT;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('tiny'));

app.use('/instagram/messaging',postRoutes);
app.use('/instagram/tracking',getRoutes);

app.use(error.errorHandler);

app.listen(PORT, () => {
    console.log(`IG MESSAGING SERVER RUNNING ON PORT: ${PORT}`);
});