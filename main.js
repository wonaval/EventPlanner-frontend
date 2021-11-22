const backendURL = 'http://localhost:3001'

// Render elements on page
function render() {
    if (localStorage.getItem("userId")) {
        document.querySelector("#profile").style.display = "flex";
        document.querySelector("#events").style.display = "flex";
        document.querySelector("#registerLink").style.display = "none";
        document.querySelector("#logout").style.display = "flex";
    } else {
        document.querySelector("#profile").style.display = "none";
        document.querySelector("#events").style.display = "none";
        document.querySelector("#registerLink").style.display = "flex";
        document.querySelector("#logout").style.display = "none";
        document.querySelector('.eventList').innerHTML = "</br>";
    }
}
render();
showHome(); 

function showHome() {
    document.querySelector('.createEvent').style.display = 'none';
    document.querySelector('.account_info').style.display = 'none';
    document.querySelector('.loginForm').style.display = 'none';
    document.querySelector('.register').style.display = 'none';
}

function showEvents() {
    document.querySelector('.createEvent').style.display = 'block';
    document.querySelector('.account_info').style.display = 'none';
    document.querySelector('.loginForm').style.display = 'none';
    document.querySelector('.register').style.display = 'none';
    render();
    updateList();
    updateDropDown();
}

function showAccount() {
    document.querySelector('.createEvent').style.display = 'none';
    document.querySelector('.account_info').style.display = 'block';
    document.querySelector('.loginForm').style.display = 'none';
    document.querySelector('.register').style.display = 'none';
    render();
    accountStatus();

}

function showLogin() {
    document.querySelector('.createEvent').style.display = 'none';
    document.querySelector('.account_info').style.display = 'none';
    document.querySelector('.loginForm').style.display = 'block';
    document.querySelector('.register').style.display = 'block';
    render();
}

// Navigation - .register/.loginForm/.createEvent/.account_info
// Home
document.querySelector('#home').addEventListener('click', async (evt)=>{
    await showHome(); 
})

// Register/Login
document.querySelector('#registerLink').addEventListener('click', async (evt)=>{
    await showLogin();
})

// Account Info
document.querySelector('#profile').addEventListener('click', async (evt)=>{
    await showAccount();
})

// Events Link
document.querySelector('#events').addEventListener('click', async (evt)=>{
    await showEvents();
})

// Logout account
document.querySelector('#logout').addEventListener('click', async (event) => {
    await localStorage.removeItem('userId')
    await updateList();
    await updateDropDown();
    await showLogin();
    alert('Logout successful')
})



// PAGE FUNCTIONS
// Register account
document.querySelector("#register").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const name = document.querySelector("#name").value;
        const username = document.querySelector("#username").value;
        const email = document.querySelector("#email").value;
        const password = document.querySelector("#password").value;
        const membership = document.querySelector('input[name="membership"]:checked').value;

        const response = await axios.post("http://localhost:3001/members", {
            name: name,
            username: username,
            email: email,
            password: password,
            level: membership
        });
        const userId = await response.data.userId
        await localStorage.setItem('userId', userId)
        document.querySelector('#register').reset();
        await showEvents();
    } catch (error) {
        console.log({error})
        alert('Please ensure all information is filled out and correct')
    }
});

// Login account
document.querySelector('#login-form').addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const email = document.querySelector('#email-username').value
        const password = document.querySelector('#password-login').value

        const response = await axios.post('http://localhost:3001/members/login',{
            email: email,
            password: password
        })
        console.log(response)
        const userId = await response.data.user
        await localStorage.setItem('userId', userId)
        document.querySelector('#login-form').reset();
        showEvents();
    } catch (error) {
        console.log(error)
        alert('Account not found')
    }
});

// Create event
document.querySelector('#createEvent').addEventListener('submit', async (event) => {
    event.preventDefault();

    const date = document.querySelector('#createDate').value
    const location = document.querySelector('#createLocation').value
    const description = document.querySelector('#decription').value
    const user = localStorage.getItem('userId')

    try {
    const createEvent = await axios({
        method: 'post',
        url: 'http://localhost:3001/events',
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
        const axiosObject = await axios.get('http://localhost:3001/members/events', {
            headers: {
                Authorization: localStorage.getItem('userId')
            }
        })
        const eventList = axiosObject.data.allEvents
        if (eventList !== undefined) {
            updateDropDown(eventList);
            document.querySelector('.eventList').innerHTML = "";
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
                const eventsList = document.querySelector(".eventList");
                eventsList.appendChild(eventDiv);
            }
        }
    } catch (error) {
        console.log(error)
    }
}

// Update delete event dropdown entries
async function updateDropDown (eventList) {

    document.querySelector('#eventId').innerHTML = "";
    if (eventList) {
        let idList = eventList.map((element) => {
            return element.id
        })
        for (let i = 0; i < idList.length; i++) {
            let option = document.createElement('option');
            option.text = idList[i];
            option.value = idList[i];
            const select = document.querySelector('#eventId');
            select.appendChild(option)
        }
    }
}

// Update account status functions
function accountStatus () {
    if(localStorage.getItem('userId')) {
        axios.get('http://localhost:3001/members/account_info',{
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
            url: 'http://localhost:3001/members',
            data: {
                level: tier
            },
            headers: { 
                Authorization: localStorage.getItem('userId')
            }
        })
        accountStatus();
    } catch (err) {
        console.log(err);
    }
})

// Delete account
document.querySelector('#deleteAccount').addEventListener('click', async (event) => {
    event.preventDefault();
    if ( ! confirm("Are you sure?")) {
        event.preventDefault();
    } else {
        try {
            const deleteAccount = await axios.delete('http://localhost:3001/members', {
                headers: {
                    Authorization: localStorage.getItem('userId')
                }
            })
            await localStorage.removeItem('userId')
            showLogin();
            alert('Account successfully deleted')
        } catch (error) {
            console.log(error)
        }
    }
})

// Delete event
document.querySelector('.deleteEvent').addEventListener('submit', async (event) => {
    event.preventDefault();
    if ( ! confirm("Are you sure?")) {
        event.preventDefault();
    } else {
        try {
            const eventId = document.querySelector('#eventId').value;
            const deleteEvent = await axios({
                method: 'delete',
                url: 'http://localhost:3001/events', 
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
            console.log(error)
        }
    }
})