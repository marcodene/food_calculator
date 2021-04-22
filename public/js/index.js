import data from "/public/js/db.js"
console.log(data)
console.log(data.length)

var template = document.querySelector("#template-esempio").innerHTML
const main = document.querySelector(".main")
console.log(main)

let i;
for(i = 0; i < data.length; i ++){
    var html = Mustache.render(template, data[i])

    main.insertAdjacentHTML("beforeend", html)
}

