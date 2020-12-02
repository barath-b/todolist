let create = document.getElementById("create");
let activeList = create.nextElementSibling;
let compList = activeList.nextElementSibling;
let delList = compList.nextElementSibling;

let addBtn = create.firstElementChild.lastElementChild.firstElementChild;
let taskInput = addBtn.parentElement.previousElementSibling.firstElementChild;

let tasks = [],
    activeTasks = [],
    compTasks = [],
    deletedTasks = [],
    lsTasks;
addBtn.addEventListener("click", function () {
    if (taskInput.value) {
        let id;
        if (tasks.length == undefined) {
            id = 1;
        } else {
            id = randomId();
        }
        addTask(taskInput.value, id);
        taskInput.value = "";
    }
});

function randomId() {
    return Math.random().toString(36).substring(2, 15);
}

function addTask(task, id) {
    displayActiveTasks(task, id);
    tasks.push(new Task(id, task));
    updateLs();

}

function updateLs() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function setFromLs() {
    let lsTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    lsTasks.forEach(task => {
        let id = randomId();
        tasks.push(new Task(id, task.task, task.completed, task.deleted));
        let curTask;
        tasks.forEach(t => {
            if (t.id == id) {
                curTask = t;
            }
        });
        let parent = displayActiveTasks(curTask.task, id);
        if (curTask.completed) {
            curTask.completed = false;
            taskCompleted(parent.firstElementChild.firstElementChild, true);
        }
        if (curTask.deleted) {
            curTask.deleted = false;
            taskDelete(parent.lastElementChild.firstElementChild);
        }
    });
}

// function sortTasks() {
//     activeTasks = [], compTasks = [], deletedTasks = [];
//     tasks.forEach(task => {
//         if (task.deleted) {
//             deletedTasks.push(task);
//         } else if (task.completed && !task.deleted) {
//             compTasks.push(task);
//         } else if (!task.completed && !task.deleted) {
//             activeTasks.push(task);
//         }
//     });
// }

function displayActiveTasks(task, id) {
    let el = createDiv("task")
    setAts(el, [
        ["id", id]
    ]);
    let div = createDiv("content");
    el.appendChild(div);
    let input = createInput("checkbox", "checkbox");
    input.addEventListener("change", function () {
        taskCompleted(this);
    })
    let p = document.createElement("p");
    p.innerHTML = task;
    p.addEventListener("click", function () {
        editTask(this);
    });
    el.firstElementChild.appendChild(input);
    el.firstElementChild.appendChild(p);
    let div1 = createDiv("delete");
    el.appendChild(div1);
    el.lastElementChild.classList.add("delete");
    let button = createInput("button", "Delete");
    button.addEventListener("click", function () {
        taskDelete(this);
    })
    el.lastElementChild.appendChild(button);
    activeList.appendChild(el);
    updateLs();
    hideNoTask();
    return el;
}

function taskCompleted(check, checked = false) {
    let parent = check.parentElement.parentElement;
    let index = findTask(parent);
    if (check.checked == true || checked) {
        tasks[index].completed = true;
        setAts(check, [
            ["checked", "true"]
        ]);
        // parent.firstElementChild.removeChild(parent.firstElementChild.firstElementChild);
        compList.appendChild(parent);
    } else {
        setAts(check, [
            ["checked", "false"]
        ]);
        tasks[index].completed = false;
        activeList.appendChild(parent);
    }
    hideNoTask();
    updateLs();
}

function taskDelete(button) {
    let parent = button.parentElement.parentElement;
    let index = findTask(parent);
    parent.firstElementChild.firstElementChild.disabled = true;
    let div = createDiv("restore");
    let restore = createInput("button", "Restore");
    restore.addEventListener("click", function () {
        restoreTask(this);
    });
    div.appendChild(restore);
    parent.insertBefore(div, parent.lastElementChild);
    if (!tasks[index].deleted) {
        tasks[index].deleted = true;
        delList.appendChild(parent);
    } else {
        delList.removeChild(parent);
        tasks.splice(index, 1);
    }
    hideNoTask();
    updateLs();
}

function restoreTask(button) {
    let parent = button.parentElement.parentElement;
    parent.removeChild(parent.firstElementChild.nextElementSibling);
    parent.firstElementChild.firstElementChild.disabled = false;
    let index = findTask(parent)
    tasks[index].deleted = false;
    if (tasks[index].completed) {
        compList.appendChild(parent);
    } else {
        activeList.appendChild(parent);
    }
    hideNoTask();
    updateLs();
}

function editTask(p) {
    let parent = p.parentElement;
    if (parent.parentElement.parentElement == activeList) {
        let task = p.innerHTML;
        p.classList.add("hidden");
        parent.firstElementChild.classList.add("hidden");
        let input = createInput("text", task);
        parent.appendChild(input);
        let save = createInput("button", "Save");
        parent.appendChild(save);
        parent.nextElementSibling.classList.add("hidden");
        save.addEventListener("click", function () {
            saveTask(parent);
            // let task = p.innerHTML;
            // setAts(parent.firstElementChild, [
            //     ["type", "text"],
            //     ["value", task]
            // ]);
            // p.classList.add("hidden");
            // let save = createInput("button", "Save");
            // parent.appendChild(save);
            // parent.nextElementSibling.classList.add("hidden");
            // save.addEventListener("click", function () {
            //     saveTask(parent);
        });
    }
}

function saveTask(parent) {
    let task = parent.lastElementChild.previousElementSibling.value;
    setAts(parent.firstElementChild, [
        ["type", "checkbox"]
    ]);
    parent.removeChild(parent.lastElementChild);
    parent.removeChild(parent.lastElementChild);
    parent.lastElementChild.innerHTML = task;
    parent.lastElementChild.classList.remove("hidden");
    parent.firstElementChild.classList.remove("hidden");
    parent.nextElementSibling.classList.remove("hidden");
    let i = findTask(parent.parentElement);
    tasks[i].task = task;
    updateLs();
}

function setAts(el, ats) {
    ats.forEach(att => {
        el.setAttribute(att[0], att[1]);
    });
}

function createDiv(clas) {
    let div = document.createElement("div");
    div.classList.add(clas);
    return div;
}

function createInput(type, value) {
    let input = document.createElement("input");
    setAts(input, [
        ["type", type],
        ["value", value]
    ]);
    return input;
}

function findTask(parent) {
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id == parent.id)
            return i;
    }
}

function hideNoTask() {
    let arr = [activeList, compList, delList];
    arr.forEach(div => {
        let notask = div.firstElementChild.nextElementSibling;
        if (div.childElementCount > 2) {
            if (!notask.classList.contains('hidden')) {
                notask.classList.add('hidden');
            }
        } else {
            notask.classList.remove('hidden');
        }
    });
}

function Task(id, value, completed = false, deleted = false) {
    this.id = id;
    this.task = value;
    this.completed = completed;
    this.deleted = deleted;
}
setFromLs();