const STORAGE_KEY = "todo-list:v1";

/**
 * @typedef {{ id: string, text: string, completed: boolean, createdAt: number }} Todo
 */

/** @returns {Todo[]} */
function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((t) => t && typeof t === "object")
      .map((t) => ({
        id: String(t.id ?? crypto.randomUUID()),
        text: String(t.text ?? "").trim(),
        completed: Boolean(t.completed),
        createdAt: Number(t.createdAt ?? Date.now()),
      }))
      .filter((t) => t.text.length > 0);
  } catch {
    return [];
  }
}

/** @param {Todo[]} todos */
function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

/** @param {Todo} todo */
function renderTodoItem(todo) {
  const li = document.createElement("li");
  li.className = `todo-item${todo.completed ? " completed" : ""}`;
  li.dataset.id = todo.id;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;
  checkbox.setAttribute("aria-label", "Marcar como completada");
  checkbox.dataset.action = "toggle";

  const text = document.createElement("span");
  text.className = "todo-text";
  text.textContent = todo.text;

  const del = document.createElement("button");
  del.type = "button";
  del.className = "btn btn-danger";
  del.textContent = "Eliminar";
  del.dataset.action = "delete";
  del.setAttribute("aria-label", `Eliminar tarea: ${todo.text}`);

  li.append(checkbox, text, del);
  return li;
}

function pluralize(n) {
  return n === 1 ? "tarea" : "tareas";
}

function init() {
  const form = document.getElementById("todoForm");
  const input = document.getElementById("todoInput");
  const list = document.getElementById("todoList");
  const meta = document.getElementById("metaText");
  const empty = document.getElementById("emptyState");
  const clearCompletedBtn = document.getElementById("clearCompletedBtn");

  /** @type {Todo[]} */
  let todos = loadTodos();

  function syncUI() {
    list.innerHTML = "";
    for (const todo of todos) list.appendChild(renderTodoItem(todo));

    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    meta.textContent = `${total} ${pluralize(total)} • ${completed} completadas`;

    empty.style.display = total === 0 ? "block" : "none";
    clearCompletedBtn.disabled = completed === 0;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    /** @type {Todo} */
    const todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: Date.now(),
    };

    todos = [todo, ...todos];
    saveTodos(todos);
    input.value = "";
    input.focus();
    syncUI();
  });

  list.addEventListener("click", (e) => {
    const target = /** @type {HTMLElement} */ (e.target);
    const action = target?.dataset?.action;
    if (!action) return;

    const li = target.closest("[data-id]");
    const id = li?.getAttribute("data-id");
    if (!id) return;

    if (action === "delete") {
      todos = todos.filter((t) => t.id !== id);
      saveTodos(todos);
      syncUI();
      return;
    }
  });

  list.addEventListener("change", (e) => {
    const target = /** @type {HTMLElement} */ (e.target);
    const action = target?.dataset?.action;
    if (action !== "toggle") return;

    const li = target.closest("[data-id]");
    const id = li?.getAttribute("data-id");
    if (!id) return;

    todos = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    saveTodos(todos);
    syncUI();
  });

  clearCompletedBtn.addEventListener("click", () => {
    todos = todos.filter((t) => !t.completed);
    saveTodos(todos);
    syncUI();
  });

  syncUI();
}

document.addEventListener("DOMContentLoaded", init);
