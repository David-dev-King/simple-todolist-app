
const todoListForm = document.getElementById('todo-list-form');
const listInput = todoListForm.querySelector('.task-input');
const pendingListGroup =  document.getElementById('pending');
const completedListGroup = document.getElementById('completed');
const taskForm = document.getElementById('new-task-form');
const taskInput = taskForm.querySelector('.task-input');
const taskList = document.querySelector('.task-list');
const editForm = document.getElementById('edit-task-form');
const editInput = editForm.querySelector('.task-input');

const undoButton = document.getElementById('undo-btn');

const overlay = document.querySelector('.screen-overlay');

const optionsPopup = document.querySelector('.list-options-popup');
const editOption = optionsPopup.querySelector('#edit-opt');
const deleteOption = optionsPopup.querySelector('#delete-opt');


const editListForm = document.querySelector('#edit-list-form');
const editListInput = editListForm.querySelector('.task-input');

const listHeader = document.getElementById('Header');

const deletePanel = document.querySelector('.delete-panel');
const confirmButton = deletePanel.querySelector('#confirm-btn');
const cancelButton = deletePanel.querySelector('#cancel-btn');

const createListPrompt = document.querySelector('.create-new-list');

let editIndex = 0;
let taskCompletedBuffer = {};
let taskIndexBuffer = {};

let tasks = [];
let todoLists = [];
let currentList = {};
let taskActions = [];
let undoneFirstAction = false;

let selectedList = {};






// A function for moving elements in an array
function moveElementToIndex(arr, fromIndex, toIndex) {
    if (fromIndex >= 0 && fromIndex < arr.length && toIndex >= 0 && toIndex <= arr.length) {
      const element = arr.splice(fromIndex, 1)[0];
      arr.splice(toIndex, 0, element);
    }
    return arr;
}

function allTasksCompleted(){
    let tasksCompleted = true;
    currentList.tasks.forEach(task => {
        if(task.completed == false){
            tasksCompleted = false;
        }
    });
    return tasksCompleted;
}

// Get the index of the fist completed task
function firstCompletedTaskIndex(){
    let tempIndex = 0
    for (let index = 0; index < currentList.tasks.length; index++) {
        const looptask = currentList.tasks[index];
        if(looptask.completed == true){
            tempIndex = index;
            break;
        }
    }
    return tempIndex;
}


// set the task completed buffer and the task index buffer
function setTaskBuffers(){
    taskCompletedBuffer = {};
    for (let i = 0; i < currentList.tasks.length; i++) {
        const task = currentList.tasks[i];
        taskCompletedBuffer[task.id] = task.completed;
        if (task.completed == false){
            taskIndexBuffer[task.id] = i;
        }   
    }
}


function currentActionIndex(){
    let currentIndex = -1;
    if (Boolean(taskActions.length)){
        for (let i = 0; i < taskActions.length; i++) {
            const action = taskActions[i];
            if (action.current == true){
                currentIndex = i;
                break;
            }
        }
        return currentIndex;
        
    }
    else return -2;
}

function currentListIndex(){
    let currentIndex = -1;
    if (Boolean(todoLists.length)){
        for (let i = 0; i < todoLists.length; i++) {
            const list = todoLists[i];
            if (list.current == true){
                currentIndex = i;
                break;
            }
        }
        return currentIndex;
        
    }
    else return -2;
}

function editTask(event){
    event.preventDefault();
    const taskText = editInput.value.trim();
    editForm.classList.remove('triggered');
    if (taskText == '')
        return;
    currentList.tasks[editIndex].text = taskText;
    
    saveTasks();
    renderTasks();
}

function editListName(event){
    event.preventDefault();
    const listText = editListInput.value.trim();
    const oldName = selectedList.name;
    editListForm.classList.remove('active');
    if (listText == '' || listText == oldName) return;
    // const listIndex = todoLists.findIndex(list => list.id === selectedList.id)
    selectedList.name = listText;
    localStorage.removeItem(oldName);
    saveTodoLists();
    renderTodoLists();
    renderTasks();
}

function disableEditForm(){
    overlay.classList.remove('active');
    editForm.classList.remove('triggered');
}

function disableOptionsPopup(e){
    if ((e.type === 'click' && !e.target.closest('.list-options-popup') && !e.target.closest('.options-btn')) || (e.type === 'keydown' && e.key == 'Escape')){
        optionsPopup.classList.remove('active');
        document.removeEventListener('click', disableOptionsPopup);
    }
}



