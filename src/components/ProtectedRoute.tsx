import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = () => {
    const { token, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>; // Or a proper Spinner
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
