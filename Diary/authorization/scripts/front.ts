let authUser = null;
function sendAuthorization(){
     var name : string = (<HTMLInputElement>document.getElementById("editName")).value;
     var password : string = (<HTMLInputElement>document.getElementById("editPassword")).value;
     var check : number = checkDataForm(name,password);
     switch(check){
          case 0:{
               authUser = {
                    id: "",
                    name: name,
                    mail: "",
                    password: password,
                    repeatPassword: ""
               };    
                    fetch("http://diary/getAuthUser",{
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify(authUser)
                    }).then((response)=>{
                         return response.text();
                    })
               .then(executor)
               .catch((error)=> console.log("error"));
               break;
     }
          case 1:{
               showError("Пустота");
               break;
               }
     }

}
function transitRegistration(){
    hideError();
    fetch("http://diary/registration", {
         mode: 'no-cors',
         method: 'get'
       })
    .then((response) => {
         if (response.redirected) window.location = <any>response.url;
    })
    .catch((error) => console.log("Error"));
    
}
// динамика по восстановлению пароля
function recuperoPassword(){
     //сделать запрос, получить от сервера ответ
     fetch("http://diary/recuperoPassword", {
          mode: 'no-cors',
          method: 'get'
        })
     .then((response) => {
          
     })
     .catch((error) => console.log("Error"));
}
//-----------------------------------------------------------------
//функция по тестированию данных формы
function checkDataForm(name: string, password:string): number {
    //возвращает результат проверки - 0, проверка прошла
    //остальное состояние
    if(password==""||name==""){
         return 1;
    }else{
         return 0;
    }    
}

function replaceOnMain(data : any){
     authUser.id = data;
     localStorage.setItem("user", JSON.stringify(authUser));
     fetch("http://diary/main", {
          mode: 'no-cors',
          method: 'get'
        })
     .then((response) => {
          if (response.redirected) window.location = <any>response.url;
     })
     .catch((error) => console.log("Error"));
 }

 function transitRecovery(){
     hideError();
     fetch("http://diary/recoverypassword", {
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
               showError("Ошибка БД");
               break;
          }
          case "-2":{
               showError("Не правильный пользователь или пароль");
               break;
          }
          case "-3":{
               showError("Неверный пароль");
               break;
          }
          default :{
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