var currentData : Date;
var differntData : Date;
let us: any;
let tasker: any;

function deleteTask(button : HTMLInputElement){
    //отправить запрос на удаление
    let task;
       var i:number = 0;
       for(i = 0; i < tasker.length; i++){
            if(button.id == tasker[i].id){
                let task = {
                    id : button.id,
                    id_user: "",
                    task: "",
                    date : "",
                    status: "",
                    syncing: false,
                    id_google:  tasker[i].id_google 
                };
                deleteTableTask().then((data)=>{
                    fetch("http://diary/postDeleteTask",{
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json;charset=utf-8'
                            },
                            body: JSON.stringify(task)
                            }).then((response)=>{
                                return response.text();
                            })
                            .then(executor)
                            .catch((error)=> console.log("error"));
                }).catch((err)=>{
                    alert("Error");
                });
                fetch("http://diary/deleteEventGoogle",{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify(task)
                    }).then((response)=>{
                        return response.text();
                    })
                    .catch((error)=> console.log("error"));
            }
       }
}
function finishTask(button : HTMLInputElement){
    //отправить запрос на изменение статуса
    var i:number = 0;
    for(i = 0; i < tasker.length; i++){
        if(button.id == tasker[i].id){
            var st : number = 0;
            if(tasker[i].status == 0)
                st = 1;
            else
                st = 0;

            deleteTableTask().then((data)=>{
                let task = {
                    id : button.id,
                    id_user: "",
                    task: "",
                    date : "",
                    status: st,
                    syncing: false
                   };
                fetch("http://diary/changeStatusTask",{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify(task)
                    }).then((response)=>{
                        return response.text();
                    })
                    .then(executor)
                    .catch((error)=> console.log("error"));
                }).catch((err)=>{
                    alert("Error");
                });
            
            break;
        }
    }   
}
//синхронизация с Google
function sendGoogle(button : HTMLInputElement){
    let task;
    var i:number = 0;
    for(i = 0; i < tasker.length; i++){
        if(button.id == tasker[i].id){
            tasker[i].syncing = ! tasker[i].syncing;
            task = {
                id : button.id,
                id_user: "",
                task: tasker[i].task,
                date : tasker[i].data,
                status: "",
                syncing: tasker[i].syncing
                };
                deleteTableTask().then((data)=>{
                    fetch("http://diary/syncingWithGoogle",{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify(task)
                    }).then((response)=>{
                        return response.text();
                    })
                    .then(executor)
                    .catch((error)=> console.log("error"));
                }).catch((err)=>{
                    alert("Error");
                });
            break;
         }
     }
}

