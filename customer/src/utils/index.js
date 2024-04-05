import bcrypt from "bcrypt";
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

export const PublishMessage = async (channel, service, message) => {
  try {
    await channel.publish(config.EXCHANGE_NAME, service, Buffer.from(message));
  } catch (e) {
    throw e;
  }
}


// Subscribe to the messages
export async function SubscribeMessage (channel, service) {
  await channel.assertExchange(config.EXCHANGE_NAME, 'direct', { durable: true });
  const q = await channel.assertQueue('', { exclusive: true });
  console.log(`Waiting for messages in ${q.queue}.`);

  channel.bindQueue(q.queue, config.EXCHANGE_NAME, config.CUSTOMER_SERVICE);

  channel.consume(q.queue, (message) => {
    if (message.content) {
      console.log(`Received message: ${message.content.toString()}`);
      service.subscribeEvents(message.content.toString())
      channel.ack(message);
    }
    console.log("[X] received");
  }, { noAck: true })

}