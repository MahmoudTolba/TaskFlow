const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const toastEl = document.getElementById('toast');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.remove('hidden');
  toastEl.classList.add('animate-fade-in');
  setTimeout(() => {
    toastEl.classList.remove('animate-fade-in');
    toastEl.classList.add('animate-fade-out');
    setTimeout(() => toastEl.classList.add('hidden'), 300);
  }, 2000);
}
document.getElementById('theme-toggle').addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
});

function getFilteredAndSortedTasks() {
  let filtered = [...tasks];

  const filter = document.getElementById('filter-select').value;
  if (filter === 'completed') {
    filtered = filtered.filter(t => t.completed);
  } else if (filter === 'pending') {
    filtered = filtered.filter(t => !t.completed);
  }

  const sort = document.getElementById('sort-select').value;
  if (sort === 'dueDateAsc') {
    filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  } else if (sort === 'dueDateDesc') {
    filtered.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
  }

  return filtered;
}

function renderTasks() {
  taskList.innerHTML = '';
  const filteredTasks = getFilteredAndSortedTasks();

  if (filteredTasks.length === 0) {
    taskList.innerHTML = '<p class="text-center text-gray-500">No tasks found.</p>';
    return;
  }

  filteredTasks.forEach((task, index) => {
    const card = document.createElement('div');
    card.className = "bg-white dark:bg-gray-800 shadow p-4 rounded";
    card.innerHTML = `
      <div class="flex justify-between">
        <h3 class="font-bold text-lg">${task.title}</h3>
        <span class="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">${task.category}</span>
      </div>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">${task.description || ''}</p>
      <div class="mt-2 flex justify-between items-center">
        <small>${task.dueDate ? `Due: ${task.dueDate}` : ''}</small>
        <div class="flex space-x-2">
          <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleComplete(${index})" class="cursor-pointer">
          <button onclick="editTask(${index})" class="text-yellow-500">Edit</button>
          <button onclick="deleteTask(${index})" class="text-red-500">Delete</button>
        </div>
      </div>
    `;
    taskList.appendChild(card);
  });
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
  showToast("Task deleted");
}

function editTask(index) {
  const task = tasks[index];
  document.getElementById('task-id').value = index;
  document.getElementById('title').value = task.title;
  document.getElementById('description').value = task.description;
  document.getElementById('category').value = task.category;
  document.getElementById('dueDate').value = task.dueDate || '';
}

function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

taskForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const id = document.getElementById('task-id').value;
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const category = document.getElementById('category').value;
  const dueDate = document.getElementById('dueDate').value;

  if (!title) return;

  if (id !== '') {
    // update task
    tasks[id] = { ...tasks[id], title, description, category, dueDate };
    document.getElementById('task-id').value = '';
    showToast("Task updated");
  } else {
    // add new task
    tasks.push({ title, description, category, dueDate, completed: false });
    showToast("Task added");
  }

  saveTasks();
  renderTasks();
  taskForm.reset();
});

document.getElementById('theme-toggle').addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
});

document.getElementById('filter-select').addEventListener('change', renderTasks);
document.getElementById('sort-select').addEventListener('change', renderTasks);

document.getElementById('export-btn').addEventListener('click', () => {
  let csvContent = "data:text/csv;charset=utf-8,Title,Description,Category,Due Date,Status\n";
  tasks.forEach(task => {
    csvContent += `"${task.title}","${task.description}","${task.category}","${task.dueDate || ''}","${task.completed ? 'Completed' : 'Pending'}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "tasks.csv");
  link.click();
});

renderTasks();