import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

// Simple test command
const TEST_COMMAND = {
    name: 'test',
    description: 'Basic command',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
};

const GAMESERVER_COMMAND = {
    name: "gameserver",
    description: "Steuere einen Game-Server über Proxmox",
    options: [
        {
            name: "aktion",
            description: "Was soll gemacht werden?",
            type: 3, // STRING
            required: true,
            choices: [
                { name: "start", value: "start" },
                { name: "stop", value: "stop" },
                { name: "restart", value: "restart" }
            ]
        },
        {
            name: "server",
            description: "Welcher Server soll gesteuert werden?",
            type: 3, // STRING
            required: true,
            choices: [
                { name: "Enshrouded", value: "301" },
            ],
        },
    ],
};


const ALL_COMMANDS = [TEST_COMMAND, GAMESERVER_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);