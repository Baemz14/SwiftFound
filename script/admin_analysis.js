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
const frequencyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false } // Hidden for a cleaner single-dataset presentation
    },
    scales: {
        x: {
            type: 'linear',        // Treating x-axis strictly as numeric coordinates
            position: 'bottom',
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(255,255,255,0.07)' },
            title: { display: true, text: 'User Reputation Score', color: '#94a3b8' }
        },
        y: {
            beginAtZero: true,
            ticks: { color: '#94a3b8', stepSize: 1 },
            grid: { color: 'rgba(255,255,255,0.07)' },
            title: { display: true, text: 'Frequency (User Count)', color: '#94a3b8' }
        }
    }
};

const pieChartOption = {
    responsive: true,
    maintainAspectRatio: false, 
    layout: {
        padding: 0
    },
    
    plugins: {
        legend: {
            display: true,
            labels: {
                color: '#94a3b8' 
            }
        },
        tooltip: {
            enabled: true
        }
    }
};

let claimStatusData = null;

export async function initAnalysis(stats, tables) {
    // mockUserData = await fetch('/swiftfound/mock_data/user_data.json')
    //     .then(response => response.json())
    //     .then(data => data);
    // mockItemData = await fetch('/swiftfound/mock_data/item_data.json')
    //     .then(response => response.json())
    //     .then(data => data);
    // mockClaimData = await fetch('/swiftfound/mock_data/claim_data.json')
    //     .then(response => response.json())
    //     .then(data => data);
    // mockMessageData = await fetch('/swiftfound/mock_data/message_data.json')
    //     .then(response => response.json())
    //     .then(data => data);
    // mockReportData = await fetch('/swiftfound/mock_data/report_data.json')
    //     .then(response => response.json())
    //     .then(data => data);

    claimStatusData = stats['claim_breakdown'];
    console.log(claimStatusData);

    sections = {
        'user': {
            data: tables['user_table'],
            instance: userChartInstance,
            chartId: "userChart",
            borderColor: '#60a5fa',
            labelNoun: "Registrations" 
        },
        'item': {
            data: tables['item_table'],
            instance: itemChatInstance,
            chartId: "itemChart",
            borderColor: '#8b8cf7',
            labelNoun: "Items Logged"
        },
        'claim': {
            data: tables['claim_table'],
            instance: claimChatInstance,
            chartId: "claimChart",
            borderColor: '#34d399',
            labelNoun: "Claims Initiated"
        },
        'message': {
            data: tables['message_table'],
            instance: messageChatInstance,
            chartId: "messageChart",
            borderColor: '#fbbf24',
            labelNoun: "Messages Sent"
        },
        'report': {
            data: tables['report_table'],
            instance: reportChatInstance,
            chartId: "reportChart",
            borderColor: '#f87171',
            labelNoun: "Incident Reports"
        }
    };

    Object.entries(sections).forEach(([key, section]) => {
        drawChart(key);
    });

    drawClaimStatusChart();
    drawUserFreqChart();
    drawItemStatusChart();
    drawReportStatusChart();
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
    const { labels, data } = processDataByState(section.data, 'daily');

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

export async function drawClaimStatusChart() {
    let chartCanvas = document.getElementById('claimStatusChart');
    if (!chartCanvas) return;

    // Check if the instance mapped inside our config object exists and destroy it
    if (claimChatInstance) {
        claimChatInstance.destroy();
    }

    const labels = Object.keys(claimStatusData);
    const data = Object.values(claimStatusData);

    const claimStatusColors = { 
        PENDING: '#fbbf24', 
        CHATTING: '#60a5fa', 
        OWNER_CONFIRM: '#a78bfa', 
        RESOLVED: '#34d399', 
        REJECTED: '#f87171', 
        CANCELED: '#94a3b8',
        PENDING_RESOLUTION: '#f97316',
        ABANDONED: '#ec4899'
    };
    const bLabels = { 
        PENDING: 'Pending', 
        CHATTING: 'Chatting', 
        OWNER_CONFIRM: 'Owner Confirm', 
        RESOLVED: 'Resolved', 
        REJECTED: 'Rejected', 
        CANCELED: 'Canceled',
        PENDING_RESOLUTION: 'Pending Resolution',
        ABANDONED: 'Abandoned'
    };

    // Create the new canvas chart for claim status as a pie chart
    claimChatInstance = new Chart(chartCanvas, {
        type: 'pie',
        data: {
            labels: labels.map(label => bLabels[label]),
            datasets: [{
                label: "Claim Status",
                data: data,
                backgroundColor: labels.map(label => claimStatusColors[label]), // Use custom colors for each status
                borderWidth: 0
            }]
        },
        options: pieChartOption
    });
}

async function drawUserFreqChart() {
    let freqCanvas = document.getElementById('userFreqChart');
    if (!freqCanvas) return;

    try {
        const users = sections['user'].data || [];
        if (!users.length) return;

        // Group into math frequencies
        const repCounts = {};
        users.forEach(user => {
            const rep = parseInt(user.reputation, 10) || 0; 
            repCounts[rep] = (repCounts[rep] || 0) + 1;
        });

        // Map data directly to coordinates {x, y}
        const coordinateData = Object.keys(repCounts)
            .map(rep => ({
                x: Number(rep),
                y: repCounts[rep]
            }))
            .sort((a, b) => a.x - b.x);

        if (window.userFreqChartInstance) {
            window.userFreqChartInstance.destroy();
        }

        // Initialize with the separate options configuration block
        window.userFreqChartInstance = new Chart(freqCanvas, {
            type: 'line', 
            data: {
                datasets: [{
                    label: 'User Count',
                    data: coordinateData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    tension: 0.2,
                    fill: true,
                    showLine: true // Forces the line path stroke explicitly on the canvas
                }]
            },
            options: frequencyChartOptions // Uses the clean, independent linear setup
        });

    } catch (error) {
        console.error('Error rendering frequency chart:', error);
    }
}

async function drawItemStatusChart() {
    let statusCanvas = document.getElementById('itemStatusChart');
    if (!statusCanvas) return;

    // Direct access to local repository array
    const items = sections['item']?.data || [];
    
    // 1. Aggregate status counts dynamically from dataset rows
    const itemStatusCounts = {
        PENDING: 0,
        RESOLVED: 0,
        ABANDONED: 0,
        OWNER_CONFIRM: 0,
        REMOVED: 0
    };

    items.forEach(item => {
        if (item.status && itemStatusCounts[item.status] !== undefined) {
            itemStatusCounts[item.status]++;
        }
    });

    const labels = Object.keys(itemStatusCounts);
    const chartDataValues = Object.values(itemStatusCounts);

    // Styling maps matching dashboard specifications
    const itemStatusColors = {
        PENDING: '#fbbf24',       // Warm Amber
        RESOLVED: '#34d399',      // Clean Emerald
        ABANDONED: '#ec4899',     // Pink Accent
        OWNER_CONFIRM: '#a78bfa', // Lavender Purple
        REMOVED: '#f87171'        // Soft Red
    };

    const friendlyLabels = {
        PENDING: 'Pending',
        RESOLVED: 'Resolved',
        ABANDONED: 'Abandoned',
        OWNER_CONFIRM: 'Owner Confirm',
        REMOVED: 'Removed'
    };

    // 2. Safe memory clean loop on canvas tracking instance
    if (window.itemStatusChartInstance) {
        window.itemStatusChartInstance.destroy();
    }

    // 3. Render modern pie chart layout
    window.itemStatusChartInstance = new Chart(statusCanvas, {
        type: 'pie',
        data: {
            labels: labels.map(statusKey => friendlyLabels[statusKey]),
            datasets: [{
                label: "Items Status",
                data: chartDataValues,
                backgroundColor: labels.map(statusKey => itemStatusColors[statusKey]),
                borderWidth: 0
            }]
        },
        options: pieChartOption // Bound to your custom pie options object
    });
}

async function drawReportStatusChart() {
    let statusCanvas = document.getElementById('reportStatusChart');
    if (!statusCanvas) return;

    // Pull data rows from the report section repository
    const reports = sections['report']?.data || [];

    // 1. Initialize data buckets for your 3 specific statuses
    const reportStatusCounts = {
        PENDING: 0,
        ACCEPTED: 0,
        DISMISSED: 0
    };

    // Aggregate values dynamically from the dataset
    reports.forEach(report => {
        if (report.status && reportStatusCounts[report.status] !== undefined) {
            reportStatusCounts[report.status]++;
        }
    });

    const labels = Object.keys(reportStatusCounts);
    const chartDataValues = Object.values(reportStatusCounts);

    // Color definitions mapped to status meanings
    const reportStatusColors = {
        PENDING: '#fbbf24',   // Amber Warning / Awaiting Review
        ACCEPTED: '#34d399',  // Emerald Green / Confirmed Action Taken
        DISMISSED: '#94a3b8'  // Cool Slate Gray / Closed or Dropped
    };

    const friendlyLabels = {
        PENDING: 'Pending',
        ACCEPTED: 'Accepted',
        DISMISSED: 'Dismissed'
    };

    // 2. Safe memory cleanup tracking to ensure seamless chart re-renders
    if (window.reportStatusChartInstance) {
        window.reportStatusChartInstance.destroy();
    }

    // 3. Instantiate the pie chart layout
    window.reportStatusChartInstance = new Chart(statusCanvas, {
        type: 'pie',
        data: {
            labels: labels.map(statusKey => friendlyLabels[statusKey]),
            datasets: [{
                label: "Report Status",
                data: chartDataValues,
                backgroundColor: labels.map(statusKey => reportStatusColors[statusKey]),
                borderWidth: 0
            }]
        },
        options: pieChartOption // Attaches directly to your unified pie layout configuration block
    });
}