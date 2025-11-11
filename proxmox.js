import axios from "axios";
import https from "https";

export async function proxmoxAction(action, vmid) {
    let endpoint = "";
    switch (action) {
        case "start":
            endpoint = `/nodes/proxmox/qemu/${vmid}/status/start`;
            break;
        case "stop":
            endpoint = `/nodes/proxmox/qemu/${vmid}/status/shutdown`;
            break;
        case "restart":
            endpoint = `/nodes/proxmox/qemu/${vmid}/status/reboot`;
            break;
        default:
            throw new Error("Ungültige Aktion!");
    }

    try {
        await axios.post(`${process.env.PROXMOX_URL}${endpoint}`, {}, {
            headers: {
                Authorization: `PVEAPIToken=${process.env.PROXMOX_USER}=${process.env.PROXMOX_TOKEN}`
            },
            httpsAgent: new https.Agent({ rejectUnauthorized: false })
        });
    } catch (err) {
        console.error("❌ Proxmox Error:", err.response?.data || err.message);
        throw err;
    }
}