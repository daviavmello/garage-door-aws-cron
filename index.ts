import * as dotenv from "dotenv";
dotenv.config();

import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
TimeAgo.addDefaultLocale(en);

import { myQApi, myQDeviceInterface } from "@hjdhjd/myq";
import { client } from "./twilio";

type State = myQDeviceInterface["state"];

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

const getBodyMessage = (): Promise<string> => {
  return fetchGarageDoorState
    .then((garageDoorState) => {
      const lastUpdate = new Date(garageDoorState?.last_update as string);
      const timeAgo = new TimeAgo("en-US").format(lastUpdate);

      return `\nCurrent garage state: ${garageDoorState?.door_state}\nLast time updated: ${timeAgo}`;
    })
    .catch((error: Error) => {
      return `\nThe following error has occurred: ${error}`;
    });
};

const sendMessage = async () => {
  const body = await getBodyMessage();

  // client.messages
  //   .create({
  // body: body,
  // from: from,
  // to: to,
  // })
  //   .then((message: any) => console.log(message.sid));
};

sendMessage();
