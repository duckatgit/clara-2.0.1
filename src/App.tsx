import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ChatProvider } from './contexts/ChatContext';
import Layout from './components/layout/Layout';
import Chat from './components/chat/Chat';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import AuthLayout from './components/auth/AuthLayout';
import Goals from './components/goals/Goals';
import Insights from './components/insights/Insights';
import Settings from './components/settings/Settings';
import Activities from './components/activities/Activities';
import Journal from './components/activities/Journal';
import PersonalityTest from './components/activities/personality/PersonalityTest';
import PersonalityResults from './components/activities/personality/PersonalityResults';
import PrivateRoute from './components/auth/PrivateRoute';
import { PersonalityProvider } from './components/activities/personality/PersonalityContext';
import Onboarding from './components/onboarding/Onboarding';
import Admin from './components/admin/Admin';
import Pricing from './components/pricing/Pricing';

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ChatProvider>
            <Toaster position="top-center" />
            <Routes>
              {/* Public routes - accessible without authentication */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
              </Route>

              {/* Protected routes - require authentication */}
              <Route path="/onboarding" element={
                <PrivateRoute>
                  <Onboarding />
                </PrivateRoute>
              } />

              {/* Main app routes - require authentication and completed onboarding */}
              <Route element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }>
                <Route path="/" element={<Navigate to="/chat" replace />} />
                <Route path="/chat" element={<Chat />} />
                
                <Route path="/goals" element={<Goals />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/activities" element={<Activities />} />

                <Route path="/activities/journal" element={<Journal />} />
                <Route path="/activities/personality" element={
                  <PersonalityProvider>
                    <PersonalityTest />
                  </PersonalityProvider>
                } />
                <Route path="/activities/personality/results" element={
                  <PersonalityProvider>
                    <PersonalityResults />
                  </PersonalityProvider>
                } />
              </Route>

              {/* Catch all route - redirect to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
              <Route path="/pricing" element={<Pricing />} />
            </Routes>
          </ChatProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;