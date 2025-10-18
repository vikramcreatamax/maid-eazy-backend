import { Server } from 'socket.io';
import 'dotenv/config';
declare const io: Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
declare function startBookingTimer(bookingId: string, endTime: Date): void;
declare function extendBookingTimer(bookingId: string, newEndTime: Date): void;
export { io, startBookingTimer, extendBookingTimer };
//# sourceMappingURL=server.d.ts.map