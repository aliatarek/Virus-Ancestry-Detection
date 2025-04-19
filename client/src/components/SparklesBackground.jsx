
const SparklesBackground = () => {
  const numSparkles = 300; // Increase the number for more sparkles
  const sparkles = Array.from({ length: numSparkles });

  return (
    <div className="sparkles-container">
      {sparkles.map((_, index) => {
        // Calculate the angle and radius for each sparkle
        const angle = (index / numSparkles) * 2 * Math.PI;
        const radius = Math.random() * 50; // Random radius for distribution within the circle
        const x = 50 + radius * Math.cos(angle); // X position as a percentage of the container width
        const y = 50 + radius * Math.sin(angle); // Y position as a percentage of the container height

        return (
          <div
            key={index}
            className="sparkle"
            style={{
              top: `${y}%`,
              left: `${x}%`,
              animationDelay: `${Math.random()}s`,
            }}
          />
        );
      })}
    </div>
  );
};

export default SparklesBackground;

