const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const amqplib = require('amqplib');

const { APP_SECRET, MESSAGE_BROKER_URL, EXCHANGE_NAME, SHOPPING_BINDING_KEY, CUSTOMER_BINDING_KEY } = require("../config");

//Utility functions
module.exports.GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

module.exports.GeneratePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

module.exports.ValidatePassword = async (
  enteredPassword,
  savedPassword,
  salt
) => {
  return (await this.GeneratePassword(enteredPassword, salt)) === savedPassword;
};

module.exports.GenerateSignature = async (payload) => {
  try {
    return await jwt.sign(payload, APP_SECRET, { expiresIn: "30d" });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports.ValidateSignature = async (req) => {
  try {
    const signature = req.get("Authorization");
    console.log(signature);
    const payload = await jwt.verify(signature.split(" ")[1], APP_SECRET);
    req.user = payload;
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports.FormateData = (data) => {
  if (data) {
    return { data };
  } else {
    throw new Error("Data Not found!");
  }
};
/*
module.exports.PublishCustomerEvent = async (payload) => {
  axios.post('http://localhost:8004/customer/app-events/', {
    payload
  })
}

module.exports.PublishShoppingEvent = async (payload) => {
  axios.post('http://localhost:8004/shopping/app-events/', {
    payload
  })
}
*/

// Instead of using webhooks, we can use message broker like RabbitMQ or Kafka to publish events

// Create a channel
module.exports.CreateChannel = async () => {
  try {
    const connection = await amqplib.connect(MESSAGE_BROKER_URL)
    const channel = await connection.createChannel()
    await channel.assertExchange(EXCHANGE_NAME, 'direct', false);
    return channel;
  } catch (e) {
    throw e;
  }
}

// Create Message
module.exports.PublishMessage = async (channel, bindingKey, message) => {
  try {
    await channel.publish(EXCHANGE_NAME, bindingKey, Buffer.from(message));
    console.log('Message has been sent ' + message)
  } catch (e) {
    throw e;
  }
}

// Subscribe to the messages
module.exports.SubscribeMessage = async (channel, bindingKey) => {
  const appQueue = await channel.assertQueue('QUEUE_NAME');

  channel.bindQueue(appQueue.queue, EXCHANGE_NAME, bindingKey);

  channel.consume(appQueue.queue, data => {
    console.log(`Received message: ${data.content.toString()}`);
    channel.ack(data);
  })

}


