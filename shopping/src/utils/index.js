import bcrypt from 'bcrypt'
//const axios = require("axios");
import jwt from "jsonwebtoken";
import config from "../config/index.js";
import amqplib from "amqplib";


//Utility functions
export async function GenerateSalt (){
  return bcrypt.genSalt();
}

export async function GeneratePassword (password, salt){
  return await bcrypt.hash(password, salt);
}

export async function ValidatePassword (
    enteredPassword,
    savedPassword,
    salt
){
  return (await GeneratePassword(enteredPassword, salt)) === savedPassword;
}

export async function GenerateSignature (payload) {
  try {
    return await jwt.sign(payload, config.APP_SECRET, { expiresIn: "30d" });
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function ValidateSignature (req){
  try {
    const signature = req.get("Authorization");
    console.log(signature);
    req.user = await jwt.verify(signature.split(" ")[1], config.APP_SECRET);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export function FormatData(data) {
  if (data) {
    return { data };
  } else {
    throw new Error("Data Not found!");
  }
}


/*
module.exports.PublishCustomerEvent = async (payload) => {
  axios.post('http://localhost:8004/customer/app-events', {
    payload
  })
}
*/

// Instead of using webhooks, we can use message broker like RabbitMQ or Kafka to publish events

// Create a channel
export async function CreateChannel () {
  try {
    const connection = await amqplib.connect(config.MSG_QUEUE_URL)
    const channel = await connection.createChannel()
    await channel.assertExchange(config.EXCHANGE_NAME, 'direct', { durable : true });
    return channel;
  } catch (e) {
    throw e;
  }
}

// Create Message
export async function PublishMessage (channel, service, message){
  try {
    await channel.publish(config.EXCHANGE_NAME, service, Buffer.from(message));
    console.log('Message has been sent ' + message)
  } catch (e) {
    console.log('PUBLISH MESSAGE ERROR: ', e)
    throw e;
  }
}

// Subscribe to the messages
export async function SubscribeMessage (channel, service){
  await channel.assertExchange(config.EXCHANGE_NAME, 'direct', { durable : true });
  const appQueue = await channel.assertQueue("", { exclusive: true });
    console.log(`Waiting for messages in ${appQueue.queue}`);

  channel.bindQueue(appQueue.queue, config.EXCHANGE_NAME, config.SHOPPING_SERVICE);

  channel.consume(appQueue.queue, data => {
    if (data.content) {
      console.log(`Received message: ${data.content.toString()}`);
      service.SubscribeEvents(data.content.toString());
      channel.ack(data);
    }
    console.log('[X] received')
  }, { noAck: false })

}
