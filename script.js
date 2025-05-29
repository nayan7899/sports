const API_BASE_URL = 'https://www.balldontlie.io/api/v1/games';

const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const matchesContainer = document.getElementById('matchesContainer');
const refreshBtn = document.getElementById('refreshBtn');

let matchesData = [];

const mockMatches = [
    {
        id: 1,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        home_team: { id: 1, full_name: "Los Angeles Lakers", abbreviation: "LAL" },
        visitor_team: { id: 2, full_name: "Boston Celtics", abbreviation: "BOS" },
        season: 2024,
        status: "Upcoming"
    },
    {
        id: 2,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        home_team: { id: 3, full_name: "Golden State Warriors", abbreviation: "GSW" },
        visitor_team: { id: 4, full_name: "Miami Heat", abbreviation: "MIA" },
        season: 2024,
        status: "Upcoming"
    },
    {
        id: 3,
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        home_team: { id: 5, full_name: "Chicago Bulls", abbreviation: "CHI" },
        visitor_team: { id: 6, full_name: "New York Knicks", abbreviation: "NYK" },
        season: 2024,
        status: "Upcoming"
    },
    {
        id: 4,
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        home_team: { id: 7, full_name: "Phoenix Suns", abbreviation: "PHX" },
        visitor_team: { id: 8, full_name: "Dallas Mavericks", abbreviation: "DAL" },
        season: 2024,
        status: "Upcoming"
    },
    {
        id: 5,
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        home_team: { id: 9, full_name: "Denver Nuggets", abbreviation: "DEN" },
        visitor_team: { id: 10, full_name: "Milwaukee Bucks", abbreviation: "MIL" },
        season: 2024,
        status: "Upcoming"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    fetchMatches();
    refreshBtn.addEventListener('click', () => {
        fetchMatches();
    });
});

async function fetchMatches() {
    try {
        showLoading(true);
        hideError();
        await tryRealAPI();
    } catch (error) {
        console.error('Error fetching matches:', error);
        showApiNotice();
        useMockData();
    } finally {
        showLoading(false);
    }
}

async function tryRealAPI() {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 30);

    const startDateStr = today.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const apiUrl = `${API_BASE_URL}?start_date=${startDateStr}&end_date=${endDateStr}&per_page=25`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    matchesData = data.data || [];

    const today2 = new Date();
    const upcomingMatches = matchesData.filter(match => {
        const matchDate = new Date(match.date);
        return matchDate >= today2;
    });

    displayMatches(upcomingMatches);
}

function useMockData() {
    matchesData = mockMatches;
    displayMatches(mockMatches);
}

function showApiNotice() {
    const notice = document.createElement('div');
    notice.className = 'api-notice';
    notice.innerHTML = `
        <p><strong>Note:</strong> The BALLDONTLIE API now requires an API key. Showing demo data instead.</p>
        <p>To use real data, get an API key from <a href="https://www.balldontlie.io/" target="_blank">balldontlie.io</a></p>
    `;
    const container = document.querySelector('.container');
    const existingNotice = container.querySelector('.api-notice');
    if (existingNotice) {
        existingNotice.remove();
    }
    container.insertBefore(notice, matchesContainer);
}

function displayMatches(matches) {
    if (!matches || matches.length === 0) {
        matchesContainer.innerHTML = `
            <div class="no-matches">
                <h3>No upcoming matches found</h3>
                <p>Check back later for more games!</p>
            </div>
        `;
        return;
    }

    matches.sort((a, b) => new Date(a.date) - new Date(b.date));
    const matchesHTML = matches.map(match => createMatchCard(match)).join('');
    matchesContainer.innerHTML = matchesHTML;
}

function createMatchCard(match) {
    const matchDate = new Date(match.date);
    const formattedDate = formatDate(matchDate);
    const formattedTime = formatTime(matchDate);
    const matchStatus = getMatchStatus(match);

    return `
        <div class="match-card">
            <div class="match-header">
                <h3>NBA Game</h3>
                <span class="match-status">${matchStatus}</span>
            </div>
            <div class="teams-container">
                <div class="team">
                    <div class="team-name">${match.home_team.full_name}</div>
                    <div class="team-city">Home</div>
                </div>
                <div class="vs-separator">VS</div>
                <div class="team">
                    <div class="team-name">${match.visitor_team.full_name}</div>
                    <div class="team-city">Away</div>
                </div>
            </div>
            <div class="match-details">
                <div class="match-date"><span>Date: ${formattedDate}</span></div>
                <div class="match-time"><span>Time: ${formattedTime}</span></div>
                ${match.season ? `<div class="match-season">Season: ${match.season}</div>` : ''}
            </div>
        </div>
    `;
}

function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatTime(date) {
    const options = { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' };
    return date.toLocaleTimeString('en-US', options);
}

function getMatchStatus(match) {
    if (match.status) {
        return match.status;
    }
    const matchDate = new Date(match.date);
    const now = new Date();
    if (matchDate > now) {
        return 'Upcoming';
    } else if (matchDate.toDateString() === now.toDateString()) {
        return 'Today';
    } else {
        return 'Scheduled';
    }
}

function showLoading(show) {
    loadingEl.style.display = show ? 'block' : 'none';
}

function showError(message) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
}

function hideError() {
    errorEl.style.display = 'none';
}

function handleNetworkError() {
    showError('Network error. Please check your internet connection and try again.');
}

function refreshMatches() {
    matchesContainer.innerHTML = '';
    fetchMatches();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchMatches,
        displayMatches,
        formatDate,
        formatTime,
        getMatchStatus
    };
}
