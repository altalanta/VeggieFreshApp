import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import FoodLog from "@/pages/food-log";
import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/onboarding";
import { useState, useEffect } from "react";

const PLACEHOLDER_USER_ID = "test-user-id"; // Same placeholder as in other files

function Router() {
  const [location, setLocation] = useLocation();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    // In a real app, this would check if the user has a complete profile in the DB
    // For now, we'll simulate it with a localStorage flag.
    const onboardingStatus = localStorage.getItem("onboardingComplete");
    setIsOnboardingComplete(onboardingStatus === "true");
  }, []);

  if (isOnboardingComplete === null) {
    return null; // Or a loading spinner
  }

  if (!isOnboardingComplete && location !== "/onboarding") {
    setLocation("/onboarding");
    return null;
  }

  const handleOnboardingComplete = () => {
    localStorage.setItem("onboardingComplete", "true");
    setIsOnboardingComplete(true);
    setLocation("/");
  };

  return (
    <Switch>
      <Route path="/">
        {isOnboardingComplete ? <Home /> : <Onboarding onOnboardingComplete={handleOnboardingComplete} />}
      </Route>
      <Route path="/onboarding">
        <Onboarding onOnboardingComplete={handleOnboardingComplete} />
      </Route>
      <Route path="/log" component={FoodLog} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
