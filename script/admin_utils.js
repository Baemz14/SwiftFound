import { callServer } from "../include/call_server.js";
import * as userUtils from './user_utils.js';

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

export async function loadAnalysisTables(loadedTables = null) {
    let data = await callServer('/swiftfound/server_call/admin_call.php', null, "GET_ANALYSIS_TABLES");
    let freshTables = data['tables'];

    if (!loadedTables) {
        return freshTables;
    }
    for (let sectionKey in freshTables) {
        
        if (!loadedTables[sectionKey]) {
            return freshTables;
        }
        if (JSON.stringify(freshTables[sectionKey]) !== JSON.stringify(loadedTables[sectionKey])) {
            return freshTables;
        }
    }

    return null;
}

export async function loadNewReports(loadedReports = null) {
    let data = await callServer('/swiftfound/server_call/admin_call.php', null, "GET_REPORTS");
    let reports = data['reports'];
    if (!loadedReports) {
        return reports;
    } if (reports.length <= loadedReports.length) {
        return [];
    }
    reports.splice(0, loadedReports.length);
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
    users.splice(0, loadedUsers.length);
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

export async function getReport(report_id) {
    let formData = new FormData();
    formData.append('report_id', report_id);
    let data = await callServer('/swiftfound/server_call/admin_call.php', formData, "GET_REPORT");
    if (!data.report) {
        throw new Error(`report fethc error: ${data.error_log}`);
    } return data.report;
}

export async function dismissReport(report) {
    let formData = new FormData();
    formData.append('report_id', report.report_id);
    formData.append('status', 'DISMISSED');
    let data = await callServer('/swiftfound/server_call/admin_call.php', formData, "UPDATE_REPORT_STATUS");
    if (!data['is_success']) {
        console.error(`dismiss report server error: ${data['error_log']}`);
        return false;
    }
    return true;
}

export async function acceptReport(report) {
    let formData = new FormData();
    formData.append('report_id', report.report_id);
    formData.append('status', 'ACCEPTED');
    let data = await callServer('/swiftfound/server_call/admin_call.php', formData, "UPDATE_REPORT_STATUS");
    if (!data['is_success']) {
        console.error(`accept report server error: ${data['error_log']}`);
        return false;
    }
    formData.append('item_id', report.reported_item_id);
    data = await callServer('/swiftfound/server_call/admin_call.php', formData, "REMOVE_ITEM");
    if (!data['is_success']) {
        console.error(`remove item server error: ${data['error_log']}`);
        return false;
    }
    let isUpdated = await userUtils.updateReputation(report.reported_user_id, -15);
    if (!isUpdated) {
        console.error(`update rep server error`);
        return false;
    }
    return true;
}

export async function userRestrictUpdate(user, isRestricted) {
    let formData = new FormData();
    formData.append('user_id', user.user_id);
    formData.append('is_restricted', isRestricted);
    let data = await callServer('/swiftfound/server_call/admin_call.php', formData, "USER_RESTRICT_UPDATE");
    if (!data['is_success']) {
        console.error(`update user restrict error: ${data['error_log']}`);
        return false;
    } return true;
}