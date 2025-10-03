export default function About() {
  return (
    <div className="w-full bg-gray-50 pb-20">
      
      {/* 1. Dynamic Header Section: Uses the brand color strategically */}
      <div className="bg-blue-600 pt-16 pb-20 px-4 text-white shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Empowering Education, Bridging the Divide
          </h1>
          <p className="text-xl sm:text-2xl font-light opacity-90 max-w-4xl">
            SarvaShiksha is dedicated to delivering high-quality, technology-driven learning solutions directly to students in rural areas.
          </p>
        </div>
      </div>

      {/* 2. Main Content & Image Section: Overlaps header for a dynamic look */}
      <div className="px-4 -mt-16">
        {/* Main Content Card with hover effect */}
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl p-8 lg:p-12 transform transition duration-300 hover:scale-[1.005]">
          
          <div className="grid md:grid-cols-12 gap-10 items-start">
            
            {/* Column 1: Detailed Text Content */}
            <div className="md:col-span-7 text-gray-800">
              <h2 className="text-4xl font-bold mb-8 text-blue-700">The SarvaShiksha Initiative</h2>
              
              {/* Highlighted core mission */}
              <p className="text-xl mb-6 font-semibold leading-relaxed text-gray-900">
                Welcome to SarvaShiksha Rural Learning Platform! Our core mission is to make high-quality learning resources and lessons accessible to every student.
              </p>
              
              {/* Secondary details */}
              <p className="text-lg text-gray-600 leading-relaxed">
                We leverage technology and innovative, localized learning modules to transform minds and shape brighter futures. Our platform provides interactive quizzes, self-paced modules, and access to certified educators. Our team is a passionate collective of educators, technologists, and social workers dedicated to making a tangible difference in rural education through technology and a supportive online community.
              </p>
            </div>

            {/* Column 2: Dynamic Image Placeholder */}
            <div className="md:col-span-5 flex justify-center pt-4 md:pt-0">
              {/* Image card with tighter border, making it feel more integrated */}
              <div className="w-full max-w-sm md:max-w-none rounded-xl shadow-xl overflow-hidden p-0 transform hover:scale-[1.05] transition duration-300">
                <img 
                  src="https://i.pinimg.com/1200x/f1/5f/1d/f15f1de1d6b7c90bfc7a1c6302c9d280.jpg" 
                  alt="Our team collaborating on education resources" 
                  className="w-full h-auto object-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/2563eb/ffffff?text=Education+Image+Placeholder'; }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
