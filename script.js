// 🎠 Select the gallery track that will be animated
const galleryTrack = document.querySelector(".gallery-track");

// 🛑 Pause the gallery animation when the user hovers over the container
document.querySelector(".gallery-container").addEventListener("mouseover", () => {
    galleryTrack.style.animationPlayState = "paused";
});

// ▶ Resume the gallery animation when the user moves the mouse away
document.querySelector(".gallery-container").addEventListener("mouseleave", () => {
    galleryTrack.style.animationPlayState = "running";
});

// ✨ Function to fetch AI hairstyle recommendations from OpenAI
async function getHairstyleRecommendation() {
    // 🎭 Get the selected face shape from the dropdown
    const faceShape = document.getElementById("faceShape").value;

    // 📌 Get references to the AI response text and modal
    const aiResponseElement = document.getElementById("aiResponse");
    const aiModal = document.getElementById("aiModal");

    // 🔑 OpenAI API Key (Replace with your actual key)
    const OPENAI_API_KEY = "YOUR_API_KEY"; 

    // 📝 Create a prompt for AI to generate a hairstyle recommendation
    const prompt = `Suggest the best hairstyles for a person with a ${faceShape} face shape in under 200 words.`;

    try {
        // 🌐 Send a POST request to OpenAI API
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo", // 🧠 AI model to generate the response
                messages: [
                    { role: "system", content: "You are a professional hairstylist providing concise but detailed recommendations." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 300 // ⏳ Limit response length (~200 words)
            })
        });

        // ❌ If API response is not successful, throw an error
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} - ${await response.text()}`);
        }

        // 📥 Parse the JSON response from OpenAI
        const data = await response.json();
        let aiText = data.choices[0]?.message?.content.trim() || "No recommendation available.";

        // ✂ Limit AI response to 200 words to keep it concise
        aiText = limitWords(aiText, 200);

        // 💬 Display AI recommendation inside the pop-up modal
        aiResponseElement.innerText = aiText;
        aiModal.style.display = "flex"; // 📌 Show the modal with the AI response

    } catch (error) {
        // 🚨 Handle errors and display a fallback message in case of API failure
        console.error("❌ Error Fetching AI Recommendation:", error);
        aiResponseElement.innerText = "Unable to fetch recommendations. Please try again later.";
        aiModal.style.display = "flex"; // 📌 Show modal even if there's an error
    }
}

// ✅ Function to Limit AI Response to 200 Words
function limitWords(text, wordLimit) {
    const words = text.split(/\s+/);
    if (words.length > wordLimit) {
        return words.slice(0, wordLimit).join(" ") + "..."; 
    }
    return text;
}

// ❌ Close the modal when clicking the close button
function closeModal() {
    document.getElementById("aiModal").style.display = "none";
}

// 🎀 Show the Booking Popup & Set Date Restrictions
function showBooking() {
    let popup = document.getElementById('booking-popup');
    popup.style.visibility = "visible";
    popup.style.opacity = "1";

    // Reset form fields when opening the popup
    document.getElementById("userName").value = "";
    document.getElementById("userEmail").value = "";
    document.getElementById("phoneNumber").value = "";
    document.getElementById("datePicker").value = "";
    document.getElementById("service").selectedIndex = 0;
    document.getElementById("comments").value = "";

    // Hide all previous error messages
    document.querySelectorAll(".error-message").forEach(e => e.style.display = "none");

    // Set min & max date for booking
    let today = new Date();
    let maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 1);

    let minDateStr = today.toISOString().split('T')[0];
    let maxDateStr = maxDate.toISOString().split('T')[0];

    let dateInput = document.getElementById('datePicker');
    dateInput.setAttribute("min", minDateStr);
    dateInput.setAttribute("max", maxDateStr);
}

// 📤 Confirm Booking (Validates & Sends Data to Google Sheets)
function confirmBooking() {
    let userName = document.getElementById('userName').value.trim();
    let userEmail = document.getElementById('userEmail').value.trim();
    let phoneNumber = document.getElementById('phoneNumber').value.trim();
    let date = document.getElementById('datePicker').value;
    let service = document.getElementById('service').value;
    let comments = document.getElementById('comments').value.trim();
    
    let isValid = true;

    // Reset error messages
    document.querySelectorAll(".error-message").forEach(e => e.style.display = "none");

    // Name Validation
    if (!userName) {
        showError('nameError', "Name is required!");
        isValid = false;
    }

    // ✅ Strict Email Validation (Only Gmail, Yahoo, Hotmail, Outlook, iCloud)
    let allowedDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"];
    let emailPattern = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/;
    
    if (!userEmail) {
        showError('emailError', "Email is required!");
        isValid = false;
    } else if (!emailPattern.test(userEmail)) {
        showError('emailError', "Enter a valid email format!");
        isValid = false;
    } else {
        let emailDomain = userEmail.split("@")[1].toLowerCase();
        if (!allowedDomains.includes(emailDomain)) {
            showError('emailError', "Only Gmail, Yahoo, Hotmail, Outlook, and iCloud are allowed!");
            isValid = false;
        }
    }

    // ✅ Phone Number Validation (Specific to Nepal)
    let nepalPhonePattern = /^(98[4-9]|97[4-9]|96[4-9])\d{7}$/;
    if (!phoneNumber) {
        showError('phoneError', "Phone number is required!");
        isValid = false;
    } else if (!nepalPhonePattern.test(phoneNumber)) {
        showError('phoneError', "Enter a valid Nepalese mobile number!");
        isValid = false;
    }

    // Date Selection Validation
    let today = new Date();
    let maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 1);
    let selectedDate = new Date(date);

    if (!date) {
        showError('dateError', "Select a valid date!");
        isValid = false;
    } else if (selectedDate < today || selectedDate > maxDate) {
        showError('dateError', "Date must be within one month from today!");
        isValid = false;
    }

    // Service Selection Validation
    if (!service) {
        showError('serviceError', "Please select a service!");
        isValid = false;
    }

    // ❌ Stop submission if errors exist
    if (!isValid) return;

    fetch("YOUR_GOOGLE_SCRIPT_WEB_APP_URL", {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ 
            name: userName, 
            email: userEmail, 
            phone: phoneNumber, 
            date: date, 
            service: service, 
            comments: comments 
        }),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.text())
    .then(data => {
        console.log("Response from Google Sheets:", data);
        if (data.includes("Error")) {
            alert("There was an issue with your appointment submission. Please try again.");
        } else {
            alert(`Thank you, ${userName}! Your appointment on ${date} for ${service} is confirmed. 💖`);
            document.getElementById('booking-popup').style.visibility = "hidden";
            document.getElementById('booking-popup').style.opacity = "0";
        }
    })
    .catch(error => {
        console.error("Fetch Error:", error);
        alert("There was an issue submitting your appointment. Please check your internet connection and try again.");
    });
    

// 🛠️ Show Error Message Only on "Confirm Appointment"
function showError(fieldId, message) {
    let errorField = document.getElementById(fieldId);
    errorField.textContent = message;
    errorField.style.display = "block";
}

// 🛠️ Remove Error Message If Field is Cleared
document.querySelectorAll("#userName, #userEmail, #phoneNumber, #datePicker, #service").forEach(input => {
    input.addEventListener("input", function() {
        let errorField = document.getElementById(this.id + "Error");
        
        // ❌ If field is empty, hide the error
        if (this.value.trim() === "") {
            errorField.style.display = "none";
        }
    });
});


// 🖼️ Lightbox Effect for Viewing Images
function openLightbox(img) {
    alert(`Viewing: ${img.alt}`);
}

// 💡 Smooth Scrolling for Sections
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
};
