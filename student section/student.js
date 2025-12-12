document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.jspdf === 'undefined') {
        console.warn("jsPDF library not loaded. PDF generation simulation may fail.");
    }
    
    setupNavigation();
    loadFoodMenu();
    document.getElementById('leave-form').addEventListener('submit', handleLeaveRequest);

    showSection('home');
    updateProfileDisplay();
});

function setupNavigation() {
    const sidebarItems = document.querySelectorAll('.sidebar li');
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            sidebarItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            const targetSection = this.getAttribute('data-section');
            showSection(targetSection);
        });
    });
}

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.add('hidden');
    });
    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.remove('hidden');
    }
}

// Function to update user details in the dashboard/sidebar/profile
function updateProfileDisplay() {
    // --- MOCK DATA SIMULATION ---
    // In a real app, this data would be fetched from localStorage (currentUser) or server
    const mockUser = {
        name: "John Doe",
        year: "2nd Year",
        hostel: "Boys Hostel",
        room: "101",
        email: "john.doe@gmail.com",
        parentContact: "9988776655"
    };

    // Update Header and Sidebar
    document.getElementById('header-student-name').innerText = `Welcome, ${mockUser.name}`;
    document.getElementById('sidebar-student-name').innerText = mockUser.name;
    document.getElementById('sidebar-student-year').innerText = `${mockUser.year} | ${mockUser.hostel}`;
    
    // Update Profile Section (static details, but set dynamically here for demo)
    document.getElementById('profile-display-name').innerText = mockUser.name;
    document.getElementById('profile-display-hostel').innerText = `${mockUser.hostel} | Room ${mockUser.room}`;
    // NOTE: For brevity, other profile details are left static in the HTML but can be updated here if needed.
}


// --- Payment Process & PDF Generation ---

window.simulatePayment = function() {
    const feeAmount = document.getElementById('fee-amount').innerText;
    const confirmation = confirm(`Confirm payment of ${feeAmount}? (Simulated - No real transaction)`);
    
    if (confirmation) {
        alert("Payment Successful! Processing receipt generation...");
        
        // 1. Update dashboard status (simulated)
        const dueText = document.querySelector('.stat-card.due .due-text');
        dueText.innerText = "Paid";
        document.querySelector('.stat-card.due').style.backgroundColor = "#d0f0c0";
        document.querySelector('.stat-card.due').style.color = "#28a745";
        
        // 2. Add receipt link to History
        generateReceiptLink(feeAmount);
    }
}

function generateReceiptLink(amount) {
    const receiptArea = document.getElementById('receipt-area');
    // Remove "No recent payments" text
    if (receiptArea.querySelector('.text-secondary')) {
         receiptArea.innerHTML = '';
    }
    
    const paymentDate = new Date().toLocaleString();
    const receiptId = Math.random().toString(36).substring(2, 10).toUpperCase();

    const receiptItem = document.createElement('div');
    receiptItem.className = 'receipt-item';
    receiptItem.innerHTML = `
        <span>Paid: ${amount} | Date: ${new Date().toLocaleDateString()}</span>
        <button onclick="downloadPdfReceipt('${receiptId}', '${amount}', '${paymentDate}')">
            <i class='bx bxs-printer'></i> Print Receipt
        </button>
    `;
    
    receiptArea.prepend(receiptItem); // Add new receipt to the top
}

