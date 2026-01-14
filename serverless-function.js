const axios = require("axios");

exports.handler = async (event) => {
    console.log("Function invoked with:", JSON.stringify(event, null, 2));
    
    // Handle preflight (OPTIONS) requests
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "https://beerfinderapp.com",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            body: JSON.stringify({}),
        };
    }

    // Handle non-OPTIONS requests
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: {
                "Access-Control-Allow-Origin": "https://beerfinderapp.com",
            },
            body: JSON.stringify({ error: "Method Not Allowed" }),
        };
    }

    let parsedBody;
    try {
        parsedBody = JSON.parse(event.body);
        console.log("Parsed body:", parsedBody);
    } catch (error) {
        console.error("JSON parse error:", error);
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "https://beerfinderapp.com",
            },
            body: JSON.stringify({ success: false, error: "Invalid JSON in request body." }),
        };
    }

    const { name, email, message } = parsedBody;

    if (!name || !email || !message) {
        console.log("Validation failed - missing fields:", { name, email, message: !!message });
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "https://beerfinderapp.com",
            },
            body: JSON.stringify({ success: false, error: "All fields are required." }),
        };
    }

    // Check if API key is set
    if (!process.env.BREVO_API_KEY) {
        console.error("BREVO_API_KEY environment variable is not set");
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "https://beerfinderapp.com",
            },
            body: JSON.stringify({ success: false, error: "Server configuration error - API key not set." }),
        };
    }

    try {
        console.log("Making request to Brevo API...");
        const brevoResponse = await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
                sender: { email: "info@beerfinderapp.com", name: "Beer Finder" },
                to: [{ email: "info@beerfinderapp.com", name: "Beer Finder" }],
                subject: "New Contact Form Submission from Beer Finder",
                htmlContent: `<p><strong>Name:</strong> ${name}</p>
                              <p><strong>Email:</strong> ${email}</p>
                              <p><strong>Message:</strong> ${message}</p>
                              <p><strong>Sent from:</strong> Beer Finder Contact Form</p>`
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "api-key": process.env.BREVO_API_KEY,
                }
            }
        );

        console.log("Brevo API response:", brevoResponse.status);
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "https://beerfinderapp.com",
            },
            body: JSON.stringify({ success: true, message: "Email sent successfully." }),
        };
    } catch (error) {
        console.error("Brevo API error:", error.response ? error.response.data : error.message);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "https://beerfinderapp.com",
            },
            body: JSON.stringify({ 
                success: false, 
                error: "Failed to send email.",
                details: error.response ? error.response.data : error.message 
            }),
        };
    }
};
