import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './DashboardLayout'
import ProtectedRoute from './ProtectedRoute'

// Admin Pages
import Dashboard from './pages/Dashboard'
import SiteSettings from './pages/SiteSettings'
import HeroSettings from './pages/HeroSettings'
import AboutSettings from './pages/AboutSettings'
import SkillsSettings from './pages/SkillsSettings'
import ProjectsSettings from './pages/ProjectsSettings'
import ExperienceSettings from './pages/ExperienceSettings'
import AchievementsSettings from './pages/AchievementsSettings'
import EducationSettings from './pages/EducationSettings'
import HobbiesSettings from './pages/HobbiesSettings'
import TestimonialsSettings from './pages/TestimonialsSettings'
import BlogsSettings from './pages/BlogsSettings'
import SocialMediaSettings from './pages/SocialMediaSettings'
import ServicesSettings from './pages/ServicesSettings'
import QuotesSettings from './pages/QuotesSettings'
import MusicSettings from './pages/MusicSettings'
import ContributionsSettings from './pages/ContributionsSettings'
import LanguagesSettings from './pages/LanguagesSettings'
import OrganizationsSettings from './pages/OrganizationsSettings'

const AdminRoutes = () => {
  return (
    <ProtectedRoute>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="site-settings" element={<SiteSettings />} />
          <Route path="hero" element={<HeroSettings />} />
          <Route path="about" element={<AboutSettings />} />
          <Route path="skills" element={<SkillsSettings />} />
          <Route path="projects" element={<ProjectsSettings />} />
          <Route path="experience" element={<ExperienceSettings />} />
          <Route path="achievements" element={<AchievementsSettings />} />
          <Route path="education" element={<EducationSettings />} />
          <Route path="hobbies" element={<HobbiesSettings />} />
          <Route path="blogs" element={<BlogsSettings />} />
          <Route path="testimonials" element={<TestimonialsSettings />} />
          <Route path="social-media" element={<SocialMediaSettings />} />
          <Route path="services" element={<ServicesSettings />} />
          <Route path="quotes" element={<QuotesSettings />} />
          <Route path="music" element={<MusicSettings />} />
          <Route path="contributions" element={<ContributionsSettings />} />
          <Route path="languages" element={<LanguagesSettings />} />
          <Route path="organizations" element={<OrganizationsSettings />} />
          {/* Redirect /admin/anything-unknown to dashboard */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Routes>
    </ProtectedRoute>
  )
}

export default AdminRoutes

