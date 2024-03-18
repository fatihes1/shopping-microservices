const express = require('express');
const cors  = require('cors');
const { customer, appEvents} = require('./api');
const HandleErrors = require('./utils/error-handler')


module.exports = async (app, channel) => {

    app.use(express.json({ limit: '1mb'}));
    app.use(express.urlencoded({ extended: true, limit: '1mb'}));
    app.use(cors());
    app.use(express.static(__dirname + '/public'))

    // listen to events
    //appEvents(app); // We do not use webhooks anymore. We use RabbitMQ

    //api
    customer(app, channel);

    // error handling
    app.use(HandleErrors);
    
}