function enableListEditForm(e){
    optionsPopup.classList.remove('active');
    overlay.classList.add('active');
    editListForm.classList.add('active');
    editListInput.value = selectedList.name;
    editListInput.focus();
}

function disableListEditForm(){
    overlay.classList.remove('active');
    editListForm.classList.remove('active');
}


function enableDeletePanel(){
    optionsPopup.classList.remove('active');
    overlay.classList.add('active');
    deletePanel.classList.add('active');
    function disableFrame(){
        document.addEventListener('click', disableDeletePanel);
    }
    requestAnimationFrame(disableFrame);
}
function disableDeletePanel(event){
    if (((event.type === 'click') && (!event.target.closest('.delete-panel') || event.target.closest('.delete-panel-buttons'))) || (event.type == 'keydown' && event.key == 'Escape')){
        overlay.classList.remove('active');
        deletePanel.classList.remove('active');
        document.removeEventListener('click', disableDeletePanel);
    }
}



function deleteList(event){
    if (!deletePanel.classList.contains('active')) return;
    // if (!(event.type == 'click' || (event.type == 'keydown'))) return;
    const listIndex = todoLists.findIndex(list => list.id == selectedList.id);
    if (selectedList.current == true){
        if (listIndex > 0){
            todoLists[listIndex-1].current = true;
        }
        else if (listIndex < todoLists.length-1){
            todoLists[listIndex+1].current = true;
        }
    }
    localStorage.removeItem(selectedList.name);
    todoLists.splice(listIndex, 1);
    overlay.classList.remove('active');
    deletePanel.classList.remove('active');
    saveTodoLists();
    renderTodoLists();
    renderTasks();
}



function addTodolist(event){
    event.preventDefault();
    let listText = listInput.value.trim();
    if (listText == '')
        return;
    else if (listText == '/date'){
        listText = new Date().toLocaleDateString('en-UK', {day: 'numeric', month: 'numeric', year: 'numeric'});
    }
    const list = {
        id: Date.now(),
        name: listText,
        completed: false,
        current: true,
        tasks: []
    }
    todoLists.forEach(todoList => {
        todoList.current = false;
    })
    todoLists.push(list);
    listInput.value = '';
    saveTodoLists();
    renderTodoLists();
    renderTasks();
}

function addTask(event){
    event.preventDefault();
    setTaskBuffers();



    const taskText = taskInput.value.trim();
    if (taskText == '')
        return;
    const task = {
        id: Date.now(),
        text: taskText,
        completed: false
    };
    currentList.tasks.push(task);
    
    // make sure the new task is before all the completed tasks
    currentList.tasks = moveElementToIndex(currentList.tasks, currentList.tasks.length-1, firstCompletedTaskIndex())
    taskInput.value = '';
    saveTasks();
    renderTasks();
    if (currentList.completed == true){
        currentList.completed = false;
        saveTodoLists()
        renderTodoLists();
    }


}

