// --- DEFAULT MOCK DATA (Used if no data found in localStorage) ---
const defaultMockStudents = [
    { id: 'S1001', name: 'Alok Sharma', year: '1st', room: '101A', contact: '9876543210', hostel: 'Boys', parent: 'Ramesh Sharma', address: '123, Sector 15, Dwarka, New Delhi, India' },
    { id: 'S2005', name: 'Priya Singh', year: '2nd', room: '205', contact: '9988776655', hostel: 'Girls', parent: 'Anita Singh', address: '45B, Shivaji Nagar, Pune, India' },
    { id: 'S3010', name: 'Vivek K.', year: '3rd', room: '310', contact: '9000111222', hostel: 'Boys', parent: 'Kumar Das', address: '78/2, Salt Lake, Kolkata, India' },
    { id: 'S1015', name: 'Neha Reddy', year: '1st', room: '115B', contact: '9123456789', hostel: 'Girls', parent: 'Srinivas Reddy', address: '11A, Jubilee Hills, Hyderabad, India' },
];

// --- Mock Data for other sections (Non-persistent for now, but can be added) ---
let mockStudents = []; // This will be loaded from localStorage

const mockRequests = [
    { type: 'Leave', student: 'Alok Sharma', date: '12/01 - 15/01', reason: 'Family event', status: 'Pending', proof: 'No' },
    { type: 'Leave', student: 'Priya Singh', date: '10/01', reason: 'Medical checkup', status: 'Approved', proof: 'Yes' },
    { type: 'Change Room', student: 'Vivek K.', reason: 'Noise complaint (Room 310)', status: 'New' },
    { type: 'Feedback', student: 'Neha Reddy', feedback: 'Warden contact hours are too short.' },
];
const mockMenuData = [
    { day: "Monday", morn: "Poha", lunch: "Roti, Dal", dinner: "Chicken/Paneer" },
    { day: "Tuesday", morn: "Bread", lunch: "Biryani", dinner: "Tadka Dal" },
    { day: "Wednesday", morn: "Idli", lunch: "Rajma", dinner: "Noodles" },
];
const mockStaff = [
    { name: 'Mr. Rohit Kumar', role: 'Head Guard', hostel: 'Boys', contact: '9000123456' },
    { name: 'Ms. Geeta Devi', role: 'Warden Assistant', hostel: 'Girls', contact: '9000654321' },
];

// --- PERSISTENCE FUNCTIONS ---

/**
 * Saves the current student data array to the browser's localStorage.
 */
function saveDataToLocalStorage() {
    localStorage.setItem('hostel_students', JSON.stringify(mockStudents));
    console.log("Student data saved to localStorage.");
}

/**
 * Loads student data from localStorage, or uses default data if nothing is found.
 */
function loadDataFromLocalStorage() {
    const savedData = localStorage.getItem('hostel_students');
    if (savedData) {
        // Parse the JSON string back into a JavaScript array
        mockStudents = JSON.parse(savedData);
    } else {
        // Use the default data and save it for the first time
        mockStudents = [...defaultMockStudents]; // Use spread to copy the array
        saveDataToLocalStorage();
    }
}


// --- INITIALIZATION (UPDATED) ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load persistent data first
    loadDataFromLocalStorage(); 
    
    const role = localStorage.getItem('currentUserRole') || 'SuperAdmin';
    
    updateAdminUI(role);
    setupNavigation();
    
    // 2. Load all section data (using the persistent mockStudents)
    loadDashboardStats();       
    loadStudentData(role);
    loadRoomManagementStats();  
    loadRequestsAndFeedback();
    loadStaffData();
    loadMenuEditor();

    // 3. Attach event listeners for CRUD operations
    // Note: You must ensure 'edit-profile-form' and 'room-modify-form' exist in your HTML
    const editForm = document.getElementById('edit-profile-form');
    if (editForm) editForm.addEventListener('submit', saveStudentChanges);
    
    document.getElementById('new-student-form').addEventListener('submit', addNewStudent);
    
    const roomForm = document.getElementById('room-modify-form');
    if (roomForm) roomForm.addEventListener('submit', modifyRoom);
    
    showSection('home');
});

