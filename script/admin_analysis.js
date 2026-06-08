import { users } from '/swiftfound/script/admin_dashboard.js';
import Chart from 'https://cdn.jsdelivr.net/npm/chart.js/auto/+esm';

let mockUserData = null;
let userChartInstance = null;

let mockItemData = null;
let itemChatInstance = null;

let mockClaimData = null;
let claimChatInstance = null;

let mockMessageData = null;
let messageChatInstance = null;

let mockReportData = null;
let reportChatInstance = null;

let sections = {};

const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: '#94a3b8'
            }
        }
    },
    scales: {
        x: {
            ticks: {
                color: '#94a3b8'
            },
            grid: {
                color: 'rgba(255,255,255,0.07)'
            }
        },
        y: {
            ticks: {
                color: '#94a3b8'
            },
            grid: {
                color: 'rgba(255,255,255,0.07)'
            }
        }
    }
};

export async function initAnalysis() {
    mockUserData = await fetch('/swiftfound/mock_data/user_data.json')
        .then(response => response.json())
        .then(data => data);
    mockItemData = await fetch('/swiftfound/mock_data/item_data.json')
        .then(response => response.json())
        .then(data => data);
    mockClaimData = await fetch('/swiftfound/mock_data/claim_data.json')
        .then(response => response.json())
        .then(data => data);
    mockMessageData = await fetch('/swiftfound/mock_data/message_data.json')
        .then(response => response.json())
        .then(data => data);
    mockReportData = await fetch('/swiftfound/mock_data/report_data.json')
        .then(response => response.json())
        .then(data => data);

    sections = {
        'user': {
            data: mockUserData,
            instance: userChartInstance,
            chartId: "userChart",
            borderColor: '#60a5fa',
            labelNoun: "Registrations" 
        },
        'item': {
            data: mockItemData,
            instance: itemChatInstance,
            chartId: "itemChart",
            borderColor: '#8b8cf7',
            labelNoun: "Items Logged"
        },
        'claim': {
            data: mockClaimData,
            instance: claimChatInstance,
            chartId: "claimChart",
            borderColor: '#34d399',
            labelNoun: "Claims Initiated"
        },
        'message': {
            data: mockMessageData,
            instance: messageChatInstance,
            chartId: "messageChart",
            borderColor: '#fbbf24',
            labelNoun: "Messages Sent"
        },
        'report': {
            data: mockReportData,
            instance: reportChatInstance,
            chartId: "reportChart",
            borderColor: '#f87171',
            labelNoun: "Incident Reports"
        }
    };

    Object.entries(sections).forEach(([key, section]) => {
        drawChart(key);
    });
}

function processDataByState(dataArray, state) {
    // 1. Safety check: if data is empty or missing, return empty structures
    if (!dataArray || dataArray.length === 0) {
        return { labels: [], data: [] };
    }

    // 2. Sort data chronologically. It checks for 'created_at', 'timestamp', or logs.
    const sortedData = [...dataArray].sort((a, b) => {
        const dateA = new Date(a.created_at || a.timestamp || a.date);
        const dateB = new Date(b.created_at || b.timestamp || b.date);
        return dateA - dateB;
    });
    
    const intervals = {};

    sortedData.forEach(item => {
        // Fallback checks to extract the date string regardless of dataset type
        const rawDate = item.created_at || item.timestamp || item.date;
        if (!rawDate) return; // Skip row if no date property exists
        
        const dateObj = new Date(rawDate);
        let key = '';

        if (state === 'monthly') {
            key = dateObj.toLocaleString('default', { month: 'short', year: 'numeric' });
        } else if (state === 'weekly') {
            const startOfYear = new Date(dateObj.getFullYear(), 0, 1);
            const weekNum = Math.ceil((((dateObj - startOfYear) / 86400000) + startOfYear.getDay() + 1) / 7);
            key = `Wk ${weekNum}`;
        } else {
            key = dateObj.toLocaleString('default', { month: 'short', day: '2-digit' });
        }

        intervals[key] = (intervals[key] || 0) + 1;
    });

    const labels = Object.keys(intervals);
    const rawCounts = Object.values(intervals);

    return { labels, data: rawCounts };
}

export function changeChartState(type, state) {
    const section = sections[type];
    
    // Safety check if an invalid key or missing chart instance is called
    if (!section || !section.instance) return;

    // Process the specific dataset dynamically using the mapping configuration
    const { labels, data } = processDataByState(section.data, state);

    // Update the correct Chart.js instance options directly
    section.instance.data.labels = labels;
    section.instance.data.datasets[0].data = data;
    
    const capitalState = state.charAt(0).toUpperCase() + state.slice(1);
    section.instance.data.datasets[0].label = `${sections[type].labelNoun} (${capitalState})`;

    // Re-render the chart canvas surface smoothly
    section.instance.update();
}

export async function drawChart(type) {
    const section = sections[type];
    if (!section) return;

    // Fetch initial monthly processing arrays
    const { labels, data } = processDataByState(section.data, 'monthly');

    const canvasElement = document.getElementById(section.chartId);
    if (!canvasElement) return;

    // Check if the instance mapped inside our config object exists and destroy it
    if (section.instance) {
        section.instance.destroy();
    }

    // Create the new canvas chart and store the instance directly back into our configurations map
    section.instance = new Chart(canvasElement, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `${section.labelNoun} (Monthly)`,
                data: data,
                backgroundColor: section.borderColor, // Pulls the exact unique hex mapping from config
                borderRadius: 6,
                borderWidth: 0
            }]
        },
        options: commonChartOptions
    });
}