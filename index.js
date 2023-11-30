import http from 'node:http';
import fs from 'node:fs/promises';
import { sendError } from './modules/send.js';
import { checkFileExist, createFileIfNotExist } from './modules/checkFile.js';
import { handleAddClient } from './modules/handleAddClient.js';
import { handleComediansRequest } from './modules/handleComediansRequest.js';
import { handleClientsRequest } from './modules/handleClientsRequest.js';
import { handleUpdateClient } from './modules/handleUpdateClient.js';

const PORT = 8080;
const COMEDIANS = './comedians.json';
export const CLIENTS = './clients.json';


const startServer = async () => {
    if (!(await checkFileExist(COMEDIANS))) {
        return;
    }

    await createFileIfNotExist(CLIENTS);

    const comediansData = await fs.readFile(COMEDIANS, "utf-8");
    const comedians = JSON.parse(comediansData);

    http.createServer(async (req, res) => {
       try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

        const segments = req.url.split("/").filter(Boolean);

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