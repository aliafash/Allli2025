import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionProvider } from "@/contexts/SessionContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { Splash } from "@/components/Splash";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import TechnicianProfile from "@/pages/TechnicianProfile";
import Booking from "@/pages/Booking";
import BookingHistory from "@/pages/BookingHistory";
import Chat from "@/pages/Chat";
import Favorites from "@/pages/Favorites";
import Notifications from "@/pages/Notifications";
import About from "@/pages/About";
import Privacy from "@/pages/Privacy";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/technician/:id" component={TechnicianProfile} />
      <Route path="/booking/:id" component={Booking} />
      <Route path="/bookings" component={BookingHistory} />
      <Route path="/chat/:id" component={Chat} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/about" component={About} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SessionProvider>
          <AdminProvider>
            {showSplash && <Splash onDone={() => setShowSplash(false)} />}
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </AdminProvider>
        </SessionProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
