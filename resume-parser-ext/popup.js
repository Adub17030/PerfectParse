document.getElementById('resumeUpload').addEventListener('change', handleFileUpload);
document.getElementById('saveSubmit').addEventListener('click', saveAndSubmit);
document.getElementById('saveAsTemplate').addEventListener('click', saveAsTemplate); // Event listener for new button

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const resumeText = e.target.result;
            parseResume(resumeText);
        };
        reader.readAsText(file);
    }
}

// function parseResume(resumeText) {
//     // Simulated parsing logic
//     const parsedData = 
//     {
//     "Personal Information": {
//         "content": "John Doe, johndoe@example.com",
//         "error": "Phone number is missing.",
//         "suggestion": "Please provide your phone number."
//     },
//     "Work Experience": {
//         "content": "Software Engineer at XYZ Corp, 2019-2021",
//         "error": "",
//         "suggestion": ""
//     },
//     "Education": {
//         "content": "Bachelor of Science in Computer Science",
//         "error": "Graduation year is not specified.",
//         "suggestion": "Please include your graduation year."
//     }
// }


//     displayParsedData(parsedData);
// }

async function parseResumeWithAI(resumeText, apiKey) {
    // OpenAI API endpoint for chat models (e.g., gpt-3.5-turbo)
    const endpoint = "https://api.openai.com/v1/chat/completions";

    // Define the prompt for parsing
    const prompt = `
        Extract the following sections from the resume:
        - Personal Information (Name, Email, Phone)
        - Work Experience (List of positions with company, role, and dates)
        - Education (Degree, Institution, and Graduation Year if available)

        Format the response as a JSON object with the fields: "Personal Information", "Work Experience", and "Education". 

        Resume:
        ${resumeText}
    `;

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo", // or "gpt-4" if you have access
                messages: [
                    { role: "system", content: "You are a resume parsing assistant." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 500
            })
        });

        const data = await response.json();
        
        // Ensure the response has content and is in expected format
        if (data.choices && data.choices[0].message) {
            // Parse the response from OpenAI, assuming JSON format
            const parsedData = JSON.parse(data.choices[0].message.content);
            displayParsedData(parsedData);
        } else {
            console.error("Unexpected response format:", data);
            displayParsedData({ error: "Parsing failed" });
        }

    } catch (error) {
        console.error("Error parsing resume:", error);
        displayParsedData({ error: "Unable to parse resume using OpenAI" });
    }
}


function displayParsedData(parsedData) {
    const parsedDataDiv = document.getElementById('parsedData');
    parsedDataDiv.innerHTML = ''; // Clear previous content

    for (const [section, content] of Object.entries(parsedData)) {
        const sectionDiv = document.createElement('div');
        sectionDiv.classList.add('section');

        // Create an editable input field for the parsed content
        const contentDiv = document.createElement('div');
        contentDiv.setAttribute('contenteditable', 'true'); // Make content editable
        contentDiv.classList.add('editable-content');
        contentDiv.innerHTML = `<strong>${section}</strong>: ${content.content}`; // Display the content

        // Check for errors and suggestions
        if (content.error) {
            const errorDiv = document.createElement('div');
            errorDiv.classList.add('error');
            errorDiv.innerHTML = `Error: ${content.error}`; // Highlight error message
            sectionDiv.appendChild(errorDiv);
        }

        if (content.suggestion) {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.classList.add('suggestion');
            suggestionDiv.innerHTML = `Suggestion: ${content.suggestion}`; // Display suggestion message
            sectionDiv.appendChild(suggestionDiv);
        }

        sectionDiv.appendChild(contentDiv); // Append the editable content
        parsedDataDiv.appendChild(sectionDiv); // Append the section to the main container
    }
}


function saveAndSubmit() {
    const parsedDataDiv = document.getElementById('parsedData');
    const sections = parsedDataDiv.querySelectorAll('.section');
    const parsedData = {};

    sections.forEach(section => {
        const sectionTitle = section.querySelector('strong').textContent;
        const sectionContent = section.textContent.replace(sectionTitle, '').trim();
        parsedData[sectionTitle] = sectionContent;
    });

    console.log("Saved Data:", parsedData);
    alert("Your resume data has been saved.");
}

function saveAsTemplate() {
    const parsedDataDiv = document.getElementById('parsedData');
    const sections = parsedDataDiv.querySelectorAll('.section');
    const templateData = {};

    sections.forEach(section => {
        const sectionTitle = section.querySelector('strong').textContent;
        const sectionContent = section.textContent.replace(sectionTitle, '').trim();
        templateData[sectionTitle] = sectionContent;
    });

    // For now, we'll log the template data to the console. You could also store it in localStorage or send it to a server.
    console.log("Template Saved:", templateData);
    alert("Custom template saved successfully.");
}
