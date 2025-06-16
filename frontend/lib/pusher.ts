import Pusher, { Channel } from 'pusher-js';
import Cookies from 'universal-cookie';

const cookies = new Cookies();
const pusherChannels: Record<string, Channel> = {};

export const getPusherChannel = (
  namespace: string = '',
  userId: string = '',
  options?: ConstructorParameters<typeof Pusher>[1],
): Channel => {
  const token = cookies.get('token');

  if (!pusherChannels[namespace]) {
    const pusher = new Pusher(
      process.env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        authEndpoint: `${process.env.NEXT_PUBLIC_BACKEND_URL}/pusher/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        ...options,
      },
    );
    pusherChannels[namespace] = pusher.subscribe(`private-${namespace}-${userId}`);
  }

  return pusherChannels[namespace];
};
