const backendUrl = 'http://localhost:3001'

// Render elements on page
function render() {
    if (localStorage.getItem("userId")) {
        document.getElementById("profile").style.display = "flex";
        document.getElementById("events").style.display = "flex";
        document.getElementById("loginLink").style.display = "none";
        document.getElementById("registerLink").style.display = "none";
        document.querySelector("#logout").style.display = "flex";
        accountStatus();
        updateList();
    } else {
        document.getElementById("profile").style.display = "none";
        document.getElementById("events").style.display = "none";
        document.getElementById("loginLink").style.display = "flex";
        document.getElementById("registerLink").style.display = "flex";
        document.querySelector("#logout").style.display = "none";
        document.querySelector('.eventList').innerHTML = "</br>";
        accountStatus();
    }
}
render();

// Register account
document.querySelector("#register").addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = document.querySelector("#name").value;
    const username = document.querySelector("#username").value;
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    const membership = document.querySelector('input[name="membership"]:checked').value;
    try {
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
        await render(); 
    } catch (err) {
        console.log(err);
    }
    document.querySelector('#register').reset();
});

// Login account
document.querySelector('#login-form').addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.querySelector('#email-username').value
    const password = document.querySelector('#password-login').value
    try {
        const response = await axios.post('http://localhost:3001/members/login',{
            email: email,
            password: password
        })
        console.log(response)
        const userId = await response.data.user
        await localStorage.setItem('userId', userId)
        render();
    } catch (error) {
        console.log(error)
    }
    document.querySelector('#login-form').reset();
});

// Logout account
document.querySelector('#logout').addEventListener('click', async (event) => {
    await localStorage.removeItem('userId')
    await render();
    await updateDropDown();
})


// Account info
document.querySelector('.account_info').addEventListener('click', () => {
    axios.get('http://localhost:3001/members/account_info',{
        headers: {
            Authorization: localStorage.getItem('userId')
        }
    }).then((response)=>{
        accountStatus();
    })
})

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

// Review events
document.querySelector('#events').addEventListener('click', async (evt)=>{
    evt.preventDefault()
    try{
        updateList();
    } catch (error) {
        console.log({error})
    }
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
async function accountStatus () {
    if(localStorage.getItem('userId')) {
        await axios.get('http://localhost:3001/members/account_info',{
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
    const tier = document.querySelector('input[name="subscription"]:checked').value;
    try {

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
            await render();
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
            await render();
            alert('Event successfully deleted')
        } catch (error) {
            console.log(error)
        }
    }
})