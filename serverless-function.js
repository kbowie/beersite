const axios = require("axios");

exports.handler = async (event) => {
    // Handle preflight (OPTIONS) requests
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "https://beerfinderapp.com", // Allow only your origin
                "Access-Control-Allow-Methods": "POST, OPTIONS", // Allowed methods
                "Access-Control-Allow-Headers": "Content-Type, Authorization", // Allowed headers
            },
            body: JSON.stringify({}),
        };
    }

    // Handle non-OPTIONS requests
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: {
                "Access-Control-Allow-Origin": "https://beerfinderapp.com", // Allow only your origin
            },
            body: JSON.stringify({ error: "Method Not Allowed" }),
        };
    }

    const { name, email, message } = JSON.parse(event.body);

    if (!name || !email || !message) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "https://beerfinderapp.com", // Allow only your origin
            },
            body: JSON.stringify({ success: false, error: "All fields are required." }),
        };
    }

    try {
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

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "https://beerfinderapp.com", // Allow only your origin
            },
            body: JSON.stringify({ success: true, message: "Email sent successfully." }),
        };
    } catch (error) {
        console.error("Brevo API error:", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "https://beerfinderapp.com", // Allow only your origin
            },
            body: JSON.stringify({ success: false, error: "Failed to send email." }),
        };
    }
};
