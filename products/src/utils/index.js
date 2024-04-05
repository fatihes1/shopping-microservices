import jwt from "jsonwebtoken";
import config from "../config/index.js";

import amqplib from "amqplib";
//Utility functions


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
export function FormatData (data){
  if (data) {
    return { data };
  } else {
    throw new Error("Data Not found!");
  }
}
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
export async function CreateChannel(){
  try {
    const connection = await amqplib.connect(config.MSG_QUEUE_URL)
    const channel = await connection.createChannel()
    await channel.assertExchange(config.EXCHANGE_NAME, 'direct', { durable: true });
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
    throw e;
  }
}

// // Subscribe to the messages
// export async function SubscribeMessage (channel, bindingKey){
//   const appQueue = await channel.assertQueue(config.QUEUE_NAME);
//
//   channel.bindQueue(appQueue.queue, config.EXCHANGE_NAME, bindingKey);
//
//   channel.consume(appQueue.queue, data => {
//     console.log(`Received message: ${data.content.toString()}`);
//     channel.ack(data);
//   })
//
// }


