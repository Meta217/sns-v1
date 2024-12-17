// utils.js
function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function loadNames() {
    const response = await fetch('data/names.json');
    const data = await response.json();
    return data.names;
}

async function loadPrompts() {
    const response = await fetch('data/prompts.json');
    const data = await response.json();
    return data.prompts;
}