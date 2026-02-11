import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";

import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import PatientForm from "@/pages/PatientForm";
import PatientDetails from "@/pages/PatientDetails";
import VisitForm from "@/pages/VisitForm";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) {
    window.location.href = "/api/login";
    return null;
  }

  return (
    <Layout>
      <Component {...rest} />
    </Layout>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <Switch>
      <Route path="/api/login" component={() => null} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected Routes */}
      <Route path="/">
        {user ? <ProtectedRoute component={Dashboard} /> : <AuthPage />}
      </Route>
      
      <Route path="/patients/new">
        <ProtectedRoute component={PatientForm} />
      </Route>
      
      <Route path="/patients/:id">
        <ProtectedRoute component={PatientDetails} />
      </Route>
      
      <Route path="/patients/:id/new-visit">
        <ProtectedRoute component={VisitForm} />
      </Route>
      
      <Route path="/visits/:id">
        <ProtectedRoute component={VisitForm} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster />
    </QueryClientProvider>
  );
}

export default App;
