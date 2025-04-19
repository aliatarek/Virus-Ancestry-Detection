// eslint-disable-next-line react/prop-types
const DNAStrand = ({ rotate,numberDivs,classes }) => {
  const numberOfDivs = numberDivs; // Number of DNA lines
  const rotateDelay = 0.15; // Delay between each div animation

  const createDivs = () => {
    return Array.from({ length: numberOfDivs }, (_, index) => {
      const animationDelay = `${index * rotateDelay - 60}s`;
      return (
        <div
          key={index}
          style={{
            animationDelay,
          }}
        >
          <span
            style={{
              animationDelay,
            }}
          ></span>
          <span
            style={{
              animationDelay,
            }}
          ></span>
        </div>
      );
    });
  };

  return (
    <div
      id="dna"
      style={{
        transform: `rotate(${rotate})`,
      }}
      className={`relative ${classes} h-80`}
    >
      {createDivs()}
    </div>
  );
};

export default DNAStrand;
