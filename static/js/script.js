
fetch('/static/content.json').then(res=>res.json()).then(json=>{
    document.getElementById('intro').textContent = json['description']

    json['skills'].forEach(element => {
        let node = document.createElement("img")
        node.src = element
        node.className = "skill-image highlight"
        document.getElementById('skill-container').appendChild(node)
    });

    json['projects'].forEach((element)=>{
        let node = document.createElement("div")
        node.className = 'project-card'
        let title = document.createElement("h3")
        title.textContent = element['title']
        let desc = document.createElement('p')
        desc.textContent = element['desc']
        let anchor = document.createElement("a")
        anchor.href = element['link']
        anchor.target = "_blank"
        let button = document.createElement("button")
        button.textContent = "Github"
        button.className='github'
        anchor.appendChild(button)
        node.append(title, desc, anchor)
        document.getElementById('projects-holder').appendChild(node)
    })
})