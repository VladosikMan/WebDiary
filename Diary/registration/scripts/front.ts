let registrUser = null;

function sendRegistration(){
     //получить данные с ввода и отправить их в модуль проверки
     var name : string = (<HTMLInputElement>document.getElementById("editName")).value;
     var mail : string = (<HTMLInputElement>document.getElementById("editMail")).value;
     var password : string = (<HTMLInputElement>document.getElementById("editPassword")).value;
     var repeatPassword : string = (<HTMLInputElement>document.getElementById("editRepeatPassword")).value;
     var check : number = checkDataForm(name,mail,password,repeatPassword);
     switch(check){
          case 0:{
               registrUser = {
                    id:"",
                    name: name,
                    mail: mail,
                    password: password,
                    repeatPassword: repeatPassword
               };
               fetch("http://diary/postUser",{
               method: 'POST',
               headers: {
                 'Content-Type': 'application/json;charset=utf-8'
               },
               body: JSON.stringify(registrUser)
               }).then((response)=>{
                    return response.text();
               })
               .then(executor)
               .catch((error)=> console.log("error"));
                break;
          }
          case 1:{
               showError("Не все данные введены");
               break;
          }
          case 2:{
               showError("Не правильный ввод имени");
               break;
          }
          case 3:{
               showError("Не правильный ввод почты");
               break;
          }
          case 4:{
               showError("Не правильный ввод пароля");
               break;
          }
          case 5:{
               showError("Пароли не совпадают");
               break;
          }
     }
     
}
function transitAuthorization(){
     fetch("http://diary/authorization", {
          mode: 'no-cors',
          method: 'get'
        })
     .then((response) => {
          if (response.redirected) window.location = <any>response.url;
     })
     .catch((error) => console.log("Error"));
}
//-----------------------------------------------------------------
//функция по тестированию данных формы
function checkDataForm(name: string, mail: string, password:string, repeatPassword:string): number {
     //возвращает результат проверки - 0, проверка прошла
     //остальное состояние
     var condition : number =  0;
     // 1 пустые поля
     // 2 - проверка на пробелы
     // 3 - не правильная почта
     // 4 - не правильный пароль
     // 5 - пароли не совпадают
     // проверка имени
     if(!checkName(name))
          condition = 2;
     // проверка почты
     const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([а-я-a-zA-Z\-0-9]+\.)+[а-я-a-zA-Z]{2,}))$/;
     if(!re.test(mail))
          condition = 3;
     //проверка пароля
     const test = /(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*]{6,}/g
     if(!test.test(password))
          condition = 4;
 
     if(password!==repeatPassword){
          condition =  5;
     }
     if(name.length ==0 || mail.length == 0 || password.length == 0 || repeatPassword.length == 0){
          condition =  1;
     }
     return condition;
}

function checkName(name : string): boolean{
     var old : string = name;
     var flag : boolean = false;
     name = name.replace(/[^a-zа-яё0-9\s]/gi, ' ');
     name = name.replace(/&nbsp;/g,'');
     name = name.replace(/\s+/g, ' ');
     name = name.replace(/ +/g, ' ').trim();
     if(name === old)
          flag = true;
     return flag;
}
 //-----------------------------------
 //переход на главную форму
 function replaceOnMain(data : any){
     registrUser.id= data; 
     localStorage.setItem("user", JSON.stringify(registrUser));
     fetch("http://diary/main", {
          mode: 'no-cors',
          method: 'get'
        })
     .then((response) => {
          if (response.redirected) window.location = <any>response.url;
     })
     .catch((error) => console.log("Error"));
 }

 function executor(data : any){
     switch(data){
          case "0":{
               
               break;
          }
          case "-1":{
               showError("Не все данные введены");
               break;
          }
          case "-2":{
               showError("Не правильный ввод имени");
               break;
          }
          case "-3":{
               showError("Не правильный ввод почты");
               break;
          }
          case "-4":{
               showError("Не правильный ввод пароля");
               break;
          }
          case "-5":{
               showError("Пароли не совпадают");
               break;
          }
          case "-6":{
               showError("Ошибка БД");
               break;
          }
          case "-7":{
               showError("Такой пользователь уже есть");
               break;
          }
          default:{
               hideError();
               replaceOnMain(data);
               break;
          }
     }
 }

 function hideError(){
     const errorLog :any= document.getElementById("error");
     errorLog.hidden =  true;
 }
 function showError(error: string){
     const errorLog :any= document.getElementById("error");
     errorLog.hidden =  false;
     errorLog.textContent = error;
 }