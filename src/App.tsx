import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CurrentUserProvider, useCurrentUser } from "@/context/CurrentUserContext";
import AppLayout from "@/components/layout/AppLayout";
import RequireAdmin from "@/components/auth/RequireAdmin";
import AdminDashboard from "@/pages/AdminDashboard";
import EmployeeDashboard from "@/pages/EmployeeDashboard";
import AllTasks from "@/pages/AllTasks";
import CalendarPage from "@/pages/CalendarPage";
import ActivityLog from "@/pages/ActivityLog";
import AccessDenied from "@/pages/AccessDenied";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function HomeRoute() {
  const { isAdmin } = useCurrentUser();
  return isAdmin ? <AdminDashboard /> : <Navigate to="/employee" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CurrentUserProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="bottom-right" richColors />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomeRoute />} />
              <Route path="/employee" element={<EmployeeDashboard />} />
              <Route
                path="/tasks"
                element={
                  <RequireAdmin>
                    <AllTasks />
                  </RequireAdmin>
                }
              />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route
                path="/activity"
                element={
                  <RequireAdmin>
                    <ActivityLog />
                  </RequireAdmin>
                }
              />
              <Route path="/access-denied" element={<AccessDenied />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CurrentUserProvider>
  </QueryClientProvider>
);

export default App;
