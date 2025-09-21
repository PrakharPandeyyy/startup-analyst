import { PubSub } from "@google-cloud/pubsub";

const pubsub = new PubSub();

export async function publishEvent(
  topicName: string,
  message: object,
  attributes?: Record<string, string>
) {
  const dataBuffer = Buffer.from(JSON.stringify(message));
  const messageId = await pubsub
    .topic(topicName)
    .publish(dataBuffer, attributes);
  return messageId;
}