// --- UI SETUP & NAVIGATION FIX ---

function updateAdminUI(role) {
    document.getElementById('admin-role-display').innerText = `${role.replace('Admin', '')} Dashboard`;
    document.getElementById('admin-role-welcome').innerText = role.replace('Admin', ' Staff');
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

// --- NEW STUDENT MANAGEMENT (UPDATED) ---

window.showAddStudentForm = function() {
    const studentTable = document.querySelector('.student-table');
    const actionBar = document.querySelector('.action-bar');
    if (studentTable) studentTable.classList.add('hidden');
    if (actionBar) actionBar.classList.add('hidden');
    
    document.getElementById('add-student-form-container').classList.remove('hidden');
    document.getElementById('new-student-form').reset();
}

window.hideAddStudentForm = function() {
    const studentTable = document.querySelector('.student-table');
    const actionBar = document.querySelector('.action-bar');
    if (studentTable) studentTable.classList.remove('hidden');
    if (actionBar) actionBar.classList.remove('hidden');
    
    document.getElementById('add-student-form-container').classList.add('hidden');
}

window.addNewStudent = function(e) {
    e.preventDefault();
    
    const newStudent = {
        id: document.getElementById('new-id').value.toUpperCase().trim(),
        name: document.getElementById('new-name').value.trim(),
        year: document.getElementById('new-year').value,
        room: document.getElementById('new-room').value.trim(),
        contact: document.getElementById('new-contact').value.trim(),
        hostel: document.getElementById('new-hostel').value,
        parent: document.getElementById('new-parent').value.trim(),
        address: document.getElementById('new-address').value.trim(),
    };

    if (mockStudents.some(s => s.id === newStudent.id)) {
        alert(`Error: Student ID ${newStudent.id} already exists!`);
        return;
    }
    
    mockStudents.push(newStudent);
    saveDataToLocalStorage(); // *** PERSISTENCE CALL ***
    
    alert(`Successfully added new student: ${newStudent.name} (${newStudent.id})`);

    hideAddStudentForm();
    const role = localStorage.getItem('currentUserRole') || 'SuperAdmin';
    loadStudentData(role); 
    loadDashboardStats();
}

// --- STUDENT PROFILE MANAGEMENT (EDIT & DELETE - UPDATED) ---

window.loadStudentData = function(role) {
    const tbody = document.getElementById('student-data-body');
    if (!tbody) return; // Safety check
    tbody.innerHTML = '';
    
    const yearFilterElement = document.getElementById('year-filter');
    const yearFilter = yearFilterElement ? yearFilterElement.value : 'all';

    const filteredStudents = mockStudents.filter(student => {
        if (role === 'BoysAdmin' && student.hostel === 'Girls') return false;
        if (role === 'GirlsAdmin' && student.hostel === 'Boys') return false;
        if (yearFilter !== 'all' && student.year !== yearFilter) return false;
        return true;
    });

    filteredStudents.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name} (${student.hostel})</td>
            <td>${student.year}</td>
            <td>${student.room}</td>
            <td>${student.contact}</td>
            <td>
                <button class="action-btn view" onclick="openEditModal('${student.id}')">Edit Profile</button>
                <button class="action-btn reject" onclick="deleteStudent('${student.id}', '${student.name}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.openEditModal = function(studentId) {
    const student = mockStudents.find(s => s.id === studentId);
    if (!student) return;

    document.getElementById('modal-student-name').innerText = `Edit Profile: ${student.name}`;
    document.getElementById('modal-student-id-display').innerText = student.id;
    document.getElementById('edit-id').value = student.id;
    
    document.getElementById('edit-hostel').value = student.hostel;
    document.getElementById('edit-room').value = student.room;
    document.getElementById('edit-year').value = student.year;
    document.getElementById('edit-contact').value = student.contact;
    document.getElementById('edit-parent').value = student.parent;
    document.getElementById('edit-address').value = student.address;
    
    document.getElementById('edit-profile-modal').classList.remove('hidden');
}

window.closeModal = function() {
    document.getElementById('edit-profile-modal').classList.add('hidden');
}

