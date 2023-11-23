import http from 'node:http';
import fs from 'node:fs/promises';
import { sendData, sendError } from './modules/send.js';
import { checkFile } from './modules/checkFile.js';
import { handleAddClient } from './modules/handleAddClient.js';
import { handleComediansRequest } from './modules/handleComediansRequest.js';
import { handleClientsRequest } from './modules/handleClientsRequest.js';
import { handleUpdateClient } from './modules/handleUpdateClient.js';

const PORT = '8080';
const COMEDIANS = './comedians.json';
export const CLIENTS = './clients.json';


const startServer = async () => {
    if (!(await checkFile(COMEDIANS))) {
        return;
    }

    await checkFile(CLIENTS, true);

    const comediansData = await fs.readFile("comedians.json", "utf-8");
    const comedians = JSON.parse(comediansData);

    http.createServer(async (req, res) => {
       try {
        const segments = req.url.split("/").filter(Boolean);  
        
        res.setHeader("Access-Control-Allow-Origin", "*");

        if (req.method === 'GET' && segments[0] === 'comedians') {
            
            handleComediansRequest(req, res, comedians, segments);
            return;
        } 

        if (req.method === 'POST' && segments[0] === 'clients') {
            handleAddClient(req, res);
            return;
        }

        if (req.method === 'GET' && segments[0] === 'clients' && segments.length === 2) {
            const ticket = segments[1];
            handleClientsRequest(req, res, ticket);
            return;
        }

        if (req.method === 'PATCH' && segments[0] === 'clients' && segments.length === 2) {
            
            handleUpdateClient(req, res, segments);
            return;
        }
        sendError(res, 404, "Сайт не найден");
       } catch (error) {
        sendError(res, 500, `Ошибка сервера: ${error}`);
       }
    }).listen(PORT);
}

startServer();

console.log("Cервер запущен на http://localhost:8080");