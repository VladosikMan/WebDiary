import * as http from "http";
import * as db from "./dbHelper";
import * as syncingGoogle from "./googleModule";
import type { User } from "./User";
import type { Task } from "./Task";
import type { UserTask } from "./UserTask";

db.initDB();

http
  .createServer((request, response) => {
    console.log(request.url);
    switch (request.url) {
      case "/check": {
        console.log("Асцилла");
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.end("0");
        break;
      }
      case "/postUser": {
        const chunks: any = [];
        request.on("data", (chunk) => {
          chunks.push(chunk);
        });
        request.on("end", () => {
          const result = Buffer.concat(chunks).toString();
          const user: User = JSON.parse(result);
          const condition = checkDataForm(user);
          if (condition !== "0") {
            response.writeHead(200, { "Content-Type": "text/plain" });
            response.end(condition);
          } else {
            db.checkUser(user)
              .then((data) => {
                  response.writeHead(200, { "Content-Type": "text/plain" });
                  response.end(data);
              })
              .catch((err: any) => {
                console.log(err);
              });
              db.addUser(user)
                    .then((data) => {
                      response.writeHead(200, { "Content-Type": "text/plain" });
                      response.end(data);
                    })
                    .catch((err: any) => {
                      console.log(err);
                    });
          }
        });
        break;
      }
      case "/getAuthUser": {
        const chunks: any = [];
        request.on("data", (chunk) => {
          chunks.push(chunk);
        });
        request.on("end", () => {
          const result = Buffer.concat(chunks).toString();
          const user: User = JSON.parse(result);
          db.checkAuthUser(user)
            .then((data) => {
              response.writeHead(200, { "Content-Type": "text/plain" });
              response.end(data);
            })
            .catch((err: any) => {
              console.log(err);
            });
        });
        break;
      }
      case "/postTask": {
        const chunks: any = [];
        request.on("data", (chunk) => {
          chunks.push(chunk);
        });
        request.on("end", () => {
          const result = Buffer.concat(chunks).toString();
          const task: Task = JSON.parse(result);
          db.addTask(task)
            .then((data) => {
              response.writeHead(200, { "Content-Type": "text/plain" });
              response.end(data);
            })
            .catch((err: any) => {
              console.log(err);
            });
        });
        break;
      }
      case "/getTask": {
        const chunks: any = [];
        request.on("data", (chunk) => {
          chunks.push(chunk);
        });
        request.on("end", () => {
          const result = Buffer.concat(chunks).toString();
          const user: UserTask = JSON.parse(result);
          console.log(user.id);
          console.log(user.date);
          db.getListTask(user.id, user.date)
            .then((data) => {
              response.writeHead(200, { "Content-Type": "application/json" });
              response.end(data);
            })
            .catch((err: any) => {
              console.log(err);
            });
        });
        break;
      }
      case "/postDeleteTask": {
        const chunks: any = [];
        request.on("data", (chunk) => {
          chunks.push(chunk);
        });
        request.on("end", () => {
          const result = Buffer.concat(chunks).toString();
          const task: Task = JSON.parse(result);
          console.log(task.id);
          db.deleteTask(task)
            .then((data) => {
              response.writeHead(200, { "Content-Type": "application/json" });
              response.end(data);
            })
            .catch((err: any) => {
              console.log(err);
            });
        });
        break;
      }
      case "/changeStatusTask": {
        const chunks: any = [];
        request.on("data", (chunk) => {
          chunks.push(chunk);
        });
        request.on("end", () => {
          const result = Buffer.concat(chunks).toString();
          const task: Task = JSON.parse(result);
          console.log(task.id);
          db.changeStatusTask(task).then((data) => {
            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(data);
          });
        });
        break;
      }
      case "/syncingWithGoogle": {
        // добавить свою задачу
        const chunks: any = [];
        request.on("data", (chunk) => {
          chunks.push(chunk);
        });
        request.on("end", () => {
          const result = Buffer.concat(chunks).toString();
          const task: Task = JSON.parse(result);
          task.id_google = createGoogleId(task.id);
          syncingGoogle.addEvent(task);
          db.updateTask(task)
            .then(() => {
              response.writeHead(200, { "Content-Type": "application/json" });
              response.end("0");
            })
            .catch((err: any) => {
              console.log(err);
            });
        });
        break;
      }
      case "/deleteEventGoogle": {
        // удалять задачи в календаре по id
        const chunks: any = [];
        request.on("data", (chunk) => {
          chunks.push(chunk);
        });
        request.on("end", () => {
          const result = Buffer.concat(chunks).toString();
          const task: Task = JSON.parse(result);
          syncingGoogle.deleteEvent(task.id_google);
          response.writeHead(200, { "Content-Type": "application/json" });
          response.end("0");
        });
        break;
      }
      case "/getrecoveruUser": {
        const chunks: any = [];
        request.on("data", (chunk) => {
          chunks.push(chunk);
        });
        request.on("end", () => {
          const result = Buffer.concat(chunks).toString();
          const user: User = JSON.parse(result);
          // запрос на проверку почты
          // запрос на сравнение паролей
          // запрос на обновление пароля
          const condition = checkDataForm2(user);
          if (condition !== "0") {
            response.writeHead(200, { "Content-Type": "text/plain" });
            response.end(condition);
          } else {
            db.recoveruUser(user)
              .then((data) => {
                response.writeHead(200, { "Content-Type": "text/plain" });
                console.log(`Ответ - ${data}`);
                response.end(data);
              })
              .catch((err: any) => {
                console.log(err);
              });
          }
        });
        break;
      }
    }
    const strUrl: string = <string>request.url?.toString().substring(0, 7);
    console.log(strUrl);
    if (strUrl === "/?code=") {
      // вытащить код из пришедшей url
      const position: number = <number>request.url?.toString().indexOf("&");
      console.log(position);
      const code: string = <string>request.url?.toString().slice(7, position);
      console.log(code);
      // -----------------------------------------------------------------------------------------------------------
      // функция добавления задачи
      // и запустить синхронизацию
      // ---------------------------------------------------------------------------------------------------
      syncingGoogle.initSyncing(code);
      console.log("Асцилла");
      response.writeHead(200, { "Content-Type": "text/plain" });
      response.end("2");
    }
  })
  .listen(5000);
