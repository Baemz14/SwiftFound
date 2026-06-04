import { callServer } from "../include/call_server.js";

export async function loadNewStats(loadedStats = null) {
    let data = await callServer('/swiftfound/server_call/admin_call.php', null, "GET_STATS");
    let stats = data['stats'];
    let newStats = {};
    if (!loadedStats) {
        return stats;
    }
    for (let key in stats) {
        if (key == 'claim_breakdown') {
            let isUpdate = false;
            for (let cat in stats[key]) {
                if (loadedStats[key][cat] != stats[key][cat]) {
                    isUpdate = true;
                }
            } if (isUpdate) {
                newStats[key] = stats[key];
            }
            continue;
        }
        if (stats[key] != loadedStats[key]) {
            newStats[key] = stats[key];
        }
    }
    return newStats;
}

export async function loadNewReports(loadedReports = null) {
    let data = await callServer('/swiftfound/server_call/admin_call.php', null, "GET_REPORTS");
    let reports = data['reports'];
    if (!loadedReports) {
        return reports;
    } if (reports.length === loadedReports.length) {
        return [];
    } if (reports.length < loadedReports.length) {
        return [];
    }
    reports.splice(0, reports.length - loadedReports.length);
    return reports;
}

export async function loadNewUsers(loadedUsers = null) {
    let data = await callServer('/swiftfound/server_call/admin_call.php', null, "GET_USERS");
    let users = data['users'];
    if (!loadedUsers) {
        return users;
    } if (users.length === loadedUsers.length) {
        return [];
    } if (users.length < loadedUsers.length) {
        return [];
    }
    users.splice(0, users.length - loadedUsers.length);
    return users;
}

export async function loadUpdatedUsers(loadedUsers) {
    let data = await callServer('/swiftfound/server_call/admin_call.php', null, "GET_USERS");
    let users = data['users'];
    let userMap = loadedUsers.map(u => (u.user_id, u));
    let updatedUsers = [];
    for (let i = 0; i < users.length; i++) {
        let u = users[i];
        let lu = userMap[u.user_id];
        if (!lu) continue;
        for (const key in u) {
            if (u[key] != lu[key]) {
                updatedUsers.push(u);
                break;
            }
        }
    }
    return updatedUsers;
}