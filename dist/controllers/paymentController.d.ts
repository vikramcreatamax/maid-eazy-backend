import { Request, RequestHandler, Response } from 'express';
export declare const processPayment: RequestHandler;
export declare const getPaymentByUser: (req: Request, res: Response) => Promise<any>;
export declare const getPaymentByBooking: (req: Request, res: Response) => Promise<any>;
export declare const addAmountInWallet: RequestHandler;
export declare const verifyPaymentProcess: RequestHandler;
//# sourceMappingURL=paymentController.d.ts.map