// 1. Declare the variable and EXPORT it so other files can import it.
export let siteContent = {};

// 2. EXPORT the function so main.js can call it.
export async function fetchContent() {
    try {
        const response = await fetch('content.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // This now correctly assigns the fetched data to the exported variable.
        siteContent = await response.json();
        console.log("Site content loaded successfully.");
    } catch (error) {
        console.error("Could not load site content:", error);
        // Setup fallback content if JSON loading fails
        siteContent.operatorLog = { 
            title: "Error Reading Profile", 
            text: "Operator Log content could not be loaded.\nPlease check content.json." 
        };
        siteContent.moyamoyaLauncher = { 
            title: "Error Loading Launcher", 
            text: "Moyamoya OS Launcher content could not be loaded.\nPlease check content.json." 
        };
        siteContent.lichtungExplainer = { 
            title: "Error Loading Notes", 
            text: "Lichtung notes could not be loaded.\nPlease check content.json." 
        };
    }
}