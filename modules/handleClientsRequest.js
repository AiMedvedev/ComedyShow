import { CLIENTS } from "../index.js";
import { sendData, sendError } from "./send.js";
import fs from 'node:fs/promises';

export const handleClientsRequest = async (req, res, ticket) => {
    try {
        const clientsData = await fs.readFile(CLIENTS, 'utf-8');
        const clients = JSON.parse(clientsData);
        const client = clients.find(c => c.ticket === ticket);

        if(!client) {
            sendError(res, 404, "Клиент с таким билетом отсутствует");
            return;
        }

        sendData(res, client);
    } catch (error) {
        console.error(`Ошибка при обработке запроса ${error}`);
        sendError(res, 500, "Ошибка сервера при запросе клиента");
    }
}   