function renderTodoLists(){
    pendingListGroup.innerHTML = '';
    completedListGroup.innerHTML = '';
    loadTodoLists();
    
    // create list items for each todolist
    for(let i = 0; i < todoLists.length; i++){
        const list = todoLists[i];
        const filterText = listInput.value.trim().toLowerCase();
        if (list.name.toLowerCase().includes(filterText)){
            const li = document.createElement('li');
            li.classList.add('list-item');
            li.setAttribute('data-id', list.id);
            li.innerHTML = `
            <span class="list-name">${list.name}</span>
            <button class="options-btn"><i class="fas fa-ellipsis-v"></i></button>
            `
            if (list.completed == false){
                pendingListGroup.appendChild(li);
                pendingListGroup.appendChild(document.createElement('hr'));
            }
            else if (list.completed == true){
                completedListGroup.appendChild(li);
                completedListGroup.appendChild(document.createElement('hr'));
            }
    
            // Jump between lists
            li.addEventListener('click', (e) => {
                if(e.target.classList.contains('options-btn') || e.target.parentElement.classList.contains('options-btn')) return;
                const clickedIndex = todoLists.findIndex(todolist => todolist.id == Number(li.getAttribute('data-id')));
                
                if (todoLists[clickedIndex].current) return;
    
                todoLists.forEach(todoList => {
                    todoList.current = false;
                });
                todoLists[clickedIndex].current = true;
                taskActions = [];
                undoButton.classList.remove('active');
                saveTodoLists();
                renderTasks();
            });
            const optionsButton = li.querySelector('button');
            optionsButton.addEventListener('click', (e) => {
                optionsPopup.classList.add('active');
                optionsPopup.style.top = `${optionsButton.getBoundingClientRect().top + window.scrollY}px`;
                optionsPopup.style.left = `${optionsButton.getBoundingClientRect().left + window.scrollX}px`;
                if (parseFloat(window.getComputedStyle(optionsPopup).top) >= (parseFloat(window.innerHeight)-140)){
                    optionsPopup.style.top = `${parseFloat(window.innerHeight)-140}px`
                }
                const selectedIndex = todoLists.findIndex(todolist => todolist.id == Number(li.getAttribute('data-id')));
                selectedList = todoLists[selectedIndex];
    
                
                function disableFrame(){
                    document.addEventListener('click', disableOptionsPopup);
                    document.addEventListener('keydown', disableOptionsPopup);
                }
                requestAnimationFrame(disableFrame);
            });
        }
    }
    if (pendingListGroup.innerHTML == ''){
        pendingListGroup.innerHTML = 'No pending tasks 🎉'
    }
    if (completedListGroup.innerHTML == ''){
        completedListGroup.innerHTML = 'No completed tasks 😔'
    }

}


function renderTasks(){
    taskList.innerHTML = '';
    loadTodoLists();
    if (!Boolean(todoLists.length)){
        createListPrompt.classList.add('active');
        return;
    }
    createListPrompt.classList.remove('active');
    listHeader.innerHTML = currentList.name;

    // create list items for each task
    for (let i = 0; i < currentList.tasks.length; i++) {
        const task = currentList.tasks[i];
        const li = document.createElement('li');
        li.classList.add('task-item');
        li.setAttribute('data-id', task.id);
        li.innerHTML = `
        <div class = "strikethrough-parent"><span class="strikethrough"></span></div><span class="task-text">${task.text}</span>
        <div class="task-actions">
        <button class="edit-btn">
        <i class="fas fa-edit"></i>
        </button>
        <button class="delete-btn">
        <i class="fas fa-trash"></i></button>
        <button class="complete-btn">
        ${task.completed ? '<i class="fa-solid fa-circle-check"></i><i class="fas fa-undo"></i>' : '<i class="fas fa-check"></i>'}
        </button>
        </div>
        `;
        
        taskList.appendChild(li);
        if (task.completed){
            if (taskCompletedBuffer[task.id]){
                li.classList.add('completed');
            }
            else{
                requestAnimationFrame(() =>{
                   li.classList.add('completed');
               }) 
            }
        }
        if(i<currentList.tasks.length-1)
            taskList.appendChild(document.createElement('hr'));
        
    }
    const buttons = taskList.querySelectorAll('button');
    buttons.forEach(button => {
        button.innerHTML = '<span class="btn-backdrop"></span>' + button.innerHTML;
    });
}


