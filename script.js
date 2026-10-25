// ===== STEP 1: Get the HTML elements we need =====
const form = document.getElementById("studentForm");
const nameInput = document.getElementById("name");
const courseInput = document.getElementById("course");
const emailInput = document.getElementById("email");
const message = document.getElementById("message");
const tableBody = document.getElementById("studentTable");
const emptyMessage = document.getElementById("emptyMessage");
const countBadge = document.getElementById("count");
const searchInput = document.getElementById("search");

// ===== STEP 2: Load saved students from the browser =====
// localStorage keeps data even after the page is refreshed (free, no server needed).
let students = JSON.parse(localStorage.getItem("students")) || [];

// ===== STEP 3: Save students to the browser =====
function saveStudents() {
    localStorage.setItem("students", JSON.stringify(students));
}

// ===== STEP 4: Show a message under the form =====
function showMessage(text, type) {
    message.textContent = text;
    
    message.className = "message " + type;

    // Hide the message after 3 seconds
    setTimeout(function () {
        message.textContent = "";
    }, 3000);
}

// ===== STEP 5: Draw the table =====
function displayStudents() {
    const searchText = searchInput.value.toLowerCase();

    // Keep only students that match the search box
    const filtered = students.filter(function (student) {
        return (
            student.name.toLowerCase().includes(searchText) ||
            student.course.toLowerCase().includes(searchText) ||
            student.email.toLowerCase().includes(searchText)
        );
    });

    // Clear old rows
    tableBody.innerHTML = "";

    filtered.forEach(function (student, index) {
        const row = document.createElement("tr");

        // We use textContent (not innerHTML) so typed text is shown safely
        const numberCell = document.createElement("td");
        numberCell.textContent = index + 1;

        const nameCell = document.createElement("td");
        nameCell.textContent = student.name;

        const courseCell = document.createElement("td");
        courseCell.textContent = student.course;

        const emailCell = document.createElement("td");
        emailCell.textContent = student.email;

        const actionCell = document.createElement("td");
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-btn";
        deleteBtn.addEventListener("click", function () {
            deleteStudent(student.id);
        });
        actionCell.appendChild(deleteBtn);

        row.append(numberCell, nameCell, courseCell, emailCell, actionCell);
        tableBody.appendChild(row);
    });

    // Update the counter and the "no students" message
    countBadge.textContent = students.length + (students.length === 1 ? " Student" : " Students");

    if (filtered.length === 0) {
        emptyMessage.style.display = "block";
        emptyMessage.textContent = students.length === 0
            ? "No students added yet. Use the form to add one!"
            : "No students match your search.";
    } else {
        emptyMessage.style.display = "none";
    }
}

// ===== STEP 6: Add a student when the form is submitted =====
form.addEventListener("submit", function (event) {
    event.preventDefault(); // stop the page from reloading

    const name = nameInput.value.trim();
    const course = courseInput.value;
    const email = emailInput.value.trim();

    // Simple checks
    if (name === "" || course === "" || email === "") {
        showMessage("Please fill in all fields.", "error");
        return;
    }

    const alreadyExists = students.some(function (student) {
        return student.email.toLowerCase() === email.toLowerCase();
    });
    if (alreadyExists) {
        showMessage("A student with this email already exists.", "error");
        return;
    }

    // Create the student object and add it to the list
    const newStudent = {
        id: Date.now(), // unique number based on current time
        name: name,
        course: course,
        email: email
    };

    students.push(newStudent);
    saveStudents();
    displayStudents();

    form.reset(); // clear the form
    nameInput.focus();
    showMessage("Student added successfully!", "success");
});

// ===== STEP 7: Delete a student =====
function deleteStudent(id) {
    if (!confirm("Are you sure you want to delete this student?")) {
        return;
    }

    students = students.filter(function (student) {
        return student.id !== id;
    });

    saveStudents();
    displayStudents();
}

// ===== STEP 8: Re-draw the table while typing in the search box =====
searchInput.addEventListener("input", displayStudents);

// ===== STEP 9: Show the table when the page first loads =====
displayStudents();

function exportStudents() {
    if (students.length === 0) {
        alert("No student data to export!");
        return;
    }

    const headers = ["Student ID", "Name", "Course", "Email"];

    const rows = students.map((student, index) => [
        student.id || student.studentId || index + 1,
        student.name || "",
        student.course || "",
        student.email || ""
    ]);

    const csv = [headers, ...rows]
        .map(row => row.map(value =>
            '"' + String(value).replace(/"/g, '""') + '"'
        ).join(","))
        .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "students.csv";
    link.click();
    URL.revokeObjectURL(url);
}
