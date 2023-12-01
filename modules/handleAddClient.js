import { CLIENTS } from "../index.js";
import { sendData, sendError } from "./send.js";
import fs from 'node:fs/promises';

export const handleAddClient = (req, res) => {
    let body = '';

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
            const newClient = JSON.parse(body);
            
            if (!newClient.fullName || !newClient.phone || !newClient.ticket) {
                sendError(res, 400, "Неверные основные данные");
                return;
            } 

            if (!newClient.booking && !Array.isArray(newClient.booking)) {
                sendError(res, 400, "Нет списка бронирования");
                return;
            }

            if (!newClient.booking.length) {
                sendError(res, 400, "Нет ни одного бронирования");
                return;
            }
            
            if ((!newClient.booking.every(item => item.comedian && item.time))) {
                sendError(res, 400, "Неверные детали бронирования");
                return;
            }

            const clientData = await fs.readFile(CLIENTS, 'utf-8');
            const clients = JSON.parse(clientData);
            
            clients.push(newClient);

            await fs.writeFile(CLIENTS, JSON.stringify(clients))
            sendData(res, clients);

        } catch (error) {
            console.log("error: ", error);
        }
    });
}