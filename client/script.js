import bot from "./assets/nova.ico";
import user from "./assets/user.svg";

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

/*prompt pendant search*/
function loader(element) {
    element.textContent = ''; 
    /*add 3 petit point */
    loadInterval = setInterval(() => {
        element.textContent += '.';
   
    /*reset si 4 petit point */
    if (element.textContent === '....') {
        element.textContent = '';
        }
    }, 300)
}

/*ecrire reponse lettre par lettre*/
function typeText(element, text) {
    let index = 0;

    let interval = setInterval(() => {
        if (index < text.length) {
            /*get the character*/
            element.innerHTML += text.charAt(index);
            index++
        } else {
            clearInterval(interval);
        }
    }, 20)
}
/*generer id unique pr message*/
function generateUniqueId() {
    /*giga random*/
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);
    
    return `id-${timestamp}-${hexadecimalString}`;
} 
 
/*mise en forme du message*/
function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}

const handleSubmit = async (e) => {
    /*eviter reloading page*/
    e.preventDefault();

    const data = new FormData(form);

    /*chat stripe pour user*/
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

    form.reset();

    /*chat stripe pour Nova*/
    const uniqueId = generateUniqueId();
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

    chatContainer.scrollTop = chatContainer.scrollHeight;
    const messageDiv = document.getElementById(uniqueId); 

    loader(messageDiv); 

    //fetch reponse du bot sur le serv

    const response = await fetch('https://nova-ieoy.onrender.com/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })

    clearInterval(loadInterval);
    messageDiv.innerHTML = " ";

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim();

        typeText(messageDiv, parsedData);
    } else {
        const err = await response.text();

        messageDiv.innerHTML = "something went wrong";
        alert(err);
    }
}

/*envoyer si le submit est appuyer*/
form.addEventListener('submit', handleSubmit); 
/*envoyer si "entrer" est appuyer*/
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e);
    }
})
