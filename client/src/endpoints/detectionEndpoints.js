// eslint-disable-next-line no-unused-vars
export const sendFasta = async (fastaFile) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await fetch(`http://localhost:8080/detect_ancestors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fastaFile: fastaFile, // Wrap the Base64 string in an object with the correct key
        }),
      });
  
      return response;
    } catch (error) {
      throw error; // Let the caller handle the error
    }
  };
  
// eslint-disable-next-line no-unused-vars
export const fetchPdfReport = async () => {
  try {
    const response = await fetch(`http://localhost:8080/generate_pdf_report`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch the PDF report. Status: ${response.status}`);
    }

    // Convert the response into a Blob
    const blob = await response.blob();

    // Create a temporary URL for the Blob
    const url = window.URL.createObjectURL(blob);

    // Create a link element to trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = "virus_report.pdf"; // The file name for the downloaded file
    document.body.appendChild(link);
    link.click();

    // Clean up
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error fetching and downloading the PDF report:", error);
  }
};