window.saveStudentChanges = function(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('edit-id').value;
    const student = mockStudents.find(s => s.id === studentId);
    if (!student) return;

    student.hostel = document.getElementById('edit-hostel').value;
    student.room = document.getElementById('edit-room').value;
    student.year = document.getElementById('edit-year').value;
    student.contact = document.getElementById('edit-contact').value;
    student.parent = document.getElementById('edit-parent').value;
    student.address = document.getElementById('edit-address').value;

    saveDataToLocalStorage(); // *** PERSISTENCE CALL ***

    alert(`Changes saved successfully for ${student.name} (ID: ${student.id})!`);
    closeModal();
    loadStudentData(localStorage.getItem('currentUserRole') || 'SuperAdmin');
}

window.deleteStudent = function(studentId, studentName) {
    if (confirm(`Are you sure you want to permanently delete the record for ${studentName} (${studentId})? This action cannot be undone.`)) {
        
        const indexToDelete = mockStudents.findIndex(s => s.id === studentId);

        if (indexToDelete > -1) {
            mockStudents.splice(indexToDelete, 1);
            saveDataToLocalStorage(); // *** PERSISTENCE CALL ***
            
            alert(`Student ${studentName} (ID: ${studentId}) successfully deleted.`);
            
            const role = localStorage.getItem('currentUserRole') || 'SuperAdmin';
            loadStudentData(role); 
            loadDashboardStats(); 
        } else {
            alert("Error: Student record not found.");
        }
    }
}

// --- ROOM MODIFICATION (UPDATED) ---

window.modifyRoom = function(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('modify-student-id').value.toUpperCase().trim();
    const newRoom = document.getElementById('modify-new-room').value.trim();
    const student = mockStudents.find(s => s.id === studentId);

    if (!student) {
        alert(`Error: Student ID ${studentId} not found.`);
        return;
    }

    const oldRoom = student.room;
    
    if (oldRoom === newRoom) {
        alert(`Room is already set to ${newRoom} for ${student.name}. No change made.`);
        document.getElementById('room-modify-form').reset();
        return;
    }

    student.room = newRoom;
    saveDataToLocalStorage(); // *** PERSISTENCE CALL ***
    
    alert(`Success! ${student.name} (${studentId}) has been moved from Room ${oldRoom} to Room ${newRoom}.`);
    
    document.getElementById('room-modify-form').reset();
    const role = localStorage.getItem('currentUserRole') || 'SuperAdmin';
    loadStudentData(role); 
}


// --- OTHER DATA LOADING FUNCTIONS (UPDATED FOR CONSISTENCY) ---

window.loadDashboardStats = function() {
    const totalStudents = mockStudents.length;
    const totalRooms = 300;
    
    // Filled rooms is equal to the number of students currently registered
    const filledRooms = mockStudents.length; 
    const vacantRooms = totalRooms - filledRooms;

    const totalStudentsElement = document.getElementById('dashboard-total-students');
    const totalRoomsElement = document.getElementById('dashboard-total-rooms');
    const filledRoomsElement = document.getElementById('dashboard-filled-rooms');
    const vacantRoomsElement = document.getElementById('dashboard-vacant-rooms');

    if (totalStudentsElement) totalStudentsElement.innerText = totalStudents;
    if (totalRoomsElement) totalRoomsElement.innerText = totalRooms;
    if (filledRoomsElement) filledRoomsElement.innerText = filledRooms;
    if (vacantRoomsElement) vacantRoomsElement.innerText = vacantRooms;
}

window.loadRoomManagementStats = function() {
    const total = 300;
    const filled = mockStudents.length; // Use persistent student count
    const vacant = total - filled; 
    const pending = 20; // Placeholder, modify if needed

    const totalRoomsElement = document.getElementById('total-rooms');
    const filledRoomsElement = document.getElementById('filled-rooms');
    const vacantRoomsElement = document.getElementById('vacant-rooms');
    const pendingRoomsElement = document.getElementById('pending-rooms');
    
    if (totalRoomsElement) totalRoomsElement.innerText = total;
    if (filledRoomsElement) filledRoomsElement.innerText = filled;
    if (vacantRoomsElement) vacantRoomsElement.innerText = vacant;
    if (pendingRoomsElement) pendingRoomsElement.innerText = pending;
}


