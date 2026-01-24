import { Toaster } from "@/ui/toaster";
import { Toaster as Sonner } from "@/ui/sonner";
import { TooltipProvider } from "@/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Home from "./pages/Home";
import GetStarted from "./pages/GetStarted";
import Login from "./pages/Login";
import CreateLawyerProfile from "./pages/CreateLawyerProfile";
import CreatePartnerProfile from "./pages/CreatePartnerProfile";
import Dashboard from "./pages/Dashboard";
import Diaries from "./pages/Diaries";
import CreateDiary from "./pages/CreateDiary";
import DiaryView from "./pages/DiaryView";
import EditDiary from "./pages/EditDiary";
import FindLawyers from "./pages/FindLawyers";
import Requests from "./pages/Requests";
import Partners from "./pages/Partners";
import MyRequests from "./pages/MyRequests";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/get-started" element={<GetStarted />} />
            <Route path="/login" element={<Login />} />
            <Route path="/create-profile/lawyer" element={<CreateLawyerProfile />} />
            <Route path="/create-profile/partner" element={<CreatePartnerProfile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/diaries" element={<Diaries />} />
            <Route path="/diaries/new" element={<CreateDiary />} />
            <Route path="/diaries/:id" element={<DiaryView />} />
            <Route path="/diaries/:id/edit" element={<EditDiary />} />
            <Route path="/find-lawyers" element={<FindLawyers />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/my-requests" element={<MyRequests />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
