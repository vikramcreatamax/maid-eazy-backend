import User from '../models/User.js';
export const requireAdmin = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select('role');
        if (!user) {
            res.status(401).json({ success: false, message: 'User not found' });
            return;
        }
        if (user.role !== 'admin') {
            res.status(403).json({ success: false, message: 'Admin access required' });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
//# sourceMappingURL=admin.js.map