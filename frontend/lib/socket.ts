import { io, Socket } from "socket.io-client"
import Cookies from "js-cookie";

const socketInstances: Record<string, Socket> = {};

export const getSocket = (
  namespace: string = "",
  options: Partial<Parameters<typeof io>[1]> = {}
): Socket => {
  const token = Cookies.get("token"); // or whatever cookie name you use

  if (!socketInstances[namespace]) {
    socketInstances[namespace] = io(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/${namespace}`,
      {
        transports: ["websocket"],
        auth: { token },
        ...options,
      }
    );
  }

  return socketInstances[namespace];
};