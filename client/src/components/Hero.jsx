import FileInput from "./FileInput";
import DNAStrand from "./DNAStrand";

// eslint-disable-next-line react/prop-types
const Hero = ({handleFileUpload}) => {
  return (
    <div className="w-full min-h-[90vh] place-content-center grid grid-cols-1 md:grid-cols-2 gap-4 ">
      <FileInput handleFileUpload={handleFileUpload} />
      <div className="relative">
        <DNAStrand rotate={"125deg"} numberDivs={30} classes={"top-20 right-[12rem]"} />
      </div>
    </div>
  );
};

export default Hero;
