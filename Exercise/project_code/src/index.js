const express = require('express');
require('dotenv').config();

const web_app = express();

web_app.use(
    express.urlencoded(
        {
            extended: true
        }
    )
);

web_app.use(
    express.json()
);

const PORT = process.env.PORT;

const home_route = require('../routes/home_route');
const dialogflow_route = require('../routes/dialogflow_route');

web_app.use(home_route.router);
web_app.use(dialogflow_route.router);

web_app.listen(PORT, () => {
    console.log(`Server is up on port ${PORT}`);
});