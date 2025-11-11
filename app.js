import express, {response} from 'express';
import 'dotenv/config';
import {
    InteractionResponseFlags,
    InteractionResponseType,
    InteractionType,
    MessageComponentTypes, verifyKeyMiddleware
} from "discord-interactions";
import {getRandomEmoji} from "./utils.js";
import {proxmoxAction} from "./proxmox.js";
import axios from "axios";

const app = express();
const port = process.env.PORT || 3000;



/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
    // Interaction id, type and data
    const { type, data } = req.body;
        console.log(req.body);
        /**
         * Handle verification requests
         */
        if (type === InteractionType.PING) {
            return res.send({type: InteractionResponseType.PONG});
        }

        /**
         * Handle slash command requests
         * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
         */
        if (type === InteractionType.APPLICATION_COMMAND) {
            const {name, options, member} = data;

            // "test" command
            if (name === 'test') {
                // Send a message into the channel where command was triggered from
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                        components: [
                            {
                                type: MessageComponentTypes.TEXT_DISPLAY,
                                // Fetches a random emoji to send from a helper function
                                content: `hello world ${getRandomEmoji()}`
                            }
                        ]
                    },
                });
            }

            if (name === "gameserver") {
                const allowedRoleId = process.env.ROLE_ID;

                if (!member.roles.includes(allowedRoleId)|| !member || !member.roles) {
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: "❌ Du hast keine Berechtigung, diesen Befehl zu nutzen.",
                            flags: 64 // ephemeral
                        }
                    });
                }

                const aktion = options.find(o => o.name === "aktion")?.value;
                const server = options.find(o => o.name === "server")?.value;

                try {
                    await proxmoxAction(aktion, server);
                    res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { content: `🔁 Führe Aktion **${aktion}** auf Server **${server}** aus...` }
                    });
                } catch (err) {
                    res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { content: `🔁 Error bei Aktion.` }
                    });
                }
            }

            console.error(`unknown command: ${name}`);
            return res.status(400).json({error: 'unknown command'});
        }

        console.error('unknown interaction type', type);
        return res.status(400).json({error: 'unknown interaction type'});
    });


app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});