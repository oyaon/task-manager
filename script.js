const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const clearBtn = document.getElementById("clear-btn");

const STORAGE_KEY = "task_manager_tasks";

let tasks = [];
let currentFilter = "all";

/* =========================
   Event Listeners
========================= */
taskForm.addEventListener("submit", addTask);
taskList.addEventListener("click", handleTaskClick);
clearBtn.addEventListener("click", clearAllTasks);

document.querySelectorAll(".filters button").forEach(button => {
  button.addEventListener("click", () => {
    setFilter(button.dataset.filter);
  });
});

/* =========================
   Local Storage
========================= */
function loadTasks() {
  const savedTasks = localStorage.getItem(STORAGE_KEY);
  tasks = savedTasks ? JSON.parse(savedTasks) : [];
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/* =========================
   Core Functions
========================= */

function addTask(e) {
  e.preventDefault();

  const taskTitle = taskInput.value.trim();
  if (taskTitle === "") return;

  const newTask = {
    id: Date.now(),
    title: taskTitle,
    completed: false,
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();
  taskInput.value = "";
}

/* ---------- Create Task ---------- */
function createTask(task) {
  const li = document.createElement("li");
  li.className = "task-item";
  li.dataset.id = task.id;

  if (task.completed) {
    li.classList.add("completed");
  }

  li.innerHTML = `
    <div class="task-left">
      <input type="checkbox" ${task.completed ? "checked" : ""} />
      <span class="task-text">${task.title}</span>
    </div>

    <div class="task-actions">
      <button class="edit-btn" ${task.completed ? "disabled" : ""}>Edit</button>
      <button class="delete-btn">Delete</button>
    </div>
  `;

  return li;
}

/* ---------- Render Tasks ---------- */
function renderTasks() {
  taskList.innerHTML = "";

  let filteredTasks = tasks;

  if (currentFilter === "active") {
    filteredTasks = tasks.filter(task => !task.completed);
  }

  if (currentFilter === "completed") {
    filteredTasks = tasks.filter(task => task.completed);
  }

  if (filteredTasks.length === 0) {
    showEmptyState();
  } else {
    filteredTasks.forEach(task => {
      taskList.appendChild(createTask(task));
    });
  }

  updateTaskCount();
}

/* ---------- Empty State ---------- */
function showEmptyState() {
  const li = document.createElement("li");
  li.className = "empty-state";
  li.textContent = "No tasks to show. Add your first task 👆";
  taskList.appendChild(li);
}

/* ---------- Task Counter ---------- */
function updateTaskCount() {
  const remaining = tasks.filter(task => !task.completed).length;
  taskCount.textContent = `${remaining} tasks remaining`;
}

/* ---------- Event Delegation ---------- */
function handleTaskClick(e) {
  const taskItem = e.target.closest(".task-item");
  if (!taskItem) return;

  const taskId = Number(taskItem.dataset.id);

  if (e.target.classList.contains("delete-btn")) {
    deleteTask(taskId);
  }

  if (e.target.classList.contains("edit-btn") && !e.target.disabled) {
    enableEditMode(taskItem, taskId);
  }

  if (e.target.type === "checkbox") {
    toggleTaskComplete(taskId);
  }
}

/* ---------- Delete ---------- */
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

/* ---------- Toggle Complete ---------- */
function toggleTaskComplete(id) {
  const task = tasks.find(task => task.id === id);
  if (!task) return;

  task.completed = !task.completed;
  saveTasks();
  renderTasks();
}

/* ---------- Edit ---------- */
function enableEditMode(taskItem, taskId) {
  if (taskItem.querySelector(".edit-input")) return;

  const task = tasks.find(task => task.id === taskId);
  if (!task) return;

  const taskText = taskItem.querySelector(".task-text");

  const input = document.createElement("input");
  input.type = "text";
  input.value = task.title;
  input.className = "edit-input";

  taskText.replaceWith(input);
  input.focus();

  const editButton = taskItem.querySelector(".edit-btn");
  editButton.textContent = "Save";

  editButton.onclick = () => {
    saveEditedTask(taskId, input.value);
  };
}

function saveEditedTask(id, newTitle) {
  const trimmedTitle = newTitle.trim();
  if (trimmedTitle === "") return;

  const task = tasks.find(task => task.id === id);
  if (!task) return;

  task.title = trimmedTitle;
  saveTasks();
  renderTasks();
}

/* ---------- Clear All ---------- */
function clearAllTasks() {
  if (!tasks.length) return;

  const confirmed = confirm("Are you sure you want to delete all tasks?");
  if (!confirmed) return;

  tasks = [];
  saveTasks();
  renderTasks();
}

/* ---------- Filters ---------- */
function setFilter(filter) {
  currentFilter = filter;
  updateActiveFilter();
  renderTasks();
}

function updateActiveFilter() {
  document.querySelectorAll(".filters button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === currentFilter);
  });
}

/* =========================
   Init App
========================= */
loadTasks();
updateActiveFilter();
renderTasks();
