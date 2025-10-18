import { NextFunction, Request, Response } from 'express';
export declare const getAllMaids: (req: Request, res: Response) => Promise<void>;
export declare const getMaidById: (req: Request, res: Response) => Promise<void>;
export declare const getAvailability: (req: Request, res: Response) => Promise<void>;
export declare const createMaid: (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const updateMaid: (req: Request, res: Response) => Promise<void>;
export declare const deleteMaid: (req: Request, res: Response) => Promise<void>;
export declare const getBookingsByMaid: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=maidController.d.ts.map