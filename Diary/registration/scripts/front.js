var registrUser = null;
function sendRegistration() {
    //получить данные с ввода и отправить их в модуль проверки
    var name = document.getElementById("editName").value;
    var mail = document.getElementById("editMail").value;
    var password = document.getElementById("editPassword").value;
    var repeatPassword = document.getElementById("editRepeatPassword").value;
    var check = checkDataForm(name, mail, password, repeatPassword);
    switch (check) {
        case 0: {
            registrUser = {
                id: "",
                name: name,
                mail: mail,
                password: password,
                repeatPassword: repeatPassword
            };
            fetch("http://diary/postUser", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(registrUser)
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
            showError("Не правильный ввод имени");
            break;
        }
        case 3: {
            showError("Не правильный ввод почты");
            break;
        }
        case 4: {
            showError("Не правильный ввод пароля");
            break;
        }
        case 5: {
            showError("Пароли не совпадают");
            break;
        }
    }
}
function transitAuthorization() {
    fetch("http://diary/authorization", {
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
function checkDataForm(name, mail, password, repeatPassword) {
    //возвращает результат проверки - 0, проверка прошла
    //остальное состояние
    var condition = 0;
    // 1 пустые поля
    // 2 - проверка на пробелы
    // 3 - не правильная почта
    // 4 - не правильный пароль
    // 5 - пароли не совпадают
    // проверка имени
    if (!checkName(name))
        condition = 2;
    // проверка почты
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([а-я-a-zA-Z\-0-9]+\.)+[а-я-a-zA-Z]{2,}))$/;
    if (!re.test(mail))
        condition = 3;
    //проверка пароля
    var test = /(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*]{6,}/g;
    if (!test.test(password))
        condition = 4;
    if (password !== repeatPassword) {
        condition = 5;
    }
    if (name.length == 0 || mail.length == 0 || password.length == 0 || repeatPassword.length == 0) {
        condition = 1;
    }
    return condition;
}
function checkName(name) {
    var old = name;
    var flag = false;
    name = name.replace(/[^a-zа-яё0-9\s]/gi, ' ');
    name = name.replace(/&nbsp;/g, '');
    name = name.replace(/\s+/g, ' ');
    name = name.replace(/ +/g, ' ').trim();
    if (name === old)
        flag = true;
    return flag;
}
//-----------------------------------
//переход на главную форму
function replaceOnMain(data) {
    registrUser.id = data;
    localStorage.setItem("user", JSON.stringify(registrUser));
    fetch("http://diary/main", {
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
            showError("Не все данные введены");
            break;
        }
        case "-2": {
            showError("Не правильный ввод имени");
            break;
        }
        case "-3": {
            showError("Не правильный ввод почты");
            break;
        }
        case "-4": {
            showError("Не правильный ввод пароля");
            break;
        }
        case "-5": {
            showError("Пароли не совпадают");
            break;
        }
        case "-6": {
            showError("Ошибка БД");
            break;
        }
        case "-7": {
            showError("Такой пользователь уже есть");
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
