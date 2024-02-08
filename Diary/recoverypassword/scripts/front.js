var recoveruUser = null;
function sendRecovery() {
    var mail = document.getElementById("editMail").value;
    var password = document.getElementById("editPassword").value;
    var repeatPassword = document.getElementById("editRepeatPassword").value;
    var check = checkDataForm(mail, password, repeatPassword);
    switch (check) {
        case 0: {
            recoveruUser = {
                id: "",
                mail: mail,
                password: password,
                repeatPassword: repeatPassword
            };
            fetch("http://diary/getrecoveruUser", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(recoveruUser)
            }).then(function (response) {
                return response.text();
            })
                .then(executor)["catch"](function (error) { return console.log("error"); });
            break;
        }
        case 1: {
            showError("Не все данные введены");
            break;
        }
        case 2: {
            showError("Не правильный ввод почты");
            break;
        }
        case 3: {
            showError("Не правильный ввод пароля");
            break;
        }
        case 4: {
            showError("Пароли не совпадают");
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
//-----------------------------------------------------------------
//функция по тестированию данных формы
function checkDataForm(mail, password, repeatPassword) {
    //возвращает результат проверки - 0, проверка прошла
    //остальное состояние
    var condition = 0;
    // 1 пустые поля
    // 2 - не правильная почта
    // 3 - не правильный пароль
    // 4 - пароли не совпадают
    // проверка почты
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([а-я-a-zA-Z\-0-9]+\.)+[а-я-a-zA-Z]{2,}))$/;
    if (!re.test(mail))
        condition = 2;
    // проверка пароля
    var test = /(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*]{6,}/g;
    if (!test.test(password))
        condition = 3;
    if (password !== repeatPassword) {
        condition = 4;
    }
    // пустые поля
    if (mail.length == 0 || password.length == 0 || repeatPassword.length == 0)
        condition = 1;
    return condition;
}
function replaceOnMain() {
    fetch("http://diary/authorization", {
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
            hideError();
            replaceOnMain();
            break;
        }
        case "-1": {
            showError("Не все данные введены");
            break;
        }
        case "-2": {
            showError("Не правильный ввод почты");
            break;
        }
        case "-3": {
            showError("Не правильный ввод пароля");
            break;
        }
        case "-4": {
            showError("Пароли не совпадают");
            break;
        }
        case "-5": {
            showError("Ошибка БД");
            break;
        }
        case "-6": {
            showError("Неверная почта");
            break;
        }
        case "-7": {
            showError("Пароль совпадает со старым");
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
