const pg = require('pg');
import { Task } from "./Task";
import {User} from  "./User"

const config = {
    host: 'localhost',
    // Do not hard code your username and password.
    // Consider using Node environment variables.
    user: 'diaryus',     
    password: 'gonkpong',
    database: 'diarydb',
    port: 5432
};
var client : any= null;
export function initDB(){
    client = new pg.Client(config);
    console.log("init");
    client.connect((err : any) => {
        if (err) throw err;
        else {
            console.log("Connect client");
        }
    });  
}
// проверить не зарегестрирован ли клиент
export function checkUser(user: User){
    return new Promise((resolve,reject)=>{
        const query = 'SELECT * FROM public.user where name = $1;';
            const values = [user.name];
            var condition : string ="0";
             client.query(query,values)
                .then((res : any) => {
                    const rows = res.rows;
                    if (rows.length==0){
                        condition = "0";
                    }else{
                        condition = "-7";
                    }
                    resolve(condition);
                })
                .catch((err:any) => {
                    console.log(err);
                    condition = "-6";
                    resolve(condition);
                });
        })
}

// проверить имеющихся пользователей
export function checkAuthUser(user: User) {
    return new Promise((resolve,reject)=>{
    const query = 'SELECT * FROM public.user where name = $1 and password = md5($2);';
        const values = [user.name, user.password];
        var condition : string ="0";
         client.query(query,values)
            .then((res : any) => {
                let dbUser = null;
                const rows = res.rows;
                if (rows.length==0){
                    condition = "-2";
                    console.log("her");
                }
                else{
                    rows.map((row:any) => {
                    
                        let str = JSON.stringify(row);
                        dbUser  = JSON.parse(str);
                       
                        console.log(dbUser.id);
                        condition = dbUser.id;
                    
                    });
                }

                /*else{

                    rows.map((row:any) => {
                    
                        let str = JSON.stringify(row);
                         dbUser  = JSON.parse(str);
                        
                        if(dbUser.password != user.password){
                            condition ="-3";
                            console.log("ger");
                        } 
                        console.log(dbUser.id);
                        condition = dbUser.id;
                    
                    });
                }
                */

                resolve(condition);
            })
            .catch((err:any) => {
                console.log(err);
                condition = "-1";
                resolve(condition);
            });
    })
}

// добавить пользователя
export function addUser(user : User) {
    return new Promise((resolve, reject)=>{
        // 0 - всё норм
        // -6 - ошибка
        const values = [user.name, user.mail,user.password];
        const query = `
        INSERT INTO public.user (name, mail, password)
        VALUES ($1,$2,md5($3)) returning id
        `;
        var condition : string = "0";
        client
            .query(query,values)
            .then((res : any) => {
                const str : string = res.rows[0].id;
               
                console.log('User created successfully!');
                resolve(str);   
            })
            .catch((err:any) => {
                console.log(err);
                condition = "-6";
                resolve(condition);
            });
    })   
}


// добавить задачу
export function addTask(task : Task) {
    return new Promise((resolve, reject)=>{
        // 0 - всё норм
        // 1 - ошибка
        const values = [task.id_user, task.task, task.date,"0",false];
        const query = `
        INSERT INTO public.task (id_user, task, data, status, syncing)
        VALUES ($1,$2,$3,$4,$5)
        `;
        var condition : string = "0";
        client
            .query(query,values)
            .then(() => {
                console.log('Task add successfully!');
                resolve(condition);   
            })
            .catch((err:any) => {
                console.log(err);
                condition = "1"
                resolve(condition);
            });
    })   
}
// удалить задачу
export function deleteTask(task : Task) {
    return new Promise((resolve, reject)=>{
        // 0 - всё норм
        // 1 - ошибка
        const values = [task.id];
        const query = `DELETE FROM public.task where id = $1`;
        var condition : string = "0";
        client
            .query(query,values)
            .then(() => {
                console.log('Task delete successfully!');
                resolve(condition);   
            })
            .catch((err:any) => {
                console.log(err);
                condition = "1"
                resolve(condition);
            });
    })   
}
//изменить статус задачи
export function changeStatusTask(task : Task) {
    return new Promise((resolve, reject)=>{
        // 0 - всё норм
        // 1 - ошибка
        const values = [task.status, task.id];
        const query = `UPDATE public.task SET status = $1 where id = $2`;
        var condition : string = "0";
        client
            .query(query,values)
            .then(() => {
                console.log('Task update successfully!');
                resolve(condition);   
            })
            .catch((err:any) => {
                console.log(err);
                condition = "1"
                resolve(condition);
            });
    })   
}

// получить список залач
export function getListTask(id_user: number, date : string){
    return new Promise((resolve, reject) =>{
        // 0 - всё норм
        // 1 - ошибка
        const values = [id_user, date];
        const query = 'SELECT * FROM public.task where id_user = $1 AND date(data) = $2 order by data;';
        var condition : string = "0";
        client
            .query(query, values)
            .then((res : any) =>{
                const rows = res.rows;
                let str = JSON.stringify(rows);
                console.log(str);
                resolve(str);
            })
            .catch((err : any)=>{
                console.log(err);
                condition = "1"
                resolve(condition);
            });
    });
}
export function updateTask(task : Task){
    return new Promise((resolve, reject) =>{
        // 0 - всё норм
        // 1 - ошибка
        const values = [task.syncing, task.id_google, task.id];
        const query = `update public.task set syncing = $1, id_google = $2 where id = $3;`;
        var condition : string = "0";
        client
            .query(query,values)
            .then(() => {
                console.log('Task update successfully!');
                resolve(condition);   
            })
            .catch((err:any) => {
                console.log(err);
                condition = "1"
                resolve(condition);
            });
    });
}

export function recoveruUser(user : User){
    //  0 - всё норм
    // -5 - ошибка БД
    // -6 - не верная почта
    // -7 - совпадают пароли
    return new Promise((resolve, reject)=>{
        const values1 = [user.mail];
        const values2 = [user.mail, user.password];
        const values3 = [user.mail, user.password];
        const query1 = `select * from public.user where mail = $1;`;
        const query2 = `select * from public.user where mail = $1 and password = md5($2)`;
        const query3 = `update public.user set password = md5($2) where mail = $1;`;
        var condition : string = "0";
        client
            .query(query1,values1)
            .then((res : any) =>{
                console.log("1");
                 if(res.rows.length == 0){
                    condition = "-6";
                    console.log("почта");    
                    resolve(condition);    
                 }
                else{
                    client.query(query2,values2)
                    .then((res: any)=>{
                        console.log("2");
                        if(res.rows.length != 0){
                            condition = "-7";       
                            resolve(condition);    
                        }
                        else{
                            //update
                            client.query(query3,values3)
                            .then((res:any)=>{
                                console.log("3");
                                condition = "0";
                                console.log('User password update successfully!');
                                resolve(condition);
                            })
                            .catch((err:any)=>{
                                console.log(err);
                                condition = "-5"
                                resolve(condition);
                            });
                        }
                    })
                    .catch((err:any)=>{
                        console.log(err);
                        condition = "-5"
                        resolve(condition);
                    });
                }        
            })

            .catch((err:any) => {
                console.log(err);
                condition = "-5";
                resolve(condition);
            });

            
    });
}