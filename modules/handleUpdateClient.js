import { CLIENTS } from "../index.js";
import { sendData, sendError } from "./send.js";
import fs from 'node:fs/promises';

export const handleUpdateClient = (req, res, segments) => {
    let body = '';
    const ticket = segments[1];
    try {
        req.on('data', chunk => {
            body += chunk;

        })
    } catch (error) {
        console.log('Ошибка при чтении запроса');
        sendError(res, 500, "Ошибка сервера при чтении запроса");
    }

    req.on("end", async () => {
        try {
            const updatedClient = JSON.parse(body);
            
            if (!updatedClient.fullName || !updatedClient.phone || !updatedClient.ticket) {
                sendError(res, 400, "Неверные основные данные");
                return;
            } 

            if (!updatedClient.booking && !Array.isArray(updatedClient.booking)) {
                sendError(res, 400, "Нет списка бронирования");
                return;
            }

            if (!updatedClient.booking.length) {
                sendError(res, 400, "Нет ни одного бронирования");
                return;
            }
            
            if ((!updatedClient.booking.every(item => item.comedian && item.time))) {
                sendError(res, 400, "Неверные детали бронирования");
                return;
            }

            const clientData = await fs.readFile(CLIENTS, 'utf-8');
            const clients = JSON.parse(clientData);

            const clientIndex = clients.findIndex(c => c.ticket === ticket);
            
            if (clientIndex === -1) {
                sendError(res, 404, "Клиент с таким билетом не найден");
            }
            clients[clientIndex] = {
                ...clients[clientIndex],
                ...updatedClient
            }

            await fs.writeFile(CLIENTS, JSON.stringify(clients))
            sendData(res, clients[clientIndex]);

        } catch (error) {
            console.error(`error: ${error}`);
            sendError(res, 500, "Ошибка сервера при обновлении данных");
        }
    });
}