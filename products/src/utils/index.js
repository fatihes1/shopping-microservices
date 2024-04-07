import jwt from "jsonwebtoken";
import config from "../config/index.js";
import amqplib from "amqplib";
import { v4 as uuid4 } from "uuid";

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

// MESSAGE BROKER
let AMQPLIB_CONNECTION = null;

const getChannel = async () => {
  if (AMQPLIB_CONNECTION === null) {
    AMQPLIB_CONNECTION = await amqplib.connect(config.MSG_QUEUE_URL);
  }
  return await AMQPLIB_CONNECTION.createChannel();
};

// Create a channel
export async function CreateChannel(){
  try {
    const channel = await getChannel();
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

export async function RPCObserver (RPC_QUEUE_NAME, service){
  const channel = await getChannel();
  await channel.assertQueue(RPC_QUEUE_NAME, {
    durable: false,
  });
  channel.prefetch(1);
  channel.consume(
      RPC_QUEUE_NAME,
      async (msg) => {
        if (msg.content) {
          // DB Operation
          const payload = JSON.parse(msg.content.toString());
          const response = await service.serveRPCRequest(payload);

          channel.sendToQueue(
              msg.properties.replyTo,
              Buffer.from(JSON.stringify(response)),
              {
                correlationId: msg.properties.correlationId,
              }
          );
          channel.ack(msg);
        }
      },
      {
        noAck: false,
      }
  );
}