console.log("Сервер работает");

function checkDataForm(user: User): string {
  // возвращает результат проверки - 0, проверка прошла
  // остальное состояние
  let condition = "0";
  // 1 пустые поля
  // 2 - проверка на пробелы
  // 3 - не правильная почта
  // 4 - не правильный пароль
  // 5 - пароли не совпадают
  // проверка имени
  if (!checkName(user.name)) condition = "-2";
  // проверка почты
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([а-я-a-zA-Z\-0-9]+\.)+[а-я-a-zA-Z]{2,}))$/;
  if (!re.test(user.mail)) condition = "-3";
  // проверка пароля
  const test =
    /(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*]{6,}/g;
  if (!test.test(user.password)) condition = "-4";

  if (user.password !== user.repeatPassword) {
    condition = "-5";
  }
  if (
    user.name.length === 0 ||
    user.mail.length === 0 ||
    user.password.length === 0 ||
    user.repeatPassword.length === 0
  ) {
    condition = "-1";
  }
  return condition;
}

function checkDataForm2(user: User): string {
  // возвращает результат проверки - 0, проверка прошла
  // остальное состояние
  let condition = "0";
  // 1 пустые поля
  // 2 - проверка на пробелы
  // 3 - не правильная почта
  // 4 - не правильный пароль
  // 5 - пароли не совпадают
  // проверка имени
  // проверка почты
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([а-я-a-zA-Z\-0-9]+\.)+[а-я-a-zA-Z]{2,}))$/;
  if (!re.test(user.mail)) condition = "-2";
  // проверка пароля
  const test =
    /(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*]{6,}/g;
  if (!test.test(user.password)) condition = "-3";

  if (user.password !== user.repeatPassword) {
    condition = "-4";
  }
  if (
    user.mail.length === 0 ||
    user.password.length === 0 ||
    user.repeatPassword.length === 0
  ) {
    condition = "-1";
  }
  console.log(`Cond${user.mail}`);
  console.log(`Cond${user.password}`);
  console.log(`Cond${user.repeatPassword}`);
  return condition;
}

function checkName(name: string): boolean {
  const old: string = name;
  let flag = false;
  name.replace(/[^a-zа-яё0-9\s]/gi, " ");
  name.replace(/&nbsp;/g, "");
  name.replace(/\s+/g, " ");
  name.replace(/ +/g, " ").trim();
  if (name === old) flag = true;
  return flag;
}
function createGoogleId(id: number): number {
  return 20002409 + id;
}
