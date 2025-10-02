export default function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition">
      <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full mb-4">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
