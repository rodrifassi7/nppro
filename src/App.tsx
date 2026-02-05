import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { OrdersProvider } from './context/OrdersContext';
import { CustomersProvider } from './context/CustomersContext';
import { FollowupsProvider } from './context/FollowupsContext';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { Loader2 } from 'lucide-react';

import { Dashboard } from './pages/Dashboard';
import { NewOrder } from './pages/NewOrder';
import { OrdersList } from './pages/OrdersList';
import { Meals } from './pages/Meals';
import { Customers } from './pages/Customers';
import { Followups } from './pages/Followups';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-slate-400" size={40} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CustomersProvider>
          <FollowupsProvider>
            <OrdersProvider>
              <Routes>
                <Route path="/login" element={<Login />} />

                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route index element={<Dashboard />} />
                  <Route path="new-order" element={<NewOrder />} />
                  <Route path="orders" element={<OrdersList />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="followups" element={<Followups />} />
                  <Route path="meals" element={<Meals />} />
                </Route>
              </Routes>
            </OrdersProvider>
          </FollowupsProvider>
        </CustomersProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
