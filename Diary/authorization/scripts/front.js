var authUser = null;
function sendAuthorization() {
    var name = document.getElementById("editName").value;
    var password = document.getElementById("editPassword").value;
    var check = checkDataForm(name, password);
    switch (check) {
        case 0: {
            authUser = {
                id: "",
                name: name,
                mail: "",
                password: password,
                repeatPassword: ""
            };
            fetch("http://diary/getAuthUser", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(authUser)
            }).then(function (response) {
                return response.text();
            })
                .then(executor)["catch"](function (error) { return console.log("error"); });
            break;
        }
        case 1: {
            showError("Пустота");
            break;
        }
    }
}
function transitRegistration() {
    hideError();
    fetch("http://diary/registration", {
        mode: 'no-cors',
        method: 'get'
    })
        .then(function (response) {
        if (response.redirected)
            window.location = response.url;
    })["catch"](function (error) { return console.log("Error"); });
}
// динамика по восстановлению пароля
function recuperoPassword() {
    //сделать запрос, получить от сервера ответ
    fetch("http://diary/recuperoPassword", {
        mode: 'no-cors',
        method: 'get'
    })
        .then(function (response) {
    })["catch"](function (error) { return console.log("Error"); });
}
//-----------------------------------------------------------------
//функция по тестированию данных формы
function checkDataForm(name, password) {
    //возвращает результат проверки - 0, проверка прошла
    //остальное состояние
    if (password == "" || name == "") {
        return 1;
    }
    else {
        return 0;
    }
}
function replaceOnMain(data) {
    authUser.id = data;
    localStorage.setItem("user", JSON.stringify(authUser));
    fetch("http://diary/main", {
        mode: 'no-cors',
        method: 'get'
    })
        .then(function (response) {
        if (response.redirected)
            window.location = response.url;
    })["catch"](function (error) { return console.log("Error"); });
}
function transitRecovery() {
    hideError();
    fetch("http://diary/recoverypassword", {
        mode: 'no-cors',
        method: 'get'
    })
        .then(function (response) {
        if (response.redirected)
            window.location = response.url;
    })["catch"](function (error) { return console.log("Error"); });
}
function executor(data) {
    switch (data) {
        case "0": {
            break;
        }
        case "-1": {
            showError("Ошибка БД");
            break;
        }
        case "-2": {
            showError("Не правильный пользователь или пароль");
            break;
        }
        case "-3": {
            showError("Неверный пароль");
            break;
        }
        default: {
            hideError();
            replaceOnMain(data);
            break;
        }
    }
}
function hideError() {
    var errorLog = document.getElementById("error");
    errorLog.hidden = true;
}
function showError(error) {
    var errorLog = document.getElementById("error");
    errorLog.hidden = false;
    errorLog.textContent = error;
}
