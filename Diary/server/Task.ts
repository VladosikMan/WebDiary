export interface Task {
    id : number;
    id_user:number;
    task: string;
    date: string;
    status: number;
    syncing : boolean;
    id_google : number;
}