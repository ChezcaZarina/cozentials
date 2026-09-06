//cut me off some slack nabobobo aku s javascript

const gradeList = document.getElementById('grade-list'); //grade-list from gwa.html where inputs will be added
const addSubjectBtn = document.getElementById('add-subject-btn'); //yung add-subject-btn from gwa.html

//add ng new subj row 
function addSubjectRow() {
    const row = document.createElement('div');
    row.className = 'grade-row';
    const isPercentage = scaleInput.value === 'percentage';
    const gradeMin = isPercentage ? 75 : 1;
    const gradeMax = isPercentage ? 100 : 5;
    const gradeStep = isPercentage ? 1 : 0.25;

    row.innerHTML = `
        <input type="text" placeholder="Subject/Course name" class="subject-name">
        <input type="number" placeholder="Grade" step="${gradeStep}" min="${gradeMin}" max="${gradeMax}" class="subject-grade">
        <button class="remove-row-btn">X</button>
    `;
    gradeList.appendChild(row);
    row.querySelector('.remove-row-btn').addEventListener('click', () => {
        row.remove();
});
}
const scaleInput = document.getElementById('scale-input');
// kapag pinindot "+ Add Subject" magrarun
addSubjectBtn.addEventListener('click', addSubjectRow);
addSubjectRow(); 

//mga need na button/inputs para sa mismong calcu
const calculateBtn = document.getElementById('calculate-btn');
const nameInput = document.getElementById('name-input');
const programInput = document.getElementById('program-input');
const semesterInput = document.getElementById('semester-input');
const resultSection = document.getElementById('result-section');
const yearInput = document.getElementById('year-input');

// dropdown appropriate sa kung anong scale chosen
scaleInput.addEventListener('change', () => {
  const isPercentage = scaleInput.value === 'percentage';
  const gradeMin = isPercentage ? 75 : 1;
  const gradeMax = isPercentage ? 100 : 5;
  const gradeStep = isPercentage ? 1 : 0.25;

  document.querySelectorAll('.subject-grade').forEach(input => {
    input.min = gradeMin;
    input.max = gradeMax;
    input.step = gradeStep;
    input.value = ''; 
    
  });
});

function calculateGWA() {
  const name = nameInput.value.trim();
  const program = programInput.value.trim();
  const scale = scaleInput.value;
  const year = yearInput.value.trim();
  const semester = semesterInput.value.trim();
  const rows = document.querySelectorAll('.grade-row');
  let subjects = [];
  let total = 0;

  rows.forEach(row => {
    const subjectName = row.querySelector('.subject-name').value.trim();
    const grade = parseFloat(row.querySelector('.subject-grade').value);

    if (subjectName && !isNaN(grade)) {
      subjects.push({ subjectName, grade });
      total += grade;
    }
  });

  if (subjects.length === 0) {
    resultSection.innerHTML = '<p>Please add at least one subject with a grade.</p>';
    return;
  }

  const gwa = (total / subjects.length).toFixed(2);

    displayResult(name, program, year, semester, subjects, gwa, scale);
    saveToHistory(name, program, year, semester, subjects, gwa, scale);
}

function displayResult(name, program, year, semester, subjects, gwa, scale) {
  let rowsHTML = subjects.map(s => `
    <tr>
      <td>${s.subjectName}</td>
      <td>${s.grade}</td>
    </tr>
  `).join('');

  resultSection.innerHTML = `
<p class="greeting">Hello, ${name || 'there'}!</p>
<p class="result-label">Your GWA</p>
<p class="gwa-number">${gwa}</p>
<p class="gwa-caption">${program || 'Program'} — ${year || 'Year'}, ${semester || 'Semester'} · ${subjects.length} subject${subjects.length !== 1 ? 's' : ''}</p>
    <table class="result-table">
      <thead>
        <tr><th>Subject</th><th>Grade</th></tr>
      </thead>
      <tbody>
        ${rowsHTML}
      </tbody>
    </table>
        <p class="motivation">${getMotivation(gwa, scale)}</p>
  `;
}
//shet ansakit sa ulo 
calculateBtn.addEventListener('click', calculateGWA);

const historySection = document.getElementById('history-section');

