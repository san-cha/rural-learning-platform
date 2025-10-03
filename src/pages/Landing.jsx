import { Link } from "react-router-dom";
import { useState } from "react";
import { 
  Volume2, 
  Wifi, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Search 
} from "lucide-react";
import Button from "../components/ui/Button";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FeatureCard from "../components/FeatureCard";

const Landing = () => {
    const [language, setLanguage] = useState("en");
    return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header
        user={{ name: "Sanjana Chavan", role: "Student" }}
        currentLanguage={language}
        onLanguageChange={setLanguage}
      />

      <main className="flex-grow">
        {/* Hero Section - Redesigned to match the screenshot */}
        <section className="bg-blue-600 text-white">
          <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center px-6 py-20 md:py-28">
            
            {/* Left Column: Text Content */}
            <div className="animate-fade-in text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
                Empowering Education
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-md mx-auto md:mx-0">
                Transforming minds and shaping futures through innovative learning experiences.
              </p>
              <div className="flex justify-center md:justify-start mb-10">
                <Link to="/auth">
                  <Button
                    size="lg"
                    className="h-12 px-8 rounded-md text-base bg-white text-blue-600 font-semibold hover:bg-gray-100 shadow-lg transition-transform transform hover:scale-105"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-5 text-blue-200">
                <div className="p-3 bg-blue-500/60 rounded-full" title="Courses">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div className="p-3 bg-blue-500/60 rounded-full" title="Resources">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="p-3 bg-blue-500/60 rounded-full" title="Search">
                  <Search className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Right Column: Image */}
            <div className="animate-fade-in flex items-center justify-center">
                            <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop"
                alt="Students collaborating in a bright, modern classroom"
                className="rounded-lg shadow-2xl w-full max-w-lg"
              />
            </div>
          </div>
        </section>

        {/* Features Section - Kept from the original code */}
        <section id="features" className="py-20 px-4 bg-muted/40">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 md:text-4xl">Why SarvaShiksha?</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Built specifically for rural education needs, making quality learning accessible to everyone.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <FeatureCard
                icon={Volume2}
                title="Audio-First Lessons"
                description="Listen and learn with high-quality audio lessons in your local language. Perfect for students with limited reading experience."
              />
              <FeatureCard
                icon={Wifi}
                title="Offline Support"
                description="Download lessons once and access them anytime, anywhere. No internet? No problem. Learn at your own pace."
              />
              <FeatureCard
                icon={Users}
                title="Teacher Uploads"
                description="Content created by experienced teachers who understand your community. Real educators, real knowledge."
              />
            </div>
          </div>
        </section>

        {/* Contact Section - Kept from the original code */}
        <section id="contact" className="py-20 px-4 bg-background">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">Get Started Today</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Join thousands of students already learning with LearnHub.
            </p>
            <Link to="/auth">
              <Button size="lg" className="h-12 px-8 rounded-full text-base">
                Create Free Account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Landing;