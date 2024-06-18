$(document).ready(function () {
    // Retrieve tasks and nextId from localStorage or initialize if not present
    let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
    let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;
  
    // Function to generate a unique task id
    function generateTaskId() {
      return nextId++;
    }
  
    // Function to create a task card
    function createTaskCard(task) {
      let card = $(`
        <div class="card task-card" id="task-${task.id}">
          <div class="card-body">
            <h5 class="card-title">${task.title}</h5>
            <p class="card-text">${task.description}</p>
            <p class="card-text"><small class="text-muted">Deadline: ${task.deadline}</small></p>
            <button class="btn btn-danger btn-sm float-end delete-btn"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      `);
  
      // Set data attributes for status and task id
      card.data("status", task.status);
      card.data("task-id", task.id);
  
      // Check if task is nearing deadline or overdue for color coding
      let today = dayjs();
      let deadline = dayjs(task.deadline);
      let daysDifference = deadline.diff(today, 'days');
  
      if (daysDifference < 0) {
        card.addClass('due-red');
      } else if (daysDifference < 3) {
        card.addClass('due-yellow');
      }
  
      // Add delete button click handler
      card.find(".delete-btn").click(handleDeleteTask);
  
      return card;
    }
  
    // Function to render the task list and make cards draggable
    function renderTaskList() {
      $("#not-started-cards").empty();
      $("#in-progress-cards").empty();
      $("#completed-cards").empty();
  
      taskList.forEach(task => {
        let card = createTaskCard(task);
        switch (task.status) {
          case 'not-started':
            $("#not-started-cards").append(card);
            break;
          case 'in-progress':
            $("#in-progress-cards").append(card);
            break;
          case 'completed':
            $("#completed-cards").append(card);
            break;
          default:
            break;
        }
      });
  
      // Make task cards draggable
      $(".task-card").draggable({
        revert: "invalid", // Snap back if not dropped in a droppable area
        cursor: "move",
        stack: ".task-card",
        containment: "document"
      });
    }
  
    // Function to handle adding a new task
    $("#taskForm").submit(function (event) {
      event.preventDefault();
  
      let title = $("#taskTitle").val();
      let description = $("#taskDescription").val();
      let deadline = $("#taskDeadline").val();
  
      if (title && deadline) {
        let newTask = {
          id: generateTaskId(),
          title: title,
          description: description,
          deadline: deadline,
          status: 'not-started' // Initial status
        };
  
        taskList.push(newTask);
        saveToLocalStorage();
        renderTaskList();
  
        // Clear form inputs and close modal
        $("#taskTitle").val("");
        $("#taskDescription").val("");
        $("#taskDeadline").val("");
        $("#formModal").modal("hide");
      } else {
        alert("Please enter a title and deadline for the task.");
      }
    });
  
    // Function to handle deleting a task
    function handleDeleteTask(event) {
      event.stopPropagation(); // Prevent card drag when clicking delete button
      let card = $(this).closest(".task-card");
      let taskId = card.data("task-id");
  
      taskList = taskList.filter(task => task.id !== taskId);
      saveToLocalStorage();
      renderTaskList();
    }
  
    // Function to handle dropping a task into a new progress column
    $(".lane .card-body").droppable({
      accept: ".task-card",
      drop: function (event, ui) {
        let card = ui.draggable;
        let taskId = card.data("task-id");
        let newStatus = $(this).parent().attr("id"); // Get status from parent lane id
  
        // Update task status in taskList
        let taskIndex = taskList.findIndex(task => task.id === taskId);
        taskList[taskIndex].status = newStatus;
  
        saveToLocalStorage();
        renderTaskList();
      }
    });
  
    // Function to save taskList and nextId to localStorage
    function saveToLocalStorage() {
      localStorage.setItem("tasks", JSON.stringify(taskList));
      localStorage.setItem("nextId", JSON.stringify(nextId));
    }
  
    // Initial rendering of task list and setup
    renderTaskList();
  });
  