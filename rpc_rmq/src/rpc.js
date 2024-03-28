import amqplib from 'amqplib';
import { v4 as uuidv4 } from 'uuid';

let amqplibConnection = null;

const getChannel = async () => {
    if (amqplibConnection === null) {
        amqplibConnection = await amqplib.connect('amqp://localhost');
    }
    return await amqplibConnection.createChannel();
};

const expensiveDBOperation = (payload, fakeResponse) => {
    console.log(payload)
    console.log(fakeResponse)

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(fakeResponse);
        }, 5000);
    });
}

const RPCObserver = async (RPC_QUEUE_NAME, fakeResponse) => {
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
                const response = await expensiveDBOperation(payload, fakeResponse); // call fake DB operation

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

const requestData = async (RPC_QUEUE_NAME, requestPayload, uuid) => {
    try {
        const channel = await getChannel();

        // exclusive true means that the queue will be deleted once the connection is closed
        const q = await channel.assertQueue("", { exclusive: true });

        channel.sendToQueue(
            RPC_QUEUE_NAME,
            Buffer.from(JSON.stringify(requestPayload)),
            {
                replyTo: q.queue,
                correlationId: uuid,
            }
        );

        return new Promise((resolve, reject) => {
            // timeout n
            const timeout = setTimeout(() => {
                channel.close();
                resolve("API could not fullfil the request!");
            }, 8000);
            channel.consume(
                q.queue,
                (msg) => {
                    if (msg.properties.correlationId === uuid) {
                        resolve(JSON.parse(msg.content.toString()));
                        clearTimeout(timeout);
                    } else {
                        reject("data Not found!");
                    }
                },
                {
                    noAck: true,
                }
            );
        });
    } catch (error) {
        console.log(error);
        return "error";
    }
};

const RPCRequest = async (RPC_QUEUE_NAME, requestPayload) => {
    const uuid = uuidv4(); // correlationId
    return await requestData(RPC_QUEUE_NAME, requestPayload, uuid);
};

export {
    getChannel,
    RPCObserver,
    RPCRequest
}
