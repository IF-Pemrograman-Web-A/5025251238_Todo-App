const todoForm = document.querySelector("form");
const todoInput = document.querySelector(".todo-input");
const todoListUL = document.querySelector("#todo-list");

let allTodos = [];

function updateTodoList() {
    todoListUL.innerHTML = "";

    for (let todoIndex = 0; todoIndex < allTodos.length; todoIndex++) {
        const todo = allTodos[todoIndex];
        const todoItem = createTodoItem(todo, todoIndex);
        todoListUL.append(todoItem);
    }
}

todoForm.addEventListener("submit", function(e) {
    e.preventDefault();
    addTodo();
});

function addTodo() {
    const todoText = todoInput.value.trim();

    if (todoText.length > 0) {
        const todoObject = {
            text: todoText,
            completed: false,
        };

        allTodos.push(todoObject);

        updateTodoList();

        todoInput.value = "";
    }
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

    const deleteButton = todoLI.querySelector(".delete-button");
    deleteButton.addEventListener("click", function() {
        deleteTodoItem(todoIndex);
    });

    const checkbox = todoLI.querySelector("input[type='checkbox']");
    checkbox.addEventListener("change", function() {
        allTodos[todoIndex].completed = checkbox.checked;
    });

    return todoLI;
}

function deleteTodoItem(todoIndex) {
    allTodos.splice(todoIndex, 1);
    updateTodoList();
}
