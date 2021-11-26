const backendUrl = 'http://localhost:3001'

// --- DOM ELEMENTS ---
// Cards
const loginCard = document.querySelector('.loginRegisterWrap');
const eventCard = document.querySelector('.eventWrap');
const accountCard = document.querySelector('.accountWrap');
const homeCard = document.querySelector('.homeWrap');

// Navigation
const homeNav = document.querySelector('#home');
const loginNav = document.querySelector('#registerLink');
const profileNav = document.querySelector('#profile');
const eventNav = document.querySelector('#events');
const logoutNav = document.querySelector('#logout');


// --- RENDER ---
// Navigation
function render() {
    if (localStorage.getItem("userId")) {
        profileNav.style.display = "flex";
        eventNav.style.display = "flex";
        loginNav.style.display = "none";
        logoutNav.style.display = "flex";
    } else {
        profileNav.style.display = "none";
        eventNav.style.display = "none";
        loginNav.style.display = "flex";
        logoutNav.style.display = "none";
        document.querySelector('#eventList').innerHTML = "";
    }
}

function removeActive() {
    homeNav.classList.remove('active')
    loginNav.classList.remove('active')
    eventNav.classList.remove('active')
    profileNav.classList.remove('active')
}

showHome();

function showHome() {
    removeActive();
    document.querySelector('#home').classList.add('active')

    homeCard.style.display = 'flex';
    eventCard.style.display = 'none';
    accountCard.style.display = 'none';
    loginCard.style.display = 'none';
    render();
}

function showEvents() {
    removeActive()
    document.querySelector('#events').classList.add('active')

    homeCard.style.display = 'none';
    eventCard.style.display = 'flex';
    accountCard.style.display = 'none';
    loginCard.style.display = 'none';

    render();
    updateList();
    updateDropDown();
}

function showAccount() {
    removeActive()
    document.querySelector('#profile').classList.add('active')

    homeCard.style.display = 'none';
    eventCard.style.display = 'none';
    accountCard.style.display = 'flex';
    loginCard.style.display = 'none';

    render();
    accountStatus();

}

function showLogin() {
    removeActive()
    document.querySelector('#registerLink').classList.add('active')

    homeCard.style.display = 'none';
    eventCard.style.display = 'none';
    accountCard.style.display = 'none';
    loginCard.style.display = 'flex';

    render();
}


// --- DOM FUNCTIONS ---
// Home
homeNav.addEventListener('click', async (evt)=>{
    await showHome(); 
})

// Register/Login
loginNav.addEventListener('click', async (evt)=>{
    await showLogin();
})

// Account Info
profileNav.addEventListener('click', async (evt)=>{
    await showAccount();
})

// Events Link
eventNav.addEventListener('click', async (evt)=>{
    await showEvents();
})

// Logout account
logoutNav.addEventListener('click', async (event) => {
    await localStorage.removeItem('userId')
    await updateList();
    await updateDropDown();
    await showLogin();
    alert('Logout successful')
})


// --- CARD FUNCTIONS ---
// Register account
document.querySelector("#registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const name = document.querySelector("#name").value;
        const username = document.querySelector("#username").value;
        const email = document.querySelector("#email").value;
        const password = document.querySelector("#password").value;
        const membership = document.querySelector('input[name="membership"]:checked').value;

        const response = await axios.post(backendUrl + '/members', {
            name: name,
            username: username,
            email: email,
            password: password,
            level: membership
        });
        const userId = await response.data.userId
        await localStorage.setItem('userId', userId)
        document.querySelector('#registerForm').reset();
        await showEvents();
    } catch (error) {
        console.log({error})
        alert('Please ensure all information is filled out and correct')
    }
});


// Login account
document.querySelector('#loginForm').addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const email = document.querySelector('#email-username').value
        const password = document.querySelector('#password-login').value

        const response = await axios.post(backendUrl + '/members/login',{
            email: email,
            password: password
        })
        const userId = await response.data.user
        await localStorage.setItem('userId', userId)
        document.querySelector('#loginForm').reset();
        showEvents();
    } catch (error) {
        console.log({error})
        alert('Account not found')
    }
});


// Create event
document.querySelector('#createEvent').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
    const date = document.querySelector('#createDate').value
    const location = document.querySelector('#createLocation').value
    const description = document.querySelector('#title').value
    const user = localStorage.getItem('userId')

    const createEvent = await axios({
        method: 'post',
        url: backendUrl + '/events',
        data: {
            date: date,
            location: location,
            description: description
        },
        headers: { 
            Authorization: user
        }
    })
    } catch (error) {
        console.log({error})
    }
    document.querySelector('#createEvent').reset();
    updateList();
})


