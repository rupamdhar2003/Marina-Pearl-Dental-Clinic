import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { I18nProvider } from './lib/i18n.jsx';
import { AuthProvider, useAuth } from './lib/auth.jsx';

import Header from './components/Header/Header.jsx';
import Footer from './components/Footer/Footer.jsx';
import WhatsAppFloat from './components/WhatsAppFloat/WhatsAppFloat.jsx';
import StickyBookMobile from './components/StickyBookMobile/StickyBookMobile.jsx';

import Home from './pages/Home/Home.jsx';
import About from './pages/About/About.jsx';
import Services from './pages/Services/Services.jsx';
import ServiceDetail from './pages/ServiceDetail/ServiceDetail.jsx';
import Doctors from './pages/Doctors/Doctors.jsx';
import DoctorDetail from './pages/DoctorDetail/DoctorDetail.jsx';
import Contact from './pages/Contact/Contact.jsx';
import Privacy from './pages/Legal/Privacy.jsx';
import Terms from './pages/Legal/Terms.jsx';
import NotFound from './pages/NotFound/NotFound.jsx';

import Booking from './pages/Booking/Booking.jsx';
import ManageAppointment from './pages/ManageAppointment/ManageAppointment.jsx';

import AdminLogin from './admin/AdminLogin/AdminLogin.jsx';
import AdminShell from './admin/AdminShell/AdminShell.jsx';
import AdminDashboard from './admin/AdminDashboard/AdminDashboard.jsx';
import AdminCalendar from './admin/AdminCalendar/AdminCalendar.jsx';
import AdminAppointments from './admin/AdminAppointments/AdminAppointments.jsx';
import AdminPatients from './admin/AdminPatients/AdminPatients.jsx';
import AdminDoctors from './admin/AdminDoctors/AdminDoctors.jsx';
import AdminServices from './admin/AdminServices/AdminServices.jsx';
import AdminSettings from './admin/AdminSettings/AdminSettings.jsx';

function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
    return null;
}

function RequireStaff({ children }) {
    const { user, role, loading } = useAuth();
    const loc = useLocation();
    
    if (loading) return null;
    if (!user) return <Navigate to="/admin/login" state={{ from: loc.pathname }} replace />;
    if (role !== 'staff') return <Navigate to="/" replace />;
    return children;
}

function Shell({ children }) {
    return (
        <>
            <a href="#main" className="mp-skip">Skip to main content</a>
            <Header />
            <main id="main">{children}</main>
            <Footer />
            <WhatsAppFloat />
            <StickyBookMobile />
        </>
    );
}

export default function App() {
    return (
        <I18nProvider>
            <AuthProvider>
                <ScrollToTop />
                <Routes>
                    {/* Public site */}
                    <Route path="/"           element={<Shell><Home /></Shell>} />
                    <Route path="/about"      element={<Shell><About /></Shell>} />
                    <Route path="/services"   element={<Shell><Services /></Shell>} />
                    <Route path="/services/:slug" element={<Shell><ServiceDetail /></Shell>} />
                    <Route path="/doctors"    element={<Shell><Doctors /></Shell>} />
                    <Route path="/doctors/:id" element={<Shell><DoctorDetail /></Shell>} />
                    <Route path="/contact"    element={<Shell><Contact /></Shell>} />
                    <Route path="/privacy"    element={<Shell><Privacy /></Shell>} />
                    <Route path="/terms"      element={<Shell><Terms /></Shell>} />
                    <Route path="/book"       element={<Shell><Booking /></Shell>} />
                    <Route path="/manage/:token" element={<Shell><ManageAppointment /></Shell>} />

                    {/* Staff admin */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={
                        <RequireStaff><AdminShell /></RequireStaff>
                    }>
                        <Route index element={<AdminDashboard />} />
                        <Route path="calendar"     element={<AdminCalendar />} />
                        <Route path="appointments" element={<AdminAppointments />} />
                        <Route path="patients"     element={<AdminPatients />} />
                        <Route path="doctors"      element={<AdminDoctors />} />
                        <Route path="services"     element={<AdminServices />} />
                        <Route path="settings"     element={<AdminSettings />} />
                    </Route>

                    <Route path="*" element={<Shell><NotFound /></Shell>} />
                </Routes>
            </AuthProvider>
        </I18nProvider>
    );
}
