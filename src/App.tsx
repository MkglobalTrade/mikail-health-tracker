import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import GlucoseTracker from "./pages/GlucoseTracker";
import BloodPressureTracker from "./pages/BloodPressureTracker";
import MedicationManager from "./pages/MedicationManager";
import UploadLabs from "./pages/UploadLabs";
import AIDoctor from "./pages/AIDoctor";
import HealthNews from "./pages/HealthNews";
import Home from "./pages/Home";
import DashboardLayout from "./components/DashboardLayout";

function Router() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <DashboardLayout>
      <Switch>
        <Route path={"/"} component={Dashboard} />
        <Route path={"/glucose"} component={GlucoseTracker} />
        <Route path={"/blood-pressure"} component={BloodPressureTracker} />
        <Route path={"/medications"} component={MedicationManager} />
        <Route path={"/upload-labs"} component={UploadLabs} />
        <Route path={"/ai-doctor"} component={AIDoctor} />
        <Route path={"/health-news"} component={HealthNews} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
