import { getBodyMessage, sendMessage } from './message-service';

export const getGarageUpdates = getBodyMessage().then((update) => {
  const time = new Date();
  console.log(`Your message ${update} ran at ${time}`);
});