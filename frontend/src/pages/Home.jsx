import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import StatsSection from '../components/StatsSection';
import FeaturesSection from '../components/FeaturesSection';
import UserRolesSection from '../components/UserRolesSection';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="landing-page-wrapper">
      <Navbar />
      <main className="landing-main-content">
        <Hero />
        <StatsSection />
        <FeaturesSection />
        <UserRolesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
