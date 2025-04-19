import { useState, useEffect } from "react";
import DNAGraph from "./components/DNAGraph";
import gsap from "gsap";
import Hero from "./components/Hero";
import Nav from "./components/Nav";
import SparklesBackground from "./components/SparklesBackground";
import { sendFasta } from "./endpoints/detectionEndpoints";
import Loader from "./components/Loader";

function App() {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const [matches, setMatches] = useState([]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]; // Get the uploaded file

    if (file) {
      const reader = new FileReader();

      // When file reading is complete
      reader.onload = async () => {
        const base64String = reader.result.split(",")[1]; // Extract Base64 data

        setIsFetched(true); // Reset fetch status before API call

        try {
          // Send the Base64 string to the backend
          const response = await sendFasta(base64String);

          // Check the response status or data to determine if it's okay
          if (
            response?.status === 200 ||
            response?.ok ||
            response?.data?.success
          ) {
            console.log("File processed successfully:", response);
            const data = await response.json();
            console.log(data);
            setMatches(data.matches);
            // Proceed to trigger the animation
            setFileUploaded(true);
          } else {
            console.error("Backend error or invalid response:", response);
          }
        } catch (error) {
          console.error("Error during API call:", error);
        } finally {
          setIsFetched(false); // Mark fetch as complete
        }
      };

      // Read the file as a Data URL (Base64)
      reader.readAsDataURL(file);
    } else {
      console.error("No file selected");
    }
  };

  useEffect(() => {
    if (fileUploaded) {
      // Delay the animation to ensure the DOM is ready
      setTimeout(() => {
        const tl = gsap.timeline();

        gsap.utils
          .toArray(".color-wipe-layer")
          .forEach((layer, index) => {
            tl.to(
              layer,
              {
                y: "-100%", // Move each layer from bottom to top
                duration: 1,
                ease: "power2.out",
              },
              index * 0.3 // Stagger the layers
            );
          });

        tl.to(
          ".dna-graph",
          {
            opacity: 1,
            duration: 1,
            ease: "power2.out",
          },
          "-=1" // Overlap timing with the last wipe
        );
      }, 100); // Timeout to ensure element is in the DOM
    }
  }, [fileUploaded]);

  return (
    <div>
      {isFetched && <Loader />}
      <div className="overflow-hidden">
        <Nav />
        <SparklesBackground />
        {!fileUploaded && <Hero handleFileUpload={handleFileUpload} />}
        {fileUploaded && (
          <div className="dna-graph-container">
            <div className="color-wipe-layer layer2"></div>
            <div className="color-wipe-layer layer1"></div>
            <DNAGraph className="dna-graph" matches={matches} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
