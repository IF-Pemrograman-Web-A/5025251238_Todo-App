const STORAGE_KEY = "todo-app-items";

<<<<<<< HEAD
let allTodos = getTodos();
updateTodoList();
=======
const addForm = document.getElementById("add-form");
const addInput = document.getElementById("add-input");
const list = document.getElementById("todo-list");
const editorForm = document.getElementById("editor-form");
const editorInput = document.getElementById("editor-input");
const editorSave = document.getElementById("editor-save");
const editorHint = document.getElementById("editor-hint");

const CHECK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" aria-hidden="true"><path d="M400-304 240-464l56-56 104 104 264-264 56 56-320 320Z"/></svg>`;
const TRASH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" aria-hidden="true"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>`;

let todos = loadTodos();
let editingId = null;

function loadTodos() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}
>>>>>>> 495ff4d357725c959a4cacce918bea15897a8704

function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function render() {
    list.innerHTML = "";

    todos.forEach((todo) => {
        const li = document.createElement("li");
        li.className = "todo-item";
        li.dataset.id = todo.id;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `todo-${todo.id}`;
        checkbox.checked = todo.done;

        const box = document.createElement("label");
        box.htmlFor = checkbox.id;
        box.className = "costum-checkbox";
        box.innerHTML = CHECK_SVG;

        const text = document.createElement("label");
        text.htmlFor = checkbox.id;
        text.className = "todo-text";
        text.textContent = todo.text;

        const edit = document.createElement("button");
        edit.type = "button";
        edit.className = "edit-button";
        edit.textContent = "Edit";

        const del = document.createElement("button");
        del.type = "button";
        del.className = "delete-button";
        del.setAttribute("aria-label", "Delete todo item");
        del.innerHTML = TRASH_SVG;

        li.append(checkbox, box, text, edit, del);
        list.append(li);
    });
}

function resetEditor() {
    editingId = null;
    editorInput.value = "";
    editorInput.disabled = true;
    editorSave.disabled = true;
    editorHint.textContent = 'Click "Edit" on a todo to change its text here.';
}

addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = addInput.value.trim();
    if (!text) return;
    todos.push({ id: crypto.randomUUID(), text, done: false });
    saveTodos();
    render();
    addInput.value = "";
    addInput.focus();
});

<<<<<<< HEAD
function addTodo() {
    const todoText = todoInput.value.trim();
    if (todoText.length > 0) {
        const todoObject = {
            text: todoText,
            completed: false,
        };
        allTodos.push(todoObject);
        saveTodos();
        updateTodoList();
        todoInput.value = "";
=======
list.addEventListener("change", (e) => {
    if (e.target.type !== "checkbox") return;
    const id = e.target.closest(".todo-item").dataset.id;
    const todo = todos.find((t) => t.id === id);
    todo.done = e.target.checked;
    saveTodos();
});

list.addEventListener("click", (e) => {
    const item = e.target.closest(".todo-item");
    if (!item) return;
    const id = item.dataset.id;

    if (e.target.closest(".delete-button")) {
        todos = todos.filter((t) => t.id !== id);
        saveTodos();
        render();
        if (editingId === id) resetEditor();
    } else if (e.target.closest(".edit-button")) {
        const todo = todos.find((t) => t.id === id);
        editingId = id;
        editorInput.disabled = false;
        editorSave.disabled = false;
        editorInput.value = todo.text;
        editorHint.textContent = "Editing selected todo.";
        editorInput.focus();
>>>>>>> 495ff4d357725c959a4cacce918bea15897a8704
    }
});

<<<<<<< HEAD
function updateTodoList() {
    todoListUL.innerHTML = "";
    allTodos.forEach((todo, todoIndex) => {
        const todoItem = createTodoItem(todo, todoIndex);
        todoListUL.append(todoItem);
    });
}

function createTodoItem(todo, todoIndex) {
    const todoId = `todo-${todoIndex}`;
    const todoLI = document.createElement("li");
    todoLI.className = "todo";

    todoLI.innerHTML = `
        <input type="checkbox" id="${todoId}" ${todo.completed ? "checked" : ""}>
        <label for="${todoId}" class="costum-checkbox">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                <path d="M400-304 240-464l56-56 104 104 264-264 56 56-320 320Z"/>
            </svg>
        </label>
        <label for="${todoId}" class="todo-text">${todo.text}</label>
        <button class="delete-button">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
            </svg>
        </button>
    `;

    // Handle Delete Button
    const deleteButton = todoLI.querySelector(".delete-button");
    deleteButton.addEventListener("click", () => {
        deleteTodoItem(todoIndex);
    });

    // Handle Checkbox Toggle
    const checkbox = todoLI.querySelector("input[type='checkbox']");
    checkbox.addEventListener("change", () => {
        allTodos[todoIndex].completed = checkbox.checked;
        saveTodos();
    });

    return todoLI;
}

function deleteTodoItem(todoIndex) {
    allTodos.splice(todoIndex, 1);
    saveTodos();
    updateTodoList();
}

function saveTodos() {
    const todosJson = JSON.stringify(allTodos);
    localStorage.setItem("todos", todosJson);
}

function getTodos() {
    const todos = localStorage.getItem("todos");
    return todos ? JSON.parse(todos) : [];
}
=======
editorForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = editorInput.value.trim();
    if (!editingId || !text) return;
    todos.find((t) => t.id === editingId).text = text;
    saveTodos();
    render();
    resetEditor();
});

render();
>>>>>>> 495ff4d357725c959a4cacce918bea15897a8704
