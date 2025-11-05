const VideoPlayer = ({ filePath }) => {
  // Construct the full URL to the video file
  // Using the backend URL from environment or default to localhost:5000
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  
  // Ensure filePath doesn't start with /uploads if it already does
  const cleanPath = filePath.startsWith("/") ? filePath : `/${filePath}`;
  const videoUrl = `${backendUrl}${cleanPath}`;

  return (
    <div className="w-full">
      <video 
        width="100%" 
        controls 
        className="rounded-lg"
        preload="metadata"
      >
        <source src={videoUrl} type="video/mp4" />
        <source src={videoUrl} type="video/webm" />
        <source src={videoUrl} type="video/ogg" />
        Your browser does not support the video tag.
      </video>
      <p className="text-xs text-muted-foreground mt-2">
        If the video doesn't load, you can <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">download it here</a>.
      </p>
    </div>
  );
};

export default VideoPlayer;