function saveToHistory(name, program, year, semester, subjects, gwa, scale) {
  const history = JSON.parse(localStorage.getItem('gwaHistory')) || [];

   history.push({
    name: name || 'Unnamed',
    program: program || '—',
    year: year || '—',
    semester: semester || '—',
    subjects,
    gwa,
    date: new Date().toLocaleDateString()
  });
  localStorage.setItem('gwaHistory', JSON.stringify(history));

  displayHistory();
}

function displayHistory() {
  const history = JSON.parse(localStorage.getItem('gwaHistory')) || [];

  if (history.length === 0) {
    historySection.innerHTML = '<p>No past calculations yet.</p>';
    return;
  }

      let historyHTML = history.map((entry, index) => `
    <div class="history-entry">
      <span>
      <strong>${entry.name}</strong> (${entry.program}, ${entry.year} - ${entry.semester}) — GWA: ${entry.gwa}
      </span>
      <button class="delete-history-btn" data-index="${index}">✕</button>
    </div>
  `).join('');

  historySection.innerHTML = historyHTML;

  // delete button sa history
  document.querySelectorAll('.delete-history-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteHistoryEntry(parseInt(btn.dataset.index));
    });
  });
}

displayHistory();

// delete hstory function
function deleteHistoryEntry(index) {
  const history = JSON.parse(localStorage.getItem('gwaHistory')) || [];
  history.splice(index, 1); 
  localStorage.setItem('gwaHistory', JSON.stringify(history));
  displayHistory(); // refresh 
}

// Returns an encouraging message based on the grade and which scale is being used
function getMotivation(gwa, scale) {
  const value = parseFloat(gwa);

  // Point system
  const pointMessages = [
    { max: 1.5, text: "you worked hard for this, and it shows. let yourself feel proud." },
    { max: 2.0, text: "you're doing better than you're giving yourself credit for. rest a little." },
    { max: 2.5, text: "you're still moving forward, even if it doesn't feel like enough. it is." },
    { max: 3.0, text: "this sem asked a lot of you. it's okay to be tired. you're still here, and that counts." },
    { max: 5.0, text: "this number doesn't get to define you. be gentle with yourself, reach out if you need to, and let the next sem start slow." }
  ];

  // Numerical grade 
  const percentageMessages = [
    { min: 90, text: "you worked hard for this, and it shows. let yourself feel proud." },
    { min: 85, text: "you're doing better than you're giving yourself credit for. rest a little." },
    { min: 80, text: "you're still moving forward, even if it doesn't feel like enough. it is." },
    { min: 75, text: "this sem asked a lot of you. it's okay to be tired. you're still here, and that counts." },
    { min: 0, text: "this number doesn't get to define you. be gentle with yourself, reach out if you need to, and let the next sem start slow." }
  ];

  if (scale === 'percentage') {
    const match = percentageMessages.find(m => value >= m.min);
    return match.text;
  } else {
    const match = pointMessages.find(m => value <= m.max);
    return match.text;
  }
}

//TO-DO LIST whahaha
const taskInput = document.getElementById('task-input');
const noteInput = document.getElementById('note-input');
const dueDateInput = document.getElementById('due-date-input');
const addTaskBtn = document.getElementById('add-task-btn');

const missingSection = document.getElementById('missing-section');
const upcomingSection = document.getElementById('upcoming-section');
const doneSection = document.getElementById('done-section');

function getTasks() {
  return JSON.parse(localStorage.getItem('todoTasks')) || [];
}

// massave 
function saveTasks(tasks) {
  localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

// basta add task function
function addTask() {
  const taskName = taskInput.value.trim();
  const note = noteInput.value.trim();
  const dueDate = dueDateInput.value;

  if (!taskName) return; // don't add an empty task

  const tasks = getTasks();
  tasks.push({
    id: Date.now(), // unique num base sa current timestamp
    taskName,
    note,
    dueDate,
    done: false
  });
  saveTasks(tasks);

  // Clear inputsy for the next task
  taskInput.value = '';
  noteInput.value = '';
  dueDateInput.value = '';

  renderTasks();
}

addTaskBtn.addEventListener('click', addTask);
