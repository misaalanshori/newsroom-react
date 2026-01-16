import { Routes, Route, Navigate } from 'react-router';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './pages/DashboardLayout';
import NewsPage from './pages/NewsPage';
import DepartmentPage from './pages/DepartmentPage';
import { ProtectedRoute } from './components/ProtectedRoute';

import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';
import RolesPage from './pages/RolesPage';
import PolicyPage from './pages/PolicyPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/news" replace />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="department" element={<DepartmentPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="policy" element={<PolicyPage />} />
          </Route>
        </Route>
      </Routes>
      <ReactQueryDevtools initialIsOpen={false} />
    </AuthProvider>
  )
}

export default App;
