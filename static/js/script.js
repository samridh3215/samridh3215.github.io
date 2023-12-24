
fetch('/static/content.json').then(res=>res.json()).then(json=>{
    document.getElementById('intro').textContent = json['description']

    json['skills'].forEach(element => {
        let node = document.createElement("img")
        node.src = element
        node.className = "skill-image highlight"
        document.getElementById('skill-container').appendChild(node)
    });
})