let user = null;
let tickets = [];
let agents = ['agent1']; // Simple agent simulation

// Elements
const authContainer = document.getElementById('authContainer');
const dashboardContainer = document.getElementById('dashboardContainer');
const authForm = document.getElementById('authForm');
const usernameInput = document.getElementById('username');
const welcomeMsg = document.getElementById('welcomeMsg');
const ticketForm = document.getElementById('ticketForm');
const ticketTitle = document.getElementById('ticketTitle');
const ticketDesc = document.getElementById('ticketDesc');
const ticketList = document.getElementById('ticketList');
const logoutBtn = document.getElementById('logoutBtn');

// Auth
authForm.addEventListener('submit', e => {
    e.preventDefault();
    user = { name: usernameInput.value.trim() };
    usernameInput.value = '';
    showDashboard();
});

function showDashboard() {
    if (!user) return;
    authContainer.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');
    welcomeMsg.innerText = `Welcome, ${user.name}`;
    renderTickets();
}

// Logout
logoutBtn.addEventListener('click', () => {
    user = null;
    authContainer.classList.remove('hidden');
    dashboardContainer.classList.add('hidden');
    ticketList.innerHTML = '';
});

// Create ticket
ticketForm.addEventListener('submit', e => {
    e.preventDefault();
    const title = ticketTitle.value.trim();
    const desc = ticketDesc.value.trim();
    if (!title || !desc) return;

    const ticket = {
        id: Date.now(),
        user: user.name,
        title,
        desc,
        status: 'open',
        assigned: null,
        replies: [],
        created: new Date()
    };
    tickets.unshift(ticket);
    ticketTitle.value = '';
    ticketDesc.value = '';
    renderTickets();
});

// Render ticket list
function renderTickets() {
    ticketList.innerHTML = '';
    if (!user) return;
    const myTickets = tickets.filter(t => t.user === user.name);

    if (!myTickets.length) {
        ticketList.innerHTML = `<li>No tickets yet. Create one above!</li>`;
        return;
    }

    myTickets.forEach(ticket => {
        const li = document.createElement('li');
        li.className = 'ticket-item';
        li.innerHTML = `
            <div class="ticket-title">
                ${ticket.title}
                <span class="ticket-status status-${statusClass(ticket.status)}">${statusLabel(ticket.status)}</span>
            </div>
            <div class="ticket-desc">${ticket.desc}</div>
            <div>Created: ${ticket.created.toLocaleString()}</div>
            <div>Agent: <b>${ticket.assigned ? ticket.assigned : '-'}</b></div>
            <div class="ticket-actions">
                ${
                    ticket.status === 'open' ? 
                    '<button class="pickupBtn" data-id="'+ticket.id+'">Mark In Progress (Agent)</button>' 
                    : ''
                }
                ${
                    ticket.status === 'inprogress' ? 
                    '<button class="closeBtn" data-id="'+ticket.id+'">Close Ticket (Agent)</button>' 
                    : ''
                }
            </div>
            <div class="reply-section">
                <div class="replies">
                    ${ticket.replies.map(r => `<div class="reply-msg"><b>${r.user}:</b> ${r.msg}</div>`).join('')}
                </div>
                ${
                    ticket.status !== 'closed' ?
                    `
                    <form class="replyForm" data-id="${ticket.id}">
                        <input type="text" class="replyInput" placeholder="Type your reply..." />
                        <button type="submit">Reply</button>
                    </form>
                    `
                    : ''
                }
            </div>
        `;
        ticketList.appendChild(li);
    });

    attachTicketActions();
}

// Status helpers
function statusClass(status) {
    if (status === 'open') return 'open';
    if (status === 'inprogress') return 'inprogress';
    return 'closed';
}
function statusLabel(status) {
    if (status === 'open') return 'Open';
    if (status === 'inprogress') return 'In Progress';
    return 'Closed';
}

// Ticket actions (Agent can be simulated as the first registered user, for demo)
function attachTicketActions() {
    document.querySelectorAll('.pickupBtn').forEach(btn => {
        btn.onclick = () => {
            const id = Number(btn.dataset.id);
            const ticket = tickets.find(t => t.id === id);
            if (ticket && !ticket.assigned) {
                ticket.status = 'inprogress';
                ticket.assigned = agents[0]; // Assign to dummy agent
                renderTickets();
            }
        };
    });
    document.querySelectorAll('.closeBtn').forEach(btn => {
        btn.onclick = () => {
            const id = Number(btn.dataset.id);
            const ticket = tickets.find(t => t.id === id);
            if (ticket) {
                ticket.status = 'closed';
                renderTickets();
            }
        };
    });
    // Reply logic
    document.querySelectorAll('.replyForm').forEach(form => {
        form.onsubmit = e => {
            e.preventDefault();
            const id = Number(form.dataset.id);
            const input = form.querySelector('.replyInput');
            const msg = input.value.trim();
            if (!msg) return;
            const ticket = tickets.find(t => t.id === id);
            if (ticket) {
                ticket.replies.push({ user: user.name, msg });
                input.value = '';
                renderTickets();
            }
        };
    });
}

// DEMO: Pre-populate as 'support agent' if username = 'agent1'
window.onload = () => {
    if (location.hash === '#agent') {
        user = { name: 'agent1' }; // Simulated agent
        showDashboard();
    }
};
