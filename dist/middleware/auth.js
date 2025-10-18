import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            res.status(401).json({ success: false, message: 'Token missing' });
            return;
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({ success: false, message: 'Token missing' });
            return;
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('_id name email');
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid token' });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
};
//# sourceMappingURL=auth.js.map