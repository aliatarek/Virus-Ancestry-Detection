import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import DNAStrand from "./DNAStrand";
import { fetchPdfReport } from "../endpoints/detectionEndpoints";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

// eslint-disable-next-line react/prop-types
const DNAGraph = ({ className, matches }) => {
  // Ensure matches array is valid and non-empty
  const bestMatch =
    matches && matches.length > 0
      ? matches.sort((a, b) => b.score - a.score)[0]
      : null;

  // Data for the Bar Chart
  const data = {
    labels: matches.map((match) => match.name), // Use match names for labels
    datasets: [
      {
        label: "Match Scores",
        data: matches.map((match) => match.score), // Use match scores for the dataset
        backgroundColor: matches.map((_, i) => {
          const colors = ["#6366F1", "#EC4899", "#22C55E", "#3B82F6"];
          return colors[i % colors.length]; // Cycle through colors
        }),
        borderColor: matches.map((_, i) => {
          const colors = ["#6366F1", "#EC4899", "#22C55E", "#3B82F6"];
          return colors[i % colors.length];
        }),
        borderWidth: 1,
        borderRadius: 8, // Rounded bar corners
        barThickness: 50, // Adjusted bar thickness
      },
    ],
  };

  // Options for the Bar Chart
  const options = {
    scales: {
      x: {
        grid: {
          color: "", // Light gray grid lines
        },
        ticks: {
          color: "white", // Muted text for labels
          font: {
            family: "Inter, sans-serif",
            size: 14,
          },
        },
      },
      y: {
        grid: {
          color: "",
        },
        ticks: {
          color: "white",
          font: {
            family: "Inter, sans-serif",
            size: 14,
          },
          stepSize: 5, // Adjust for better readability
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.9)", // Light tooltip background
        titleColor: "rgba(55, 65, 81)", // Dark tooltip title
        bodyColor: "rgba(55, 65, 81)", // Dark tooltip text
        borderWidth: 1,
        borderColor: "rgba(229, 231, 235)", // Light tooltip border
        titleFont: {
          family: "Inter, sans-serif",
          size: 14,
        },
        bodyFont: {
          family: "Inter, sans-serif",
          size: 12,
        },
        cornerRadius: 4,
      },
    },
    maintainAspectRatio: false,
    responsive: true,
  };
  // Button click handler
const handleDownloadPdf = async () => {
 await fetchPdfReport();
};


  if (matches.length === 0) {
    return (
      <div
        className={`grid dna-graph h-screen text-center gap-3 overflow-hidden`}
      >
        <div>
          <h2 className="text-3xl text-white font-semibold pt-20 pb-2">
            Ancestors Detected
          </h2>
          <p className="text-red-700 text-xl font-semibold">
            No mathces detected
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-3xl text-white w-full text-center font-semibold">
        Ancestors Detected
      </h2>
      <div
        className={`w-full dna-graph flex items-center h-screen justify-around gap-3 pb-10 px-10`}
      >
        {/* Left DNA Strand */}
        <div className="relative rounded-xl h-[30rem] w-1/4 flex flex-col items-center justify-center">
          <h2 className="text-3xl mb-1 font-semibold text-white">Best Match</h2>
          <h2 className="text-3xl mb-5 font-semibold text-green-400">
            {bestMatch ? bestMatch.name : "N/A"}
          </h2>
          <DNAStrand
            rotate={"90deg"}
            numberDivs={15}
            classes={"top-[-4.5rem]"}
          />
        </div>
        {/* Bar Chart */}
        <div className="w-2/4 h-3/4">
          <div className=" h-full w-full p-6 shadow-md rounded-lg border border-gray-200">
            <Bar data={data} options={options} />
          </div>
          <span className="w-full flex items-center justify-center pt-5 ">
            <button onClick={handleDownloadPdf} className=" py-2 px-5 text-white bg-teal-800 rounded-xl font-semibold hover:opacity-80 transition duration-300 ease-in-out">
              Download Ansectory Report
            </button>
          </span>
        </div>
        {/* Right DNA Strand */}
        <div className="relative rounded-xl h-[30rem] w-1/4 flex flex-col items-center justify-center">
          <h2 className="text-3xl mb-4 font-semibold text-white">
            Uploaded Virus
          </h2>
          <DNAStrand
            rotate={"90deg"}
            numberDivs={15}
            classes={"top-[-4.5rem]"}
          />
        </div>
      </div>
    </>
  );
};

export default DNAGraph;
