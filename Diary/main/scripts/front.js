var currentData;
var differntData;
var us;
var tasker;
function deleteTask(button) {
    //отправить запрос на удаление
    var task;
    var i = 0;
    var _loop_1 = function () {
        if (button.id == tasker[i].id) {
            var task_1 = {
                id: button.id,
                id_user: "",
                task: "",
                date: "",
                status: "",
                syncing: false,
                id_google: tasker[i].id_google
            };
            deleteTableTask().then(function (data) {
                fetch("http://diary/postDeleteTask", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify(task_1)
                }).then(function (response) {
                    return response.text();
                })
                    .then(executor)["catch"](function (error) { return console.log("error"); });
            })["catch"](function (err) {
                alert("Error");
            });
            fetch("http://diary/deleteEventGoogle", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(task_1)
            }).then(function (response) {
                return response.text();
            })["catch"](function (error) { return console.log("error"); });
        }
    };
    for (i = 0; i < tasker.length; i++) {
        _loop_1();
    }
}
function finishTask(button) {
    //отправить запрос на изменение статуса
    var i = 0;
    for (i = 0; i < tasker.length; i++) {
        if (button.id == tasker[i].id) {
            var st = 0;
            if (tasker[i].status == 0)
                st = 1;
            else
                st = 0;
            deleteTableTask().then(function (data) {
                var task = {
                    id: button.id,
                    id_user: "",
                    task: "",
                    date: "",
                    status: st,
                    syncing: false
                };
                fetch("http://diary/changeStatusTask", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify(task)
                }).then(function (response) {
                    return response.text();
                })
                    .then(executor)["catch"](function (error) { return console.log("error"); });
            })["catch"](function (err) {
                alert("Error");
            });
            break;
        }
    }
}
//синхронизация с Google
function sendGoogle(button) {
    var task;
    var i = 0;
    for (i = 0; i < tasker.length; i++) {
        if (button.id == tasker[i].id) {
            tasker[i].syncing = !tasker[i].syncing;
            task = {
                id: button.id,
                id_user: "",
                task: tasker[i].task,
                date: tasker[i].data,
                status: "",
                syncing: tasker[i].syncing
            };
            deleteTableTask().then(function (data) {
                fetch("http://diary/syncingWithGoogle", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify(task)
                }).then(function (response) {
                    return response.text();
                })
                    .then(executor)["catch"](function (error) { return console.log("error"); });
            })["catch"](function (err) {
                alert("Error");
            });
            break;
        }
    }
}
function funonload() {
    us = JSON.parse(localStorage.getItem("user"));
    var login = document.getElementById("login");
    login.textContent = us.name;
    //localStorage.removeItem("user");
    // получить текущее время
    differntData = new Date();
    outDate(differntData);
    var dStr = getDateStr(differntData);
    var User = {
        //id: us.id,
        id: us.id,
        name: us.name,
        date: dStr
    };
    requestGo(User, "http://diary/getTask");
}
function dynamikTask(res) {
    var i = 1;
    tasker = res;
    res.forEach(function (element) {
        var _a;
        var tr = document.createElement("tr");
        // number
        var th = document.createElement("th");
        th.textContent = i.toString();
        th.scope = "row";
        tr.appendChild(th);
        //task
        var td = document.createElement("td");
        td.textContent = element.task;
        tr.appendChild(td);
        //time
        var td = document.createElement("td");
        td.textContent = element.data.substring(11, 17);
        tr.appendChild(td);
        //status
        if (element.status == 0) {
            var td = document.createElement("td");
            td.textContent = "In progress";
            tr.appendChild(td);
        }
        if (element.status == 1) {
            var td = document.createElement("td");
            td.textContent = "Finished";
            tr.appendChild(td);
        }
        //buttons
        var td = document.createElement("td");
        //delete 
        var button = document.createElement("button");
        button.type = "button";
        button.id = element.id;
        button.className = "btn btn-danger";
        button.textContent = "Delete";
        button.onclick = function () {
            deleteTask(this);
        };
        td.appendChild(button);
        //create
        var button = document.createElement("button");
        button.type = "button";
        button.id = element.id;
        button.className = "btn btn-success ms-1";
        button.textContent = "Finished";
        button.onclick = function () {
            finishTask(this);
        };
        td.appendChild(button);
        // synsing
        console.log(element.syncing);
        console.log("GEr");
        if (!element.syncing) {
            console.log(element.syncing);
            var button = document.createElement("button");
            button.type = "button";
            button.id = element.id;
            button.className = "btn btn-info ms-1";
            button.textContent = "Synsing";
            button.onclick = function () {
                sendGoogle(this);
            };
            td.appendChild(button);
        }
        tr.appendChild(td);
        (_a = document.getElementById("dest")) === null || _a === void 0 ? void 0 : _a.appendChild(tr);
        i++;
    });
}
function deleteTableTask() {
    return new Promise(function (resolve, reject) {
        var taskTable = (document.getElementById('taskTable'));
        if (taskTable.rows.length > 1) {
            var rowCount = taskTable.rows.length;
            for (var i = rowCount - 1; i > 0; i--) {
                taskTable.deleteRow(i);
            }
        }
        resolve(0);
    });
}
//добавление задач
function sendTask() {
    var task = document.getElementById("editTask").value;
    var time = document.getElementById("editTime").value;
    var str = getDateStr(differntData) + " " + time + ":00";
    var check = checkDataForm(task, time);
    switch (check) {
        case 0: {
            //удаление
            deleteTableTask().then(function (data) {
                var tasker = {
                    id_user: us.id,
                    task: task,
                    date: str,
                    status: "In progress",
                    syncing: true
                };
                fetch("http://diary/postTask", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify(tasker)
                }).then(function (response) {
                    return response.text();
                })
                    .then(executor)["catch"](function (error) { return console.log("error"); });
                //получение с сервреа
            })["catch"](function (err) {
                alert("Error");
            });
            break;
        }
        case 1: {
            var errorLog = document.getElementById("error");
            errorLog.hidden = false;
            errorLog.textContent = "Пустые поля";
            break;
        }
    }
}
function checkDataForm(task, time) {
    //возвращает результат проверки - 0, проверка прошла
    //остальное состояние
    var condition = 0;
    // 1 пустые поля
    // 2 - проверка на пробелы и удалаение лишнго    
    // 
    task = task.replace(/[^a-zа-яё0-9\s]/gi, ' ');
    task = task.replace(/&nbsp;/g, '');
    task = task.replace(/\s+/g, ' ');
    task = task.replace(/ +/g, ' ').trim();
    if (task == "" || task == " " || time == "") {
        condition = 1;
    }
    return condition;
}
function executor(data) {
    switch (data) {
        case "0": {
            var dStr = getDateStr(differntData);
            var User = {
                //id: us.id,
                id: us.id,
                name: us.name,
                date: dStr
            };
            requestGo(User, "http://diary/getTask");
            break;
        }
        case "1": {
            var errorLog = document.getElementById("error");
            errorLog.hidden = false;
            errorLog.textContent = "Ошибка БД";
            break;
        }
    }
}
function executorTask(data) {
    var us = JSON.parse(data);
}
function chectMonth(choice) {
    var month = null;
    switch (choice) {
        case 11: {
            month = "Декабрь";
            break;
        }
        case 10: {
            month = "Ноябрь";
            break;
        }
        case 9: {
            month = "Октябрь";
            break;
        }
        case 8: {
            month = "Сентябрь";
            break;
        }
        case 7: {
            month = "Август";
            break;
        }
        case 6: {
            month = "Июль";
            break;
        }
        case 5: {
            month = "Июнь";
            break;
        }
        case 4: {
            month = "Май";
            break;
        }
        case 3: {
            month = "Апрель";
            break;
        }
        case 2: {
            month = "Март";
            break;
        }
        case 1: {
            month = "Февраль";
            break;
        }
        case 0: {
            month = "Январь";
            break;
        }
    }
    return month;
}
function updateCurrentData() {
    currentData = new Date();
}
function outDate(strData) {
    var str = strData.getDate() + " ";
    str += chectMonth(strData.getMonth()) + " ";
    str += strData.getFullYear();
    var data = document.getElementById("data");
    data.textContent = str;
}
function getDateStr(strData) {
    var str = strData.getFullYear() + "-";
    var num = strData.getMonth() + 1;
    if (num < 10)
        str += "0" + num + "-";
    else
        str += num + "-";
    if (strData.getDate() < 10)
        str += "0" + strData.getDate() + " ";
    else
        str += strData.getDate() + " ";
    return str;
}
function resetClick() {
    deleteTableTask().then(function (data) {
        differntData = currentData;
        outDate(differntData);
        var dStr = getDateStr(differntData);
        var User = {
            //id: us.id,
            id: us.id,
            name: us.name,
            date: dStr
        };
        requestGo(User, "http://diary/getTask");
    })["catch"](function (err) {
        alert("Error");
    });
}
function leftClick() {
    deleteTableTask().then(function (data) {
        differntData.setDate(differntData.getDate() - 1);
        outDate(differntData);
        var dStr = getDateStr(differntData);
        var User = {
            //id: us.id,
            id: 1,
            name: "Jonh",
            date: dStr
        };
        requestGo(User, "http://diary/getTask");
    })["catch"](function (err) {
        alert(err);
    });
}
function rightClick() {
    deleteTableTask().then(function (data) {
        differntData.setDate(differntData.getDate() + 1);
        outDate(differntData);
        var dStr = getDateStr(differntData);
        var User = {
            //id: us.id,
            id: us.id,
            name: us.name,
            date: dStr
        };
        requestGo(User, "http://diary/getTask");
    })["catch"](function (err) {
        alert(err);
    });
}
function requestGo(User, url) {
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(User)
    }).then(function (response) {
        return response.json().then(function (data) { return ({
            data: data,
            status: response.status
        }); }).then(function (res) {
            dynamikTask(res.data);
        });
    });
}
