import { Server } from 'socket.io';
export declare const activeTimers: Map<string, NodeJS.Timeout>;
export declare function startBookingTimer(io: Server, bookingId: string, endTime: Date): void;
export declare function completeBooking(io: Server, bookingId: string): Promise<void>;
export declare function extendBookingTimer(io: Server, bookingId: string, newEndTime: Date): void;
export declare function setupSocketHandlers(io: Server): void;
//# sourceMappingURL=socketHandler.d.ts.map