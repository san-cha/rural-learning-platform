import React, { useState } from 'react'; 
import { Link } from 'react-router-dom';
import mainPhoto from '../images/main-photo.jpg';
import { Header } from '../components/Header.jsx';

function HeroSection({ title, subtitle, buttonText, buttonLink, image }) {
  return (
    <div style={{ padding: '4rem', textAlign: 'center', backgroundColor: '#f0f4f8' }}>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <button>{buttonText}</button>
      <img src={image = mainPhoto} alt="Hero" style={{ width: '100%', maxWidth: '500px' }} />
    </div>
  );
}

function CoursePreview({ courses }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Courses</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        {courses.map((course, index) => (
          <div key={index} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', width: '300px' }}>
            <img src={course.image} alt={course.title} style={{ width: '100%', height: 'auto' }} />
            <h3>{course.title}</h3>
            <p>{course.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Features({ features }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Key Features</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        {features.map((feature, index) => (
          <div key={index} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', width: '250px' }}>
            <span style={{ fontSize: '2rem' }}>{feature.icon}</span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Testimonials({ testimonials }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>What Our Users Say</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        {testimonials.map((testimonial, index) => (
          <div key={index} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', width: '300px' }}>
            <p>"{testimonial.message}"</p>
            <h4>- {testimonial.name}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}

function Footer({ contactInfo, socialLinks }) {
  return (
    <div style={{ padding: '2rem', backgroundColor: '#333', color: 'white', textAlign: 'center' }}>
      <p>Contact: {contactInfo.email} | {contactInfo.phone}</p>
      <p>Social: <a href={socialLinks.facebook} style={{ color: 'white' }}>Facebook</a> | <a href={socialLinks.twitter} style={{ color: 'white' }}>Twitter</a></p>
    </div>
  );
}

// Feature Box Component
function FeatureBox({ icon, title, description }) {
  return (
    <div style={{ backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'transform 0.3s' }}>
      <div style={{ marginBottom: '1rem', fontSize: '2.5rem' }}>{icon}</div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ color: '#6b7280' }}>{description}</p>
    </div>
  );
}

// Stats Box Component
function StatBox({ number, text }) {
  return (
    <div style={{ backgroundColor: '#d1fae5', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
      <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#047857' }}>{number}</h2>
      <p style={{ color: '#4b5563', marginTop: '0.5rem' }}>{text}</p>
    </div>
  );
}

export default function Home() {
  const [language, setLanguage] = useState('English');
  return (
    <div>
      <Header
        user={{ name: "Sanjana Chavan", role: "Student" }}
        currentLanguage={language}
        onLanguageChange={setLanguage}
      />
      <HeroSection
        title="SarvaShiksha"
        subtitle="Access quality learning resources anytime, anywhere."
        buttonText="Get Started"
        buttonLink="/auth"
        image="../images/main-photo.jpg"
      />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          <FeatureBox
            icon="🎧"
            title="Audio First Learning"
            description="Learn through high quality audio lessons designed for rural environments"
          />
          <FeatureBox
            icon="⬇"
            title="Offline Access"
            description="Download lessons and continue learning even without internet connectivity"
          />
          <FeatureBox
            icon="👥"
            title="Community Focused"
            description="Built specifically for rural schools and NGO education programs"
          />
          <FeatureBox
            icon="🌐"
            title="Multi Language"
            description="Support for local languages with easy switching and TTS capabilities"
          />
        </div>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '3rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', textAlign: 'center' }}>
        <StatBox number="10,000+" text="Students Reached" />
        <StatBox number="500+" text="Lessons Available" />
        <StatBox number="95%" text="Offline Capability" />
      </div>

      <CoursePreview
        courses={[
          { title: "Basic Math Skills", description: "Learn fundamental math concepts.", image: "./images/basic-math-skills.png" },
          { title: "English Literacy", description: "Improve reading and writing skills.", image: "./images/eng-learner.jpg" },
          { title: "Science Exploration", description: "Hands-on experiments.", image: "./images/kid-sci-exp.jpg" }
        ]}
      />
      <Features
        features={[
          { icon: "📚", title: "Comprehensive Content", description: "All subjects covered." },
          { icon: "💻", title: "Online Accessibility", description: "Learn from anywhere." },
          { icon: "🤝", title: "Community Support", description: "Connect with mentors and peers." },
        ]}
      />
      <Testimonials
        testimonials={[
          { name: "Ravi Kumar", message: "This platform helped me a lot!" },
          { name: "Sunita Devi", message: "My children love learning here!" },
        ]}
      />
      <Footer
        contactInfo={{ email: "contact@ruraledu.org", phone: "+91 1234567890" }}
        socialLinks={{ facebook: "https://facebook.com/ruraledu", twitter: "https://twitter.com/ruraledu" }}
      />
    </div>
  );
}