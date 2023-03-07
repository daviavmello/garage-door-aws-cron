import * as dotenv from "dotenv";
dotenv.config();

import { myQApi, myQDeviceInterface } from "@hjdhjd/myq";
import { client } from "./twilio";

type State = myQDeviceInterface["state"];

interface MessageResponse {
  statusCode: number;
  message: string;
}

const username = process.env.MY_Q_EMAIL as string;
const password = process.env.MY_Q_PASSWORD as string;

const from = process.env.TWILIO_FROM_NUMBER;
const to = process.env.TWILIO_TO_NUMBER;

const fetchGarageDoorState: Promise<State | undefined> = new Promise(
  async (resolve, reject) => {
    try {
      const myQ = new myQApi(username, password);
      await myQ.refreshDevices();
      const devicesInfo = myQ.devices;

      const garageDoor: Readonly<myQDeviceInterface> | undefined =
        devicesInfo.find((v) => v.device_platform === "myq");

      resolve(garageDoor?.state as State);

      // const openGarage = myQ.execute(garageDoor as Readonly<myQDeviceInterface>, 'close');
      // console.log(openGarage);
    } catch (error) {
      reject(error);
    }
  }
);

const getDate = (date: Date): string => {
  const messageDate = new Date(date);
  const todayDate = new Date(); // Check if messageDate is less than 24 hours ago

  const timeDiff = todayDate.getTime() - messageDate.getTime();
  const diffInDays = timeDiff / (1000 * 60 * 60 * 24);
  if (diffInDays < 1) {
    // Format time in AM/PM format
    const hours = messageDate.getHours();
    const minutes = messageDate.getMinutes().toString().padStart(2, "0");
    const amPm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${amPm}`;
  } else {
    // Format date in month/day/year format
    const month = messageDate.getMonth() + 1;
    const day = messageDate.getDate();
    const year = messageDate.getFullYear();
    return `${month}/${day}/${year}`;
  }
};

export const getBodyMessage = (): Promise<MessageResponse> => {
  return fetchGarageDoorState
    .then((garageDoorState) => {
      const lastUpdate = new Date(garageDoorState?.last_update as string);
      const timeAgo = getDate(lastUpdate);

      return {
        statusCode: 200,
        message: `\nCurrent garage state: ${garageDoorState?.door_state}\nLast time updated: ${timeAgo}`,
      };
    })
    .catch((error: Error) => {
      return {
        statusCode: 500,
        message: `\nThe following error has occurred: ${error.message}`,
      };
    });
};

export const sendMessage = async (): Promise<MessageResponse> => {
  const messageResponse = await getBodyMessage();

  await client.messages.create({
    body: messageResponse?.message,
    from: from,
    to: to,
  });

  return messageResponse;
  // .then((message: any) => console.log(message.sid));
};