// Function that uses the jspdf library to generate the receipt
window.downloadPdfReceipt = function(id, amount, date) {
    if (typeof window.jspdf === 'undefined') {
        alert("PDF generation error: jsPDF library is missing.");
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Student Data (pulled from current display for accuracy)
    const studentData = {
        name: document.getElementById('profile-display-name').innerText,
        roomHostel: document.getElementById('profile-display-hostel').innerText,
        email: "john.doe@gmail.com" // Mocked
    };
    
    // --- PDF Content ---
    doc.setFontSize(22);
    doc.text("Official Hostel Fee Receipt", 105, 20, null, null, "center");
    
    doc.setDrawColor(0);
    doc.setLineWidth(1);
    doc.line(20, 25, 190, 25);
    
    // Receipt Info
    doc.setFontSize(14);
    doc.text(`Receipt ID: ${id}`, 20, 35);
    doc.text(`Transaction Time: ${date}`, 190, 35, null, null, "right");
    
    // Student Details
    doc.setFontSize(16);
    doc.text("Student Details:", 20, 50);
    doc.setFontSize(12);
    doc.text(`Name: ${studentData.name}`, 20, 60);
    doc.text(`Email: ${studentData.email}`, 20, 67);
    doc.text(`Hostel/Room: ${studentData.roomHostel}`, 20, 74);
    
    // Payment Details Box
    doc.setDrawColor(52, 152, 219); 
    doc.setFillColor(213, 235, 250); // Light blue fill
    doc.rect(20, 90, 170, 30, 'F');
    
    doc.setFontSize(18);
    doc.setTextColor(41, 128, 185); 
    doc.text("Amount Paid:", 30, 100);
    doc.text(`${amount} (Successfully Paid)`, 180, 100, null, null, "right");
    
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text("This is a computer-generated receipt. Contact accounts office for verification.", 105, 140, null, null, "center");
    
    doc.save(`Receipt_${id}.pdf`);
}


// --- Existing Required Logic (Leave, Food) ---

window.checkMedicalProof = function() {
    const reasonInput = document.getElementById('leave-reason').value.toLowerCase();
    const uploadArea = document.getElementById('medical-upload-area');
    
    if (reasonInput.includes('medical') || reasonInput.includes('sick')) {
        uploadArea.classList.remove('hidden');
        uploadArea.querySelector('input').setAttribute('required', 'required'); 
    } else {
        uploadArea.classList.add('hidden');
        uploadArea.querySelector('input').removeAttribute('required');
    }
}

function handleLeaveRequest(e) {
    e.preventDefault();
    const reason = document.getElementById('leave-reason').value;
    document.getElementById('leave-status-text').innerText = `Pending (Request for: ${reason})`;
    document.getElementById('leave-status-text').style.color = "orange";

    alert("Leave Request Submitted! Waiting for Staff/Admin Approval.");
    e.target.reset(); 
    checkMedicalProof(); 
}

function loadFoodMenu() {
    const mockMenu = [
        { day: "Monday", morn: "Poha, Tea", lunch: "Roti, Dal, Veg Curry", dinner: "Chicken/Paneer, Rice" },
        { day: "Tuesday", morn: "Bread Butter, Coffee", lunch: "Biryani, Raita", dinner: "Tadka Dal, Rice, Salad" },
        { day: "Wednesday", morn: "Idli, Sambar", lunch: "Rajma Chawal", dinner: "Noodles, Veg Soup" },
        { day: "Thursday", morn: "Aloo Paratha", lunch: "South Indian Thali", dinner: "Egg Curry/Mutter Paneer" },
        { day: "Friday", morn: "Pancake", lunch: "Khichdi & Pickles", dinner: "Pizza & Salad" },
        { day: "Saturday", morn: "Vada Pav", lunch: "Chole Bhature", dinner: "Dal Makhani, Rice" },
        { day: "Sunday", morn: "Poori Sabzi", lunch: "Special Thali", dinner: "Burger & Fries" }
    ];

    const tbody = document.getElementById('menu-display');
    mockMenu.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.day}</td>
            <td>${item.morn}</td>
            <td>${item.lunch}</td>
            <td>${item.dinner}</td>
        `;
        tbody.appendChild(row);
    });
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Add this new function into your js/student_script.js file:

window.togglePaymentInputs = function() {
    const method = document.getElementById('payment-method-select').value;
    const cardInputs = document.getElementById('card-inputs');
    const upiInputs = document.getElementById('upi-inputs');

    // Hide all input groups first
    cardInputs.classList.add('hidden');
    upiInputs.classList.add('hidden');

    // Show the selected input group
    if (method === 'card') {
        cardInputs.classList.remove('hidden');
    } else if (method === 'upi') {
        upiInputs.classList.remove('hidden');
    }
    // No specific fields shown for Net Banking in this simulation, 
    // as it usually redirects to a bank portal.
}

// Ensure the existing simulatePayment function is also in your file:
window.simulatePayment = function() {
    const feeAmount = document.getElementById('fee-amount').innerText;
    const method = document.getElementById('payment-method-select').value;
    
    if (method === 'none') {
        alert("Please select a valid Payment Method (Card or UPI) before proceeding.");
        return;
    }

    const confirmation = confirm(`Confirm payment of ${feeAmount} via ${method.toUpperCase()}? (Simulated - No real transaction)`);
    
    if (confirmation) {
        alert(`Payment successful via ${method.toUpperCase()}! Processing receipt generation...`);
        
        // 1. Update dashboard status (simulated)
        const dueText = document.querySelector('.stat-card.due .due-text');
        dueText.innerText = "Paid";
        document.querySelector('.stat-card.due').style.backgroundColor = "#d0f0c0";
        document.querySelector('.stat-card.due').style.color = "#28a745";
        
        // 2. Add receipt link to History
        generateReceiptLink(feeAmount, method);
    }
}

// ... rest of your student_script.js file (downloadPdfReceipt, generateReceiptLink, etc.) ...