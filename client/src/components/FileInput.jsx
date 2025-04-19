import { GrUpload } from "react-icons/gr";

// eslint-disable-next-line react/prop-types
const FileInput = ({handleFileUpload}) => {
  return (
    <section className="flex flex-col items-center p-6 gap-6  text-white">
      <h2 className="text-4xl font-bold text-center">
        Ancestry Virus Identification
      </h2>
      <p className="text-center max-w-xl leading-relaxed">
        Discover the origins of viral DNA with our advanced identification tool. Upload your DNA sequence in FASTA format to analyze its lineage and explore its ancestral connections.
      </p>
      <label className="flex flex-col items-center justify-center w-64 h-32 border-2 border-dashed border-white rounded-lg bg-[#83c5be] hover:bg-[#edf6f9dc] cursor-pointer transition-all duration-300 ease-in-out">
        <input
          id="file-upload"
          type="file"
          accept=".fasta"
          className="hidden"
          onChange={handleFileUpload}
        />
        <GrUpload size={40} className="text-[#264653]" />
        <span className="mt-3 font-semibold text-[#264653]">
          Upload Virus DNA
        </span>
      </label>
    </section>
  );
};

export default FileInput;
