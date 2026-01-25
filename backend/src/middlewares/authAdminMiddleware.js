
export const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({message: "Denegado. Se requieren permisos de administrador."});
    }
    next();
};