// Delete, Edit and Complete tasks
function handleTaskActions(event){
    // task buffer for the stikethrough and undo completion
    setTaskBuffers();

    const target = event.target;
    const taskItem = target.closest('.task-item');
    if (taskItem == null) return;
    const taskId = Number(taskItem.getAttribute('data-id'));
    // get the task index
    const taskIndex = currentList.tasks.findIndex(task => task.id == taskId);

    // Record operations for undoing and redoing
    let action = {};


    if (target.classList.contains('delete-btn') || target.parentElement.classList.contains('delete-btn')){
        taskActions.splice(currentActionIndex() + 1, taskActions.length-currentActionIndex());
        taskActions.forEach(taskAction => {taskAction.current = false});
        action.type = 'delete';
        action.task = currentList.tasks[taskIndex];
        action.taskIndex = taskIndex;
        action.current = true;
        undoneFirstAction = false;

        currentList.tasks.splice(taskIndex, 1);
    }
    else if (target.classList.contains('edit-btn') || target.parentElement.classList.contains('edit-btn')){
        
        editIndex = taskIndex;
        overlay.classList.add('active');

        editForm.style.top = `${taskItem.getBoundingClientRect().top + window.scrollY}px`;
        editForm.style.left = `${taskItem.getBoundingClientRect().left + window.scrollX}px`;
        editForm.classList.add('triggered');
        editInput.value = currentList.tasks[taskIndex].text;
        editInput.focus();
    }
    else if (target.classList.contains('complete-btn') || target.parentElement.classList.contains('complete-btn')){
        if(!taskItem.classList.contains('completed')){
            currentList.tasks[taskIndex].completed = true; 
            currentList.tasks = moveElementToIndex(currentList.tasks, taskIndex, currentList.tasks.length-1);
        }
        else{
            currentList.tasks[taskIndex].completed = false;
            if(taskIndexBuffer[taskId] && taskIndexBuffer[taskId] < firstCompletedTaskIndex()){
                currentList.tasks = moveElementToIndex(currentList.tasks, taskIndex, taskIndexBuffer[taskId]);
            }
            else{
                currentList.tasks = moveElementToIndex(currentList.tasks, taskIndex, firstCompletedTaskIndex());
            }
            for (let i = 0; i < currentList.tasks.length; i++){
                const task = currentList.tasks[i];
                if (task.completed == false){
                    if (i> firstCompletedTaskIndex()){
                        currentList.tasks = moveElementToIndex(currentList.tasks, i, firstCompletedTaskIndex());
                        break;
                    }
                }
            }
        }
            
    }
    if(action.type){
        taskActions.push(action);
        undoButton.classList.add('active');
    }
    currentList.completed = allTasksCompleted() && Boolean(currentList.tasks.length);
    saveTasks()
    renderTasks();
    saveTodoLists();
    renderTodoLists();
}

function undoAction(){
    const tempActionIndex = currentActionIndex();
    if (Boolean(taskActions.length)){
        for(let i = 0; i < taskActions.length; i++){
            let action = taskActions[i];
            if ((i==0 && !undoneFirstAction) || i!=0){
                if (action.current == true){
                    if (i == 0) undoneFirstAction = true;
                    // write undo logic for each action type here
                    if (action.type == 'delete'){
                        currentList.tasks.push(action.task);
                        currentList.tasks = moveElementToIndex(currentList.tasks, currentList.tasks.length-1, action.taskIndex);
                    }
                    
                    action.current = false;
                    break;
                }
            }
        }
        if (tempActionIndex > 0)
            taskActions[tempActionIndex-1].current = true;
    }

    if (currentActionIndex() < 0) undoButton.classList.remove('active');


    saveTasks();
    renderTasks();
}




function saveTasks(){
    localStorage.setItem(currentList.name, JSON.stringify(currentList));
}
function saveTodoLists(){
    for (let index = 0; index < todoLists.length; index++) {
        const list = todoLists[index];
        localStorage.setItem(list.name, JSON.stringify(list));
        
    }
}
function loadTodoLists(){
    const listKeys = Object.keys(localStorage);
    const savedLists = [];
    for (let index = 0; index < listKeys.length; index++) {
        const key = listKeys[index];
        if(key != 'theme'){
            const savedItem =JSON.parse(localStorage.getItem(key));
            if (savedItem.id)
                savedLists.push(savedItem);
        }
    }
    if (savedLists){
        todoLists = savedLists;
        currentList = todoLists[currentListIndex()];
    }
}


undoButton.addEventListener('click', undoAction);
taskList.addEventListener('click', handleTaskActions);
document.addEventListener('DOMContentLoaded', renderTodoLists);
document.addEventListener('DOMContentLoaded', renderTasks);
taskForm.addEventListener('submit', addTask);
todoListForm.addEventListener('submit', addTodolist)
editForm.addEventListener('submit', editTask);
editInput.addEventListener('blur', (e) =>{
    e.preventDefault();
    disableEditForm();
});
document.addEventListener('keydown', (e) =>{
    const pressedKey = e.key;
    if (pressedKey == 'Escape'){
        disableEditForm();
        disableListEditForm();
        disableDeletePanel(e);
    }
    if (pressedKey == 'z' && e.ctrlKey){
        undoAction();
    }
    if (pressedKey == 'Enter'){
        deleteList(e);
    }
})

editOption.addEventListener('click', enableListEditForm);


editListInput.addEventListener('blur', disableListEditForm);
editListForm.addEventListener('submit', editListName);
deleteOption.addEventListener('click', enableDeletePanel);


confirmButton.addEventListener('click', deleteList);
listInput.addEventListener('input', renderTodoLists);