window.loadRequestsAndFeedback = function() {
    // ... (unchanged request loading)
    const leaveBody = document.getElementById('leave-request-body');
    const specialList = document.getElementById('special-requests-list');
    const feedbackList = document.getElementById('general-feedback-list');
    
    leaveBody.innerHTML = '';
    specialList.innerHTML = '';
    feedbackList.innerHTML = '';

    mockRequests.forEach((req, index) => {
        if (req.type === 'Leave') {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${req.student}</td>
                <td>${req.date}</td>
                <td>${req.reason} (Proof: ${req.proof})</td>
                <td><span style="color: ${req.status === 'Pending' ? 'orange' : 'green'};">${req.status}</span></td>
                <td>
                    <button class="action-btn accept" onclick="handleRequest(${index}, 'accept')">Accept</button>
                    <button class="action-btn reject" onclick="handleRequest(${index}, 'reject')">Reject</button>
                </td>
            `;
            leaveBody.appendChild(row);

        } else if (req.type === 'Change Room' || req.type === 'Leave Hostel') {
            const item = document.createElement('p');
            item.innerHTML = `<strong>${req.type} from ${req.student}:</strong> ${req.reason} 
                              <button class="action-btn view">Review</button>`;
            specialList.appendChild(item);

        } else if (req.type === 'Feedback') {
            const item = document.createElement('p');
            item.innerHTML = `<strong>Feedback from ${req.student}:</strong> ${req.feedback}`;
            feedbackList.appendChild(item);
        }
    });
}

window.handleRequest = function(index, action) {
    alert(`Request from ${mockRequests[index].student} has been ${action}ed.`);
    mockRequests[index].status = action === 'accept' ? 'Approved' : 'Rejected';
    loadRequestsAndFeedback();
}

window.loadMenuEditor = function() {
    // ... (unchanged menu loading)
    const tbody = document.getElementById('menu-editor-body');
    tbody.innerHTML = '';

    mockMenuData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.day}</td>
            <td><input type="text" value="${item.morn}" data-day="${item.day}" data-meal="morn"></td>
            <td><input type="text" value="${item.lunch}" data-day="${item.day}" data-meal="lunch"></td>
            <td><input type="text" value="${item.dinner}" data-day="${item.day}" data-meal="dinner"></td>
        `;
        tbody.appendChild(row);
    });
}

window.saveFoodMenu = function() {
    // For persistence, you would need to save mockMenuData here too.
    const inputs = document.querySelectorAll('#menu-editor-body input');
    const newMenu = [];

    inputs.forEach(input => {
        const day = input.getAttribute('data-day');
        const meal = input.getAttribute('data-meal');
        const value = input.value;
        
        let item = newMenu.find(i => i.day === day);
        if (!item) {
            item = { day: day };
            newMenu.push(item);
        }
        item[meal] = value;
    });

    mockMenuData.splice(0, mockMenuData.length, ...newMenu);
    alert("Weekly Food Menu Saved Successfully! Students can now view the updated menu.");
}

window.saveRules = function() {
    // For persistence, you would need to save these rule values here too.
    const general = document.getElementById('general-rules-text').value;
    const facility = document.getElementById('facility-info-text').value;
    
    console.log("New General Rules:", general);
    console.log("New Facility Info:", facility);

    alert("Hostel Rules and Facility Information Updated Successfully!");
}

window.loadStaffData = function() {
    // ... (unchanged staff data loading)
    const tbody = document.getElementById('staff-data-body');
    tbody.innerHTML = '';

    mockStaff.forEach(staff => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${staff.name}</td>
            <td>${staff.role}</td>
            <td>${staff.hostel}</td>
            <td>${staff.contact}</td>
            <td>
                <button class="action-btn view">Edit</button>
                <button class="action-btn reject">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.addStaffForm = function() {
    alert("Show form to add new staff member.");
}

function logout() {
    localStorage.removeItem('currentUserRole');
    window.location.href = 'index.html';
}