// Update Event List
async function updateList() {
    try{
        const axiosObject = await axios.get(backendUrl + '/members/events', {
            headers: {
                Authorization: localStorage.getItem('userId')
            }
        })
        const eventList = axiosObject.data.allEvents
        if (eventList !== undefined) {
            updateDropDown(eventList);
            document.querySelector('#eventList').innerHTML = "";
            for (let i = 0; i < eventList.length; i++) {
                let eventDiv = document.createElement("div");
                let eventId = document.createTextNode(`Event ID: ${eventList[i].id}`);
                let eventTitle = document.createTextNode(`Title: ${eventList[i].description}`);
                let eventDate = document.createTextNode(`Date: ${eventList[i].date.substring(0,10)}`);
                let eventLocation = document.createTextNode(`Location: ${eventList[i].location}`);
                eventDiv.appendChild(eventId);
                eventDiv.appendChild(document.createElement("br"));
                eventDiv.appendChild(eventTitle);
                eventDiv.appendChild(document.createElement("br"));
                eventDiv.appendChild(eventDate);
                eventDiv.appendChild(document.createElement("br"));
                eventDiv.appendChild(eventLocation);
                eventDiv.appendChild(document.createElement("br"));
                eventDiv.appendChild(document.createElement("br"));
                const eventsList = document.querySelector("#eventList");
                eventsList.appendChild(eventDiv);
            }
        }
    } catch (error) {
        console.log({error})
    }
}


// Update delete event dropdown entries
async function updateDropDown (eventList) {
    document.querySelector('#eventIdent').innerHTML = "";

    if (eventList) {
        let idList = eventList.map((element) => {
            return element.id
        })
        for (let i = 0; i < idList.length; i++) {
            let option = document.createElement('option');
            option.text = idList[i];
            option.value = idList[i];
            const select = document.querySelector('#eventIdent');
            select.appendChild(option)
        }
    }
}


// Update account status functions
function accountStatus () {
    if(localStorage.getItem('userId')) {
        axios.get(backendUrl + '/members/account_info',{
                headers: {
                    Authorization: localStorage.getItem('userId')
                }
        }).then((response)=>{
            document.querySelector('#welcome').innerText = `Welcome back, ${response.data.user.name}!`
            document.querySelector('#statusName').innerText = `Name: ${response.data.user.name}`
            document.querySelector('#statusUsername').innerText = `Username: ${response.data.user.username}`
            document.querySelector('#statusEmail').innerText = `Email: ${response.data.user.email}`
            document.querySelector('#statusSubscription').innerText = `Subscription level: ${response.data.user.level}`
        })
    } else {
        document.querySelector('#welcome').innerText = `Welcome back, !`
        document.querySelector('#statusName').innerText = `Name: `
        document.querySelector('#statusUsername').innerText = `Username: `
        document.querySelector('#statusEmail').innerText = `Email: `
        document.querySelector('#statusSubscription').innerText = `Subscription level: `
    }
}


// Update subscription
document.querySelector("#change-subscription").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const tier = document.querySelector('input[name="subscription"]:checked').value;

        const createEvent = await axios({
            method: 'put',
            url: backendUrl + '/members',
            data: {
                level: tier
            },
            headers: { 
                Authorization: localStorage.getItem('userId')
            }
        })
        accountStatus();
    } catch (error) {
        console.log({error});
    }
})


// Delete account
document.querySelector('#deleteAccount').addEventListener('click', async (event) => {
    event.preventDefault();
    if ( ! confirm("Are you sure?")) {
        event.preventDefault();
    } else {
        try {
            const deleteAccount = await axios.delete(backendUrl + '/members', {
                headers: {
                    Authorization: localStorage.getItem('userId')
                }
            })
            await localStorage.removeItem('userId')
            showLogin();
            alert('Account successfully deleted')
        } catch (error) {
            console.log({error})
        }
    }
})


// Delete event
document.querySelector('#deleteEvent').addEventListener('submit', async (event) => {
    event.preventDefault();
    if ( ! confirm("Are you sure?")) {
        event.preventDefault();
    } else {
        try {
            const eventId = document.querySelector('#eventId').value;
            const deleteEvent = await axios({
                method: 'delete',
                url: backendUrl + '/events', 
                data: {
                    id: eventId
                },
                headers: {
                    Authorization: localStorage.getItem('userId')
                }
            })
            await showEvents();
            alert('Event successfully deleted')
        } catch (error) {
            console.log({error})
        }
    }
})