function funonload(){
    us = JSON.parse(localStorage.getItem("user"));
    var login : HTMLElement = <HTMLInputElement>document.getElementById("login"); 
    login.textContent = us.name;
    //localStorage.removeItem("user");
    // получить текущее время
    differntData = new Date();
    outDate(differntData);
    var dStr : string  = getDateStr(differntData);
    let User = {
        //id: us.id,
        id: us.id,
        name: us.name,
        date: dStr 
   };
   requestGo(User, "http://diary/getTask");
}
function dynamikTask(res : any){
    var i : number = 1;
    tasker = res;
    res.forEach((element :any) => {
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
        if(element.status == 0){
            var td = document.createElement("td");
            td.textContent = "In progress";
            tr.appendChild(td);
        }
        if(element.status == 1){
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
        button.onclick = function(this){
            deleteTask(<HTMLInputElement>this);
        }
        
        td.appendChild(button);
        //create
        var button = document.createElement("button");
        button.type = "button";
        button.id = element.id;
        button.className = "btn btn-success ms-1";
        button.textContent = "Finished";
        button.onclick = function(this){
            finishTask(<HTMLInputElement> this);
        }
        td.appendChild(button);
        // synsing
        console.log(element.syncing);
        console.log("GEr");
        if(!element.syncing){
            console.log(element.syncing);
            var button = document.createElement("button");
            button.type = "button";
            button.id = element.id;
            button.className = "btn btn-info ms-1";
            button.textContent = "Synsing";
            button.onclick = function(this){
                sendGoogle(<HTMLInputElement> this);
            }
            td.appendChild(button);
        }
        


        tr.appendChild(td);
        document.getElementById("dest")?.appendChild(tr);      
        i++;  


    });   
}

function deleteTableTask(){
    return new Promise((resolve, reject) =>{
        var taskTable = <HTMLTableElement>(document.getElementById('taskTable'));
        if(taskTable.rows.length > 1 ){
            var rowCount : number = taskTable.rows.length;
            for (var i=rowCount-1; i >0; i--) {
                taskTable.deleteRow(i);
            }
        }
        resolve(0);
    })
    
}

//добавление задач
function sendTask(){
    var task : string = (<HTMLInputElement>document.getElementById("editTask")).value;
    var time : string = (<HTMLInputElement>document.getElementById("editTime")).value;

    var str = getDateStr(differntData) + " " + time + ":00";
    var check : number = checkDataForm(task, time); 

    switch(check){
        case 0:{
            //удаление
            deleteTableTask().then((data)=>{
            let tasker = {
                id_user: us.id,
                task: task,
                date : str,
                status: "In progress",
                syncing: true
           };
            fetch("http://diary/postTask",{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(tasker)
            }).then((response)=>{
                return response.text();
            })
            .then(executor)
            .catch((error)=> console.log("error"));
            //получение с сервреа
            }).catch((err)=>{
                alert("Error");
            });
            break;
        }
        case 1:{
            const errorLog :any= document.getElementById("error");
            errorLog.hidden =  false;
            errorLog.textContent = "Пустые поля";
            break;
        }
    }
}
function checkDataForm(task: string, time: string): number {
    //возвращает результат проверки - 0, проверка прошла
    //остальное состояние
    var condition : number =  0;
    // 1 пустые поля
    // 2 - проверка на пробелы и удалаение лишнго    
    // 
    task = task.replace(/[^a-zа-яё0-9\s]/gi, ' ');
    task = task.replace(/&nbsp;/g,'');
    task = task.replace(/\s+/g, ' ');
    task = task.replace(/ +/g, ' ').trim();

   if(task == "" || task == " " || time == ""){
       condition = 1;
   }
    return condition;
}
function executor(data : any){
    switch(data){
         case "0":{
                var dStr : string  = getDateStr(differntData);
                let User = {
                    //id: us.id,
                    id: us.id,
                    name: us.name,
                    date: dStr
                };
                requestGo(User, "http://diary/getTask");
              break;
         }
         case "1":{
              const errorLog :any= document.getElementById("error");
              errorLog.hidden =  false;
              errorLog.textContent = "Ошибка БД";
              break;
         }
    }
}
function executorTask(data : any){
    let us = JSON.parse(data);
}
function chectMonth(choice : number):string{ 
    var month : string = null; 
    switch(choice){
        case 11:{
            month =  "Декабрь";
            break;
        }
        case 10:{
            month = "Ноябрь";
            break;
        }
        case 9:{
            month = "Октябрь";
            break;
        }
        case 8:{
            month =  "Сентябрь";
            break;
        }
        case 7:{
            month = "Август";
            break;
        }case 6:{
            month = "Июль";
            break;
        }
        case 5:{
            month = "Июнь";
            break;
        }
        case 4:{
            month = "Май";
            break;
        }
        case 3:{
            month = "Апрель";
            break;
        }
        case 2:{
            month = "Март";
            break;
        }
        case 1:{
            month = "Февраль";
            break;
        }
        case 0:{
            month =  "Январь";
            break;
        }	
    }
    return month;
}
function updateCurrentData(){
    currentData = new Date();
}
function outDate(strData : Date) {
    var str : string = strData.getDate()+ " ";
    str += chectMonth(strData.getMonth()) + " ";
    str += strData.getFullYear();
    var data : HTMLElement = <HTMLElement>document.getElementById("data");
    data.textContent  = str;
}
function getDateStr(strData : Date): string{
    var str : string  = strData.getFullYear()+"-";
    var num : number = strData.getMonth()+1;
    if(num < 10)
        str += "0" + num +"-";
    else
        str += num +"-";
    if(strData.getDate() < 10)
        str += "0" + strData.getDate()+" ";
    else
        str += strData.getDate()+" ";
   
    return str;
}
function resetClick(){
    deleteTableTask().then(data=>{
        differntData = currentData;
        outDate(differntData);
        var dStr : string  = getDateStr(differntData);
        let User = {
            //id: us.id,
            id: us.id,
            name: us.name,
            date: dStr
        };
        requestGo(User, "http://diary/getTask");
        }).catch(err =>{
            alert("Error");
        })
}
function leftClick(){
    deleteTableTask().then(data=>{
        differntData.setDate(differntData.getDate() - 1);
        outDate(differntData);
        var dStr : string  = getDateStr(differntData);
        let User = {
            //id: us.id,
            id: us.id,
            name: us.name,
            date: dStr
     };
    requestGo(User, "http://diary/getTask");
    }).catch(err=>{
        alert(err);
    });
}
function rightClick(){
    deleteTableTask().then(data=>{
        differntData.setDate(differntData.getDate() + 1);
         outDate(differntData);
        var dStr : string  = getDateStr(differntData);
        let User = {
            //id: us.id,
            id: us.id,
            name: us.name,
            date: dStr
        };
        requestGo(User, "http://diary/getTask");
    }).catch(err=>{
        alert(err);
    });
}
function requestGo(User : any, url : string){
    fetch(url,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(User)
        }).then(response => 
            response.json().then(data => ({
                data: data,
                status: response.status
            })
            ).then(res => {
                dynamikTask(res.data);